import { ApiProperty } from '@nestjs/swagger';
import { ReactionTarget } from '../../../generated/prisma/client.js';
import { Type } from 'class-transformer';
import { IsEnum, IsInt } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    enum: ReactionTarget,
    example: 'article',
    description: 'Target type — "article" or "comment"',
  })
  @IsEnum(ReactionTarget)
  targetType: ReactionTarget;

  @ApiProperty({
    example: 1,
    description: 'ID of the article or comment to like/unlike',
  })
  @IsInt()
  @Type(() => Number)
  targetId: number;
}
