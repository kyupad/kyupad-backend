import { Module } from '@nestjs/common';
import { ApiServiceModule } from '@/services/api/api.module';
import { HeliusService } from '@/services/helius/helius.service';

@Module({
  imports: [ApiServiceModule],
  providers: [HeliusService],
  exports: [HeliusService],
})
export class HeliusServiceModule {}
