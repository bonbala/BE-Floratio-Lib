import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(
    username: string,
    email: string,
    password: string,
    roleId: Types.ObjectId,
  ) {
    const hash = await bcrypt.hash(password, 10);
    const created = new this.userModel({
      username,
      email,
      password: hash,
      role: roleId,
    });
    return created.save();
  }

  async changePassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    return this.userModel.findByIdAndUpdate(userId, { password: hash }).exec();
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
