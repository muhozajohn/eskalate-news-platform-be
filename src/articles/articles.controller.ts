import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '../../generated/prisma/client.js';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.author, UserRole.editor, UserRole.admin)
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Create article. Send as multipart/form-data to include a cover image.',
    schema: {
      type: 'object',
      required: ['title', 'slug', 'content'],
      properties: {
        title: {
          type: 'string',
          example: 'Breaking: Major Tech Merger Announced',
        },
        slug: {
          type: 'string',
          example: 'breaking-major-tech-merger-announced',
        },
        summary: {
          type: 'string',
          example: 'A quick teaser summary of the article.',
        },
        content: {
          type: 'string',
          example: '<p>Full article body goes here...</p>',
        },
        status: {
          type: 'string',
          enum: [
            'draft',
            'pending_review',
            'published',
            'archived',
            'rejected',
          ],
          example: 'draft',
        },
        categoryId: { type: 'integer', example: 1 },
        tagIds: {
          type: 'array',
          items: { type: 'integer' },
          example: [1, 2],
        },
        isFeatured: { type: 'boolean', example: false },
        coverImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Create a new article (authors, editors, admins)' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  create(
    @Body() dto: CreateArticleDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.articlesService.create(req.user.id, dto, coverImage);
  }

  @Get()
  @ApiOperation({
    summary: 'List articles with filters, search, and pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated articles list' })
  findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug (increments view count)' })
  @ApiResponse({ status: 200, description: 'Returns article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID (increments view count)' })
  @ApiResponse({ status: 200, description: 'Returns article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Update article fields. Send as multipart/form-data to replace cover image.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        summary: { type: 'string' },
        content: { type: 'string' },
        status: {
          type: 'string',
          enum: [
            'draft',
            'pending_review',
            'published',
            'archived',
            'rejected',
          ],
        },
        categoryId: { type: 'integer' },
        tagIds: { type: 'array', items: { type: 'integer' } },
        isFeatured: { type: 'boolean' },
        coverImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary:
      'Update article (owner, editor, or admin). Publishing auto-sets publishedAt.',
  })
  @ApiResponse({ status: 200, description: 'Article updated' })
  @ApiResponse({ status: 403, description: 'Not your article' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.articlesService.update(
      id,
      req.user.id,
      req.user.role,
      dto,
      coverImage,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete article (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Article removed' })
  @ApiResponse({ status: 403, description: 'Not your article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.remove(id, req.user.id, req.user.role);
  }
}
