import { Module } from '@nestjs/common';
import { AwsSQSService } from '@/services/aws/sqs/sqs.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsSQSService],
  exports: [AwsSQSService],
})
export class AwsSQSServiceModule {}
