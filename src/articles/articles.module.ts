import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, MulterModule.register({ storage: memoryStorage() })],
  providers: [ArticlesService],
  controllers: [ArticlesController],
  exports: [ArticlesService],
})
export class ArticlesModule {}
