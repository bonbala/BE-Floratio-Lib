import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: createUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id); // Giá trị được trả về cho isValid là boolen
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.usersService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404); // Lỗi này sẽ báo về khi không có thk User
    return findUser;
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updapteUserDto: UpdateUserDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid Id', 400);
    const updatedUser = this.usersService.updateUser(id, updapteUserDto);
    if (!updatedUser) throw new HttpException('User Not Found', 404);
    return updatedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid Id', 400);
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) throw new HttpException('User Not Found', 404);
    return;
  }
}
