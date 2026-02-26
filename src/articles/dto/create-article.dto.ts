import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '../../../generated/prisma/client.js';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({
    example: 'Breaking: Major Tech Merger Announced',
    description: 'Article headline',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'breaking-major-tech-merger-announced',
    description: 'URL-friendly slug — must be unique',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example:
      'A leading tech giant announced a multi-billion dollar acquisition of a rising AI startup.',
    description: 'Short teaser summary shown in listings',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    example:
      '<p>Full article body with <strong>rich HTML</strong> content...</p>',
    description: 'Full article content — HTML supported',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: 'draft',
    enum: ArticleStatus,
    description: 'Publication status (defaults to draft)',
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    example: 2,
    description: 'Category ID to assign the article to',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    example: [1, 3, 5],
    description: 'Array of tag IDs to associate with this article',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(Number)
      : typeof value === 'string'
        ? value.split(',').map(Number)
        : value,
  )
  tagIds?: number[];

  @ApiPropertyOptional({
    example: false,
    description: 'Pin this article as a featured/homepage highlight',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;
}
