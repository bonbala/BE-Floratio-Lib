import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { RolesService } from 'src/roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Gán role mặc định nếu không truyền
    const roleName = registerDto.role || 'normal user';
    const role = await this.rolesService.getRoleByName(roleName);
    if (!role) throw new Error('Role not found');

    const newUser = await this.usersService.createUser({
      ...registerDto,
      password: hashedPassword,
      role: role._id,
    });

    return { message: 'User registered successfully', userId: newUser._id };
  }

  async login(userInput: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(userInput.username);
    if (!user) {
      throw new UnauthorizedException('User role not found');
    }
    const roleName =
      typeof user.role === 'string' ? user.role : user.role?.name;
    if (!roleName) {
      throw new UnauthorizedException('User role not found');
    }
    const role = await this.rolesService.getRoleByName(roleName);

    if (user?.password !== userInput.password) {
      throw new UnauthorizedException();
    }
    const payload = {
      Id: user._id,
      username: user.username,
      role: role.name,
      permissions: role.permissions,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
