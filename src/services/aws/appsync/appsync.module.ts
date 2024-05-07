import { Module } from '@nestjs/common';
import { AppsyncService } from '@/services/aws/appsync/appsync.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AppsyncService],
  exports: [AppsyncService],
})
export class AppsyncServiceModule {}
