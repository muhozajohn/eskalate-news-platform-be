import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Technology',
    description: 'Category name — must be unique',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'technology',
    description: 'URL-friendly slug — must be unique (lowercase, hyphens)',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example: 'All tech-related news, reviews, and analysis.',
    description: 'Optional category description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Parent category ID for hierarchical (sub-category) setup',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;
}
