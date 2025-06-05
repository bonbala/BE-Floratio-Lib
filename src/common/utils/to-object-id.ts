// src/utils/to-object-id.ts
import { Types } from 'mongoose';

export const toObjectId = (id?: string | Types.ObjectId) =>
  id && !(id instanceof Types.ObjectId) ? new Types.ObjectId(id) : id;
