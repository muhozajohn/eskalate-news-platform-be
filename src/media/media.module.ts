import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, MulterModule.register({ storage: memoryStorage() })],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
