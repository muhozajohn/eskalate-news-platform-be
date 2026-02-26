import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto) {
    try {
      const existing = await this.prisma.newsletterSubscription.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        if (existing.isActive) {
          return { subscribed: true, message: 'Already subscribed' };
        }
        return await this.prisma.newsletterSubscription.update({
          where: { email: dto.email },
          data: { isActive: true },
        });
      }

      return await this.prisma.newsletterSubscription.create({ data: dto });
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'subscribing to newsletter',
      });
    }
  }

  async unsubscribe(email: string) {
    try {
      const sub = await this.prisma.newsletterSubscription.findUnique({
        where: { email },
      });
      if (!sub) throw new NotFoundException('Subscription not found');

      return await this.prisma.newsletterSubscription.update({
        where: { email },
        data: { isActive: false },
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'unsubscribing from newsletter',
      });
    }
  }

  async findAll(page = 1, limit = 50) {
    try {
      const skip = (+page - 1) * +limit;
      const [subscriptions, total] = await Promise.all([
        this.prisma.newsletterSubscription.findMany({
          where: { isActive: true },
          skip,
          take: +limit,
          include: {
            user: { select: { id: true, username: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.newsletterSubscription.count({ where: { isActive: true } }),
      ]);
      return { data: subscriptions, total, page: +page, limit: +limit };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving subscriptions',
      });
    }
  }
}
