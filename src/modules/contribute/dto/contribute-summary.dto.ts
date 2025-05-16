// contribute-summary.dto.ts

export class ContributeSummaryDto {
  _id: string;
  user: { _id: string; username: string };
  contribute_plant: {
    scientific_name: string;
    common_name: string[];
    image?: string;
    description?: string;
    attributes: string[];
    // species_description?: any[];
  };
  reviewed_by?: { _id: string; username: string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
