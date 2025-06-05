import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  ValidateIf,
  ValidateNested,
  IsMongoId,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { Types } from 'mongoose';

/* ---------- Sub-DTO ---------- */

export class TableItemDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SpeciesDescriptionDto {
  @IsString()
  @IsNotEmpty()
  section: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  details: TableItemDto[];
}

/**
 *  DTO cho phần plant trong Contribute
 *  TẤT CẢ trường đều optional → linh hoạt cho update.
 *  Ràng buộc “bắt buộc khi create” được xử lý ở DTO cha.
 */
export class ContributePlantDto {
  @IsOptional()
  @IsString()
  scientific_name?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  common_name?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  family?: string | Types.ObjectId; // _id của Family

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  attributes?: string[] | Types.ObjectId[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  species_description?: SpeciesDescriptionDto[];

  /** _id cây gốc (khi update) – chỉ cần copy vào đây để reviewer tiện so sánh */
  // @IsOptional()
  // @IsMongoId()
  // plant_ref?: string;
}

/* ---------- Custom validator: ít nhất 1 field thay đổi khi update ---------- */

function AtLeastOneFieldChanged() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneFieldChanged',
      target: object.constructor,
      propertyName,
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const dto = args.object as CreateContributeDto;
          if (dto.type !== 'update') return true;
          return (
            dto.data && dto.data.plant && Object.keys(dto.data.plant).length > 0
          );
        },
        defaultMessage: () =>
          'type="update" phải có ít nhất 1 trường thay đổi trong data.plant',
      },
    });
  };
}

/* ---- Sub DTO cho data ---- */
export class ContributeDataDto {
  /** _id cây gốc – bắt buộc khi update */
  // @ValidateIf((o, obj: any) => (obj as any).parent.type === 'update')
  @ValidateIf((o, root: any) => root?.type === 'update')
  @IsMongoId({ message: 'plant_ref phải là ObjectId khi update' })
  plant_ref?: string | Types.ObjectId;

  /** Bản đề xuất cây */
  @ValidateNested()
  @Type(() => ContributePlantDto)
  plant: ContributePlantDto;

  /** Ảnh mới */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Expose({ name: 'new-images' })
  new_images?: string[];
}

export class CreateContributeDto {
  @IsEnum(['create', 'update'])
  type: 'create' | 'update';

  @IsOptional()
  @IsString()
  c_message?: string;

  /* Gói data */
  @ValidateNested()
  @Type(() => ContributeDataDto)
  @AtLeastOneFieldChanged()
  data: ContributeDataDto;

  /* -- Ràng buộc cho type='create': cần name & family -- */
  @ValidateIf((o) => o.type === 'create')
  @IsNotEmpty({ message: 'scientific_name là bắt buộc khi create' })
  private get _needName() {
    return this.data?.plant?.scientific_name;
  }

  @ValidateIf((o) => o.type === 'create')
  @IsNotEmpty({ message: 'family là bắt buộc khi create' })
  private get _needFamily() {
    return this.data?.plant?.family;
  }
}
