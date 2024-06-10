import { Module } from '@nestjs/common';
import { StreamFlowService } from '@/services/streamflow/streamflow.service';

@Module({
  imports: [],
  controllers: [],
  providers: [StreamFlowService],
  exports: [StreamFlowService],
})
export class StreamFlowServiceModule {}
