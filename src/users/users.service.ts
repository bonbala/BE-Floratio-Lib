import { User } from 'src/schemas/User.schema';
import { createUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).populate('role');
  }

  async createUser(createUserDto: createUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserById(id: string) {
    return this.userModel.findById(id);
  }

  updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return this.userModel.findByIdAndDelete(id);
  }
}
