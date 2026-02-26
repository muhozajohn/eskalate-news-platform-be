import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async toggle(followerId: number, followingId: number) {
    try {
      if (followerId === followingId) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const existing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId, followingId: +followingId },
        },
      });

      if (existing) {
        await this.prisma.follow.delete({
          where: {
            followerId_followingId: { followerId, followingId: +followingId },
          },
        });
        return { following: false, message: 'Unfollowed successfully' };
      }

      await this.prisma.follow.create({
        data: { followerId, followingId: +followingId },
      });
      return { following: true, message: 'Followed successfully' };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'toggling follow' });
    }
  }

  async getFollowers(userId: number, page = 1, limit = 20) {
    try {
      const skip = (+page - 1) * +limit;
      const [rows, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: { followingId: +userId },
          skip,
          take: +limit,
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.follow.count({ where: { followingId: +userId } }),
      ]);
      return {
        data: rows.map((r) => r.follower),
        total,
        page: +page,
        limit: +limit,
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving followers',
      });
    }
  }

  async getFollowing(userId: number, page = 1, limit = 20) {
    try {
      const skip = (+page - 1) * +limit;
      const [rows, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: { followerId: +userId },
          skip,
          take: +limit,
          include: {
            following: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.follow.count({ where: { followerId: +userId } }),
      ]);
      return {
        data: rows.map((r) => r.following),
        total,
        page: +page,
        limit: +limit,
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving following',
      });
    }
  }

  async getStats(userId: number) {
    try {
      const [followersCount, followingCount] = await Promise.all([
        this.prisma.follow.count({ where: { followingId: +userId } }),
        this.prisma.follow.count({ where: { followerId: +userId } }),
      ]);
      return { userId: +userId, followersCount, followingCount };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving follow stats',
      });
    }
  }
}
