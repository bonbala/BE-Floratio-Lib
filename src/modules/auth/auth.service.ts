import { Types } from 'mongoose';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private mailService: MailService,
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

    const token = this.jwtService.sign(
      { sub: (user._id as Types.ObjectId).toString(), purpose: 'email_verify' },
      { expiresIn: '24h' },
    );
    await this.mailService.sendVerifyEmail(user.email, user.username, token);

    return {
      message: 'Đã gửi e-mail xác thực',
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
    if (!user.is_email_verified) {
      throw new ForbiddenException('Email này chưa được xác thực');
    }
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

  // Đổi mật khẩu mới
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
    if (!valid) throw new ForbiddenException('Old password incorrect');
    await this.usersService.changePassword(userId, newPassword);
    await this.mailService.sendPasswordChanged(user.email, user.username);
    return { success: true };
  }

  // Xử lý xác thực e-mail
  async verifyEmail(token: string) {
    const { sub, purpose } = this.jwtService.verify(token);
    if (purpose !== 'email_verify') throw new Error('Token không hợp lệ');
    await this.usersService.markEmailVerified(sub);
    return { verified: true };
  }

  // Gửi yêu cầu đặt mật khẩu mới
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'Email này chưa được đăng ký' };

    const userId = String(user._id);

    // JWT mục đích reset, hết hạn 30 phút
    const token = this.jwtService.sign(
      { sub: userId, purpose: 'password_reset' },
      { expiresIn: '30m' },
    );

    await this.mailService.sendResetPassword(user.email, user.username, token);
    return { message: 'Đã gửi email đặt lại mật khẩu' };
  }

  // Đặt lại mật khẩu mới
  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new ForbiddenException('Token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.purpose !== 'password_reset')
      throw new ForbiddenException('Sai mục đích token');

    await this.usersService.changePassword(payload.sub, newPassword);
    // (không gửi mail vì changePassword đã gửi PasswordChanged sẵn)
    return { message: 'Đặt lại mật khẩu thành công' };
  }
}
