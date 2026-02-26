import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: 'subscriber@example.com',
    description: 'Email address to subscribe to the newsletter',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Link an existing user account to this subscription (optional)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;
}
