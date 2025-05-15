export class ContributeSummaryDto {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  scientific_name: string;
  description?: string;
  image?: string;
  attributes: string[];
  reviewed_by?: {
    _id: string;
    username: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
