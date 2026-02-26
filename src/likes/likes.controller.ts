import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReactionTarget } from '../../generated/prisma/client.js';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Toggle like on an article or comment (like if not liked, unlike if already liked)',
  })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  toggle(@Body() dto: CreateLikeDto, @Req() req: AuthenticatedRequest) {
    return this.likesService.toggle(req.user.id, dto);
  }

  @Get(':targetType/:targetId/count')
  @ApiOperation({ summary: 'Get like count for a target (article or comment)' })
  @ApiParam({ name: 'targetType', enum: ReactionTarget, example: 'article' })
  @ApiParam({ name: 'targetId', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Returns like count' })
  getCount(
    @Param('targetType') targetType: ReactionTarget,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.likesService.getCount(targetType, targetId);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all likes of the current logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns list of liked targets' })
  getMyLikes(@Req() req: AuthenticatedRequest) {
    return this.likesService.getMyLikes(req.user.id);
  }
}
