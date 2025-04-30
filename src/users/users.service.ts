import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { createUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UserSettings } from 'src/schemas/UserSettings.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettinsgModel: Model<UserSettings>,
  ) {}

  async createUser({ settings, ...createUserDto }: createUserDto) {
    if (settings) {
      const newSettings = new this.userSettinsgModel(settings);
      const savedNewSettings = await newSettings.save();
      const newUser = new this.userModel({
        ...createUserDto,
        settings: savedNewSettings._id,
      });
      return newUser.save();
    }
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  getUsers() {
    return this.userModel.find().populate('settings');
  }

  getUserById(id: string) {
    return this.userModel.findById(id).populate('settings');
  }

  updateUser(id: string, updapteUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updapteUserDto, { new: true });
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Nếu user có settings thì xóa luôn
    if (user.settings) {
      await this.userSettinsgModel.findByIdAndDelete(user.settings);
    }

    // Xóa user
    return this.userModel.findByIdAndDelete(id);
  }
}
