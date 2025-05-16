import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<any[]> {
    // Populate field 'role', chỉ lấy 'name'
    const users = await this.userModel.find().populate('role', 'name').exec();

    // Chuyển mỗi document thành object thuần và thay role thành role.name
    return users.map((user) => {
      const obj = user.toObject();
      return {
        ...obj,
        role: (obj.role as any)?.name ?? null,
      };
    });
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate('role', 'name')
      .exec();
    if (!user) throw new NotFoundException('User not found');

    const obj = user.toObject();
    return {
      ...obj,
      role: (obj.role as any)?.name ?? null,
    };
  }

  async create(
    username: string,
    email: string,
    password: string,
    roleId: Types.ObjectId | string,
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User với id ${id} không tìm thấy`);
    }
    return updated;
  }

  async remove(id: string): Promise<User> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`User với id ${id} không tìm thấy`);
    }
    return deleted;
  }
}
