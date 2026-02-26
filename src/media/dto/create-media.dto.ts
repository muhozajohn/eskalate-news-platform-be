import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '../../../generated/prisma/client.js';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    enum: MediaType,
    example: 'image',
    description: 'Media type classification',
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({
    example: 1,
    description: 'Optionally associate this media file with an article',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  articleId?: number;
}
