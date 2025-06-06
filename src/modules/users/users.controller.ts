import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from '../roles/roles.service';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super-admin', 'admin')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Tạo mới một user với role
   * POST /users/create
   */
  @Post('create')
  @ApiOperation({ summary: 'Create new user with role' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Create new user success',
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const role = await this.rolesService.findByName(createUserDto.roleName);
    return this.usersService.create(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      (role._id as any).toString(),
    );
  }

  /**
   * Lấy danh sách tất cả user
   * GET /users/list
   */
  @Get('list')
  @ApiOperation({ summary: 'Retrieve a list of all users' })
  @ApiResponse({
    status: 200,
    description: 'Array of user records',
    type: [User],
  })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Lấy chi tiết user theo ID
   * GET /users/detail/:id
   */
  @Get('detail/:id')
  @ApiOperation({ summary: 'Get details of a single user by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the user' })
  @ApiResponse({ status: 200, description: 'User details', type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Cập nhật thông tin user (có thể thay đổi role)
   * PATCH /users/update/:id
   */
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update user information (including role)' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to update',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const { roleName, ...rest } = updateUserDto as any;
    const updateData: any = { ...rest };

    // Nếu có thay đổi roleName thì tìm ObjectId của Role
    if (roleName) {
      const role = await this.rolesService.findByName(roleName);
      updateData.role = (role._id as any).toString();
    }

    // Thực hiện update
    await this.usersService.update(id, updateData);

    // Trả về đối tượng đã populate để client nhận được role.name
    return this.usersService.findById(id);
  }

  /**
   * Xóa user theo ID
   * DELETE /users/delete/:id
   */
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    type: User,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
