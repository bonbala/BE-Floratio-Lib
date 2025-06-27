import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  // Gửi mail tổng quát
  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  // 1) Mail xác minh tài khoản
  async sendVerifyEmail(to: string, username: string, token: string) {
    const verifyUrl = `${this.config.get<string>(
      'CLIENT_URL',
    )}/verify-email?token=${token}`;
    const html = `
      <h3>Xin chào ${username}!</h3>
      <p>Bạn vừa đăng ký tài khoản Floratio. Vui lòng bấm nút bên dưới để hoàn tất xác thực email.</p>
      <p><a href="${verifyUrl}" style="padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px" target="_blank">Xác thực e-mail</a></p>
      <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua.</p>`;
    return this.sendMail(to, 'Xác thực tài khoản Floratio', html);
  }

  // 2) Mail thông báo đổi mật khẩu thành công
  async sendPasswordChanged(to: string, username: string) {
    const html = `
      <h3>Xin chào ${username}!</h3>
      <p>Mật khẩu tài khoản của bạn vừa được thay đổi thành công.</p>
      <p>Nếu đây không phải là bạn, hãy liên hệ quản trị viên ngay.</p>`;
    return this.sendMail(to, 'Floratio – Mật khẩu đã được thay đổi', html);
  }

  // 3) Mail thông báo khôi phục mật khẩu
  async sendResetPassword(to: string, username: string, token: string) {
    const url = `${this.config.get<string>('CLIENT_URL')}/reset-password?token=${token}`;
    const html = `
      <h3>Xin chào ${username}!</h3>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu Floratio.</p>
      <p><a href="${url}" style="padding:10px 20px;background:#008CBA;color:#fff;border-radius:5px;text-decoration:none">Đặt lại mật khẩu</a></p>
      <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>`;
    return this.sendMail(to, 'Floratio – Đặt lại mật khẩu', html);
  }
}
