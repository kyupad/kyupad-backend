import { Module } from '@nestjs/common';
import { AdminProjectController } from './project.controller';
import { ProjectModule } from '@/services/project/project.module';

@Module({
  imports: [ProjectModule],
  controllers: [AdminProjectController],
})
export class AdminProjectModule {}
