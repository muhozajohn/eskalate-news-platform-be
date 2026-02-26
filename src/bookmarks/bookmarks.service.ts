import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';

@Injectable()
export class BookmarksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async toggle(userId: number, articleId: number) {
    try {
      const existing = await this.prisma.bookmark.findUnique({
        where: { userId_articleId: { userId, articleId: +articleId } },
      });

      if (existing) {
        await this.prisma.bookmark.delete({
          where: { userId_articleId: { userId, articleId: +articleId } },
        });
        return { bookmarked: false, message: 'Bookmark removed' };
      }

      await this.prisma.bookmark.create({
        data: { userId, articleId: +articleId },
      });
      return { bookmarked: true, message: 'Bookmark saved' };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'toggling bookmark' });
    }
  }

  async findMyBookmarks(userId: number, page = 1, limit = 20) {
    try {
      const skip = (+page - 1) * +limit;
      const [bookmarks, total] = await Promise.all([
        this.prisma.bookmark.findMany({
          where: { userId },
          skip,
          take: +limit,
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                coverImageUrl: true,
                publishedAt: true,
                readingTime: true,
                author: {
                  select: { id: true, username: true, fullName: true },
                },
                _count: { select: { likes: true, comments: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.bookmark.count({ where: { userId } }),
      ]);
      return {
        data: bookmarks.map((b) => ({ ...b.article, savedAt: b.createdAt })),
        total,
        page: +page,
        limit: +limit,
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving bookmarks',
      });
    }
  }
}
