import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '../../../generated/prisma/client.js';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ArticleQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (default: 10)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ArticleStatus,
    example: 'published',
    description: 'Filter by publication status',
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Filter by author ID',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Filter by tag ID',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tagId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Show only featured articles',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: 'tech merger',
    description: 'Full-text search in title and summary',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
