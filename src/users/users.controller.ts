// src/users/users.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { createUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decoraters/permissions.decorator';
import mongoose from 'mongoose';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard) // :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Permissions('create:user')
  @ApiOperation({ summary: 'Tạo mới người dùng' })
  @ApiResponse({ status: 201, description: 'Người dùng được tạo thành công.' })
  createUser(@Body() createUserDto: createUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Permissions('read:user')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về mảng người dùng.' })
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  @Permissions('read:user')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user.' })
  async getUserById(@Param('id') id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new HttpException('User not found', 404);
    const findUser = await this.usersService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Patch(':id')
  @Permissions('update:user')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', description: 'ObjectId của người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Invalid Id.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new HttpException('Invalid Id', 400);
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) throw new HttpException('User Not Found', 404);
    return updatedUser;
  }

  @Delete(':id')
  @Permissions('delete:user')
  @ApiOperation({ summary: 'Xóa người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của người dùng' })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công. Không trả về nội dung.',
  })
  @ApiResponse({ status: 400, description: 'Invalid Id.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new HttpException('Invalid Id', 400);
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) throw new HttpException('User Not Found', 404);
    return;
  }
}
