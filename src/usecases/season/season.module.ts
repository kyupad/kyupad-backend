import { Module } from '@nestjs/common';
import { SeasonServiceModule } from '@/services/season/season.module';
import { SeasonController } from '@usecases/season/season.controller';
import { NftServiceModule } from '@/services/nft/nft.module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [SeasonServiceModule, NftServiceModule, ClsModule],
  controllers: [SeasonController],
})
export class SeasonModule {}
