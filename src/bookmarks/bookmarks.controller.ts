import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle/:articleId')
  @ApiOperation({
    summary:
      'Toggle bookmark on an article (save if not saved, remove if already saved)',
  })
  @ApiResponse({ status: 200, description: 'Bookmark status toggled' })
  toggle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.toggle(req.user.id, articleId);
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's saved/bookmarked articles" })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated bookmarked articles' })
  findMyBookmarks(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookmarksService.findMyBookmarks(req.user.id, page, limit);
  }
}
