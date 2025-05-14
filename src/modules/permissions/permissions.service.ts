import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permModel: Model<Permission>,
  ) {}

  async findByName(name: string) {
    const perm = await this.permModel.findOne({ name }).exec();
    if (!perm) throw new NotFoundException(`Permission ${name} not found`);
    return perm;
  }

  async create(name: string) {
    const created = new this.permModel({ name });
    return created.save();
  }
}
