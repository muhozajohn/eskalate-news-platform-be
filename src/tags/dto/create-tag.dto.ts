import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'Tag name — must be unique',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'javascript',
    description: 'URL-friendly slug — must be unique (lowercase, hyphens)',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;
}
