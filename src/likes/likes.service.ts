import { Injectable } from '@nestjs/common';
import { ReactionTarget } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async toggle(userId: number, dto: CreateLikeDto) {
    try {
      const existing = await this.prisma.like.findUnique({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: dto.targetType,
            targetId: dto.targetId,
          },
        },
      });

      if (existing) {
        await this.prisma.like.delete({ where: { id: existing.id } });
        return { liked: false, message: 'Like removed' };
      }

      await this.prisma.like.create({
        data: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      });
      return { liked: true, message: 'Like added' };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'toggling like' });
    }
  }

  async getCount(targetType: ReactionTarget, targetId: number) {
    try {
      const count = await this.prisma.like.count({
        where: { targetType, targetId: +targetId },
      });
      return { targetType, targetId: +targetId, count };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'counting likes' });
    }
  }

  async getMyLikes(userId: number) {
    try {
      return await this.prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving user likes',
      });
    }
  }
}
