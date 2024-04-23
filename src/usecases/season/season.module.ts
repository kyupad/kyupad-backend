import { Module } from '@nestjs/common';
import { SeasonServiceModule } from '@/services/season/season.module';
import { SeasonController } from '@usecases/season/season.controller';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [SeasonServiceModule, NftServiceModule],
  controllers: [SeasonController],
})
export class SeasonModule {}
