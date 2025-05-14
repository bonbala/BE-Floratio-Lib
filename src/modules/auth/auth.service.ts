import { Types } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  async signup(
    username: string,
    email: string,
    password: string,
    roleName: string,
  ) {
    const role = await this.rolesService.findByName(roleName);
    // Tạo user mới
    const user = await this.usersService.create(
      username,
      email,
      password,
      role._id as Types.ObjectId,
    );

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: role.name,
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const valid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!valid) {
      throw new UnauthorizedException('Wrong Password');
    }
    return user;
  }

  async login(dto: LoginDto) {
    // 1. Validate user
    const user = await this.validateUser(dto.username, dto.password);

    // 2. Load role & permissions (names only)
    const role = await this.rolesService.findById(user.role.toString());
    await role.populate('permissions');

    const permissionNames = role.permissions.map((p: any) => p.name);

    // 3. Build clean payload
    const userId = (user._id as Types.ObjectId).toString();
    const payload = {
      sub: userId,
      username: user.username,
      role: role.name,
      permissions: permissionNames,
    };

    // 4. Sign token
    return {
      access_token: this.jwtService.sign(payload),
      expires_in: process.env.JWT_EXPIRES_IN,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    // Xác thực mật khẩu cũ
    const valid = await this.usersService.validatePassword(
      oldPassword,
      user.password,
    );
    if (!valid) throw new Error('Old password incorrect');
    await this.usersService.changePassword(userId, newPassword);
    return { success: true };
  }
}
