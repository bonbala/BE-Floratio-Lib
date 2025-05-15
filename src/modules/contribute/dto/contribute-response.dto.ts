import { ContributeStatus } from '../schemas/contribute.schema';
import { SpeciesDescriptionDto } from './create-contribute.dto';

export class ContributeResponseDto {
  _id: string;

  user: {
    _id: string;
    username: string;
  };

  scientific_name: string;
  common_name: string[];
  description?: string;

  // đây là mảng string tên attribute
  attributes: string[];

  images: string[];
  species_description?: SpeciesDescriptionDto[];

  suggested_family?: string;
  status: ContributeStatus;

  // nếu cần hiển thị ai review
  reviewed_by?: {
    _id: string;
    username: string;
  };
  review_message?: string;

  createdAt: Date;
  updatedAt: Date;
}
