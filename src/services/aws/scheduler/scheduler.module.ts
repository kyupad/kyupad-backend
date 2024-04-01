import { Module } from '@nestjs/common';
import { AwsSchedulerService } from '@/services/aws/scheduler/scheduler.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsSchedulerService],
  exports: [AwsSchedulerService],
})
export class AwsSchedulerServiceModule {}
