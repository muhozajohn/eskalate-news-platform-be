import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Great article! Very informative and well-written.',
    description: 'Comment text body',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the article being commented on',
  })
  @IsInt()
  @Type(() => Number)
  articleId: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Parent comment ID — supply this to post a nested reply',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;
}
