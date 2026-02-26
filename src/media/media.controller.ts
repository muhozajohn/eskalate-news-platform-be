import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '../../generated/prisma/client.js';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file to Cloudinary and persist metadata in the DB',
    schema: {
      type: 'object',
      required: ['file', 'type'],
      properties: {
        file: { type: 'string', format: 'binary' },
        type: {
          type: 'string',
          enum: ['image', 'video', 'document'],
          example: 'image',
        },
        articleId: {
          type: 'integer',
          example: 1,
          description: 'Optionally link to an article',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a media file to Cloudinary' })
  @ApiResponse({ status: 201, description: 'File uploaded and record created' })
  upload(
    @Body() dto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.mediaService.upload(req.user.id, dto, file);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.editor)
  @ApiOperation({ summary: 'List all media files — admin/editor only' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated media list' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.mediaService.findAll(page, limit);
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get all media attached to a specific article' })
  @ApiResponse({ status: 200, description: 'Returns article media files' })
  findByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.mediaService.findByArticle(articleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media file by ID' })
  @ApiResponse({ status: 200, description: 'Returns media record' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file (uploader or admin)' })
  @ApiResponse({ status: 200, description: 'Media deleted' })
  @ApiResponse({ status: 403, description: 'Not your media' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.mediaService.remove(id, req.user.id, req.user.role);
  }
}
