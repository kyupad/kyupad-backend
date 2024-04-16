import { Module } from '@nestjs/common';
import { SeasonServiceModule } from '@/services/season/season.module';
import { SeasonController } from '@usecases/season/season.controller';

@Module({
  imports: [SeasonServiceModule],
  controllers: [SeasonController],
})
export class SeasonModule {}
