import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(dto: CreateTagDto) {
    try {
      return await this.prisma.tag.create({
        data: dto,
        include: { _count: { select: { articles: true } } },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating tag' });
    }
  }

  async findAll() {
    try {
      return await this.prisma.tag.findMany({
        include: { _count: { select: { articles: true } } },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving tags' });
    }
  }

  async findOne(id: number) {
    try {
      const tag = await this.prisma.tag.findUnique({
        where: { id },
        include: { _count: { select: { articles: true } } },
      });
      if (!tag) throw new NotFoundException(`Tag #${id} not found`);
      return tag;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving tag' });
    }
  }

  async findBySlug(slug: string) {
    try {
      const tag = await this.prisma.tag.findUnique({
        where: { slug },
        include: { _count: { select: { articles: true } } },
      });
      if (!tag) throw new NotFoundException(`Tag "${slug}" not found`);
      return tag;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving tag by slug',
      });
    }
  }

  async update(id: number, dto: UpdateTagDto) {
    try {
      await this.findOne(id);
      return await this.prisma.tag.update({
        where: { id },
        data: dto,
        include: { _count: { select: { articles: true } } },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating tag' });
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.tag.delete({ where: { id } });
      return { message: `Tag #${id} removed successfully` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing tag' });
    }
  }
}
