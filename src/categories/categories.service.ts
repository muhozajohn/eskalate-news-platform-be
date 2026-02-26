import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: dto,
        include: { parent: true, children: true },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating category' });
    }
  }

  async findAll() {
    try {
      return await this.prisma.category.findMany({
        include: {
          parent: true,
          children: true,
          _count: { select: { articles: true } },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving categories',
      });
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          _count: { select: { articles: true } },
        },
      });
      if (!category) throw new NotFoundException(`Category #${id} not found`);
      return category;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving category',
      });
    }
  }

  async findBySlug(slug: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: true,
          _count: { select: { articles: true } },
        },
      });
      if (!category)
        throw new NotFoundException(`Category "${slug}" not found`);
      return category;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving category by slug',
      });
    }
  }

  async update(id: number, dto: UpdateCategoryDto) {
    try {
      await this.findOne(id);
      return await this.prisma.category.update({
        where: { id },
        data: dto,
        include: { parent: true, children: true },
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating category' });
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.category.delete({ where: { id } });
      return { message: `Category #${id} removed successfully` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing category' });
    }
  }
}
