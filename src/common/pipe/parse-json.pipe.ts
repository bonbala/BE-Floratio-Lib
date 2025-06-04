import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// parse-json.pipe.ts
@Injectable()
export class ParseJsonPipe implements PipeTransform {
  constructor(
    private readonly fields: string[] = [
      'species_description',
      'common_name',
      'attributes',
      'images',
    ],
  ) {}

  transform(value: any) {
    this.fields.forEach((f) => {
      if (typeof value[f] === 'string') {
        try {
          value[f] = JSON.parse(value[f]);
        } catch {
          throw new BadRequestException(`${f} must be valid JSON`);
        }
      }
    });
    return value;
  }
}
