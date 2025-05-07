import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decoraters/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Áp dụng toàn controller
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Permissions('create:user')
  createUser(@Body() createUserDto: createUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Permissions('read:user')
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  @Permissions('read:user')
  async getUserById(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.usersService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Patch(':id')
  @Permissions('update:user')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid Id', 400);
    const updatedUser = this.usersService.updateUser(id, updateUserDto);
    if (!updateUserDto) throw new HttpException('User Not Found', 404);
    return updatedUser;
  }

  @Delete(':id')
  @Permissions('delete:user')
  async deleteUser(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid Id', 400);
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) throw new HttpException('User Not Found', 404);
    return;
  }
}
