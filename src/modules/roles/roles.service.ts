import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async findById(id: string) {
    const role = await this.roleModel.findById(id).exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(name: string) {
    const role = await this.roleModel.findOne({ name }).exec();
    if (!role)
      throw new NotFoundException(`Role with name "${name}" not found`);
    return role;
  }

  async create(name: string, permissionIds: Types.ObjectId[]) {
    const created = new this.roleModel({ name, permissions: permissionIds });
    return created.save();
  }
}
