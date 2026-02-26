import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(authorId: number, dto: CreateCommentDto) {
    try {
      return await this.prisma.comment.create({
        data: { ...dto, authorId },
        include: this.commentIncludes(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating comment' });
    }
  }

  async findByArticle(articleId: number, page = 1, limit = 20) {
    try {
      const skip = (+page - 1) * +limit;
      const [comments, total] = await Promise.all([
        this.prisma.comment.findMany({
          where: { articleId: +articleId, parentId: null, isApproved: true },
          skip,
          take: +limit,
          include: {
            ...this.commentIncludes(),
            replies: {
              where: { isApproved: true },
              include: this.commentIncludes(),
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.comment.count({
          where: { articleId: +articleId, parentId: null },
        }),
      ]);
      return { data: comments, total, page: +page, limit: +limit };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving comments',
      });
    }
  }

  async findOne(id: number) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          ...this.commentIncludes(),
          replies: {
            where: { isApproved: true },
            include: this.commentIncludes(),
          },
        },
      });
      if (!comment) throw new NotFoundException(`Comment #${id} not found`);
      return comment;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving comment' });
    }
  }

  async update(
    id: number,
    userId: number,
    userRole: string,
    dto: UpdateCommentDto,
  ) {
    try {
      const comment = await this.prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundException(`Comment #${id} not found`);

      const canEdit =
        comment.authorId === userId || ['admin', 'editor'].includes(userRole);
      if (!canEdit)
        throw new ForbiddenException('You can only edit your own comments');

      return await this.prisma.comment.update({
        where: { id },
        data: { body: dto.body },
        include: this.commentIncludes(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating comment' });
    }
  }

  async toggleApproval(id: number) {
    try {
      const comment = await this.prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundException(`Comment #${id} not found`);

      return await this.prisma.comment.update({
        where: { id },
        data: { isApproved: !comment.isApproved },
        include: this.commentIncludes(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'approving comment' });
    }
  }

  async remove(id: number, userId: number, userRole: string) {
    try {
      const comment = await this.prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundException(`Comment #${id} not found`);

      const canDelete =
        comment.authorId === userId || ['admin', 'editor'].includes(userRole);
      if (!canDelete)
        throw new ForbiddenException('You can only delete your own comments');

      await this.prisma.comment.delete({ where: { id } });
      return { message: `Comment #${id} removed` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing comment' });
    }
  }

  private commentIncludes() {
    return {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      _count: { select: { likes: true, replies: true } },
    } as const;
  }
}
