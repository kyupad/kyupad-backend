import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Season, SeasonSchema } from '@schemas/seasons.schema';
import { SeasonService } from '@/services/season/season.service';
import { AwsSchedulerServiceModule } from '@/services/aws';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Season.name, schema: SeasonSchema }]),
    AwsSchedulerServiceModule,
    NftServiceModule,
  ],
  controllers: [],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonServiceModule {}
