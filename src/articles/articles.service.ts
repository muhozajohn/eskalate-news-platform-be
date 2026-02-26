import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticleStatus, Prisma } from '../../generated/prisma/client.js';
import { CloudinaryService } from '../common/cloudinary.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    authorId: number,
    dto: CreateArticleDto,
    coverImageFile?: Express.Multer.File,
  ) {
    try {
      const { tagIds, ...articleData } = dto;

      let coverImageUrl: string | undefined;
      if (coverImageFile) {
        coverImageUrl =
          await this.cloudinaryService.uploadImage(coverImageFile);
      }

      const publishedAt =
        dto.status === ArticleStatus.published ? new Date() : undefined;

      return await this.prisma.article.create({
        data: {
          ...articleData,
          authorId,
          coverImageUrl,
          publishedAt,
          readingTime: this.calcReadingTime(dto.content),
          tags: tagIds?.length
            ? { create: tagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
        include: this.fullIncludes(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating article' });
    }
  }

  async findAll(query: ArticleQueryDto) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        categoryId,
        authorId,
        tagId,
        isFeatured,
        search,
      } = query;

      const skip = (+page - 1) * +limit;
      const where: Prisma.ArticleWhereInput = {};

      if (status) where.status = status;
      if (categoryId) where.categoryId = +categoryId;
      if (authorId) where.authorId = +authorId;
      if (isFeatured !== undefined) where.isFeatured = isFeatured;
      if (tagId) where.tags = { some: { tagId: +tagId } };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [articles, total] = await Promise.all([
        this.prisma.article.findMany({
          where,
          skip,
          take: +limit,
          include: this.fullIncludes(),
          orderBy: { publishedAt: 'desc' },
        }),
        this.prisma.article.count({ where }),
      ]);

      return {
        data: articles,
        total,
        page: +page,
        limit: +limit,
        pages: Math.ceil(total / +limit),
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving articles',
      });
    }
  }

  async findOne(id: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: this.fullIncludes(),
      });
      if (!article) throw new NotFoundException(`Article #${id} not found`);

      await this.prisma.article.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      return article;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving article' });
    }
  }

  async findBySlug(slug: string) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { slug },
        include: this.fullIncludes(),
      });
      if (!article) throw new NotFoundException(`Article "${slug}" not found`);

      await this.prisma.article.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      });

      return article;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving article by slug',
      });
    }
  }

  async update(
    id: number,
    userId: number,
    userRole: string,
    dto: UpdateArticleDto,
    coverImageFile?: Express.Multer.File,
  ) {
    try {
      const article = await this.prisma.article.findUnique({ where: { id } });
      if (!article) throw new NotFoundException(`Article #${id} not found`);

      const canEdit =
        article.authorId === userId || ['admin', 'editor'].includes(userRole);
      if (!canEdit)
        throw new ForbiddenException('You can only edit your own articles');

      const { tagIds, ...updateData } = dto;

      let coverImageUrl = article.coverImageUrl;
      if (coverImageFile) {
        coverImageUrl =
          await this.cloudinaryService.uploadImage(coverImageFile);
      }

      const publishedAt =
        dto.status === ArticleStatus.published && !article.publishedAt
          ? new Date()
          : article.publishedAt;

      return await this.prisma.article.update({
        where: { id },
        data: {
          ...updateData,
          coverImageUrl,
          publishedAt,
          readingTime: dto.content
            ? this.calcReadingTime(dto.content)
            : article.readingTime,
          tags: tagIds
            ? {
                deleteMany: {},
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
        },
        include: this.fullIncludes(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating article' });
    }
  }

  async remove(id: number, userId: number, userRole: string) {
    try {
      const article = await this.prisma.article.findUnique({ where: { id } });
      if (!article) throw new NotFoundException(`Article #${id} not found`);

      const canDelete = article.authorId === userId || userRole === 'admin';
      if (!canDelete)
        throw new ForbiddenException('You can only delete your own articles');

      await this.prisma.article.delete({ where: { id } });
      return { message: `Article #${id} removed successfully` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing article' });
    }
  }

  private calcReadingTime(content: string): number {
    const WORDS_PER_MINUTE = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  }

  private fullIncludes() {
    return {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      category: true,
      tags: { include: { tag: true } },
      _count: {
        select: { comments: true, likes: true, bookmarks: true },
      },
    } as const;
  }
}
