import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    uploaderId: number,
    dto: CreateMediaDto,
    file: Express.Multer.File,
  ) {
    try {
      const url = await this.cloudinaryService.uploadImage(file);
      return await this.prisma.media.create({
        data: {
          uploaderId,
          url,
          type: dto.type,
          filename: file.originalname,
          sizeBytes: file.size,
          articleId: dto.articleId,
        },
        include: {
          uploader: { select: { id: true, username: true, fullName: true } },
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'uploading media' });
    }
  }

  async findAll(page = 1, limit = 20) {
    try {
      const skip = (+page - 1) * +limit;
      const [media, total] = await Promise.all([
        this.prisma.media.findMany({
          skip,
          take: +limit,
          include: {
            uploader: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.media.count(),
      ]);
      return { data: media, total, page: +page, limit: +limit };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving media' });
    }
  }

  async findOne(id: number) {
    try {
      const media = await this.prisma.media.findUnique({
        where: { id },
        include: {
          uploader: { select: { id: true, username: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      });
      if (!media) throw new NotFoundException(`Media #${id} not found`);
      return media;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving media' });
    }
  }

  async findByArticle(articleId: number) {
    try {
      return await this.prisma.media.findMany({
        where: { articleId: +articleId },
        include: {
          uploader: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving article media',
      });
    }
  }

  async remove(id: number, userId: number, userRole: string) {
    try {
      const media = await this.prisma.media.findUnique({ where: { id } });
      if (!media) throw new NotFoundException(`Media #${id} not found`);

      if (media.uploaderId !== userId && userRole !== 'admin') {
        throw new ForbiddenException('You can only delete your own media');
      }

      await this.prisma.media.delete({ where: { id } });
      return { message: `Media #${id} removed` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing media' });
    }
  }
}
