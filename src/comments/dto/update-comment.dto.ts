import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Updated: I actually disagree with one point in the article.',
    description: 'Revised comment body',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}
