import { Module } from '@nestjs/common';
import { SeSService } from '@/services/aws/ses/ses.service';

@Module({
  providers: [SeSService],
  exports: [SeSService],
})
export class SesServiceModule {}
