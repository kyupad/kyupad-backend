import { Module } from '@nestjs/common';
import { NftService } from '@/services/nft/nft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NftWhiteList,
  NftWhiteListSchema,
} from '@schemas/nft_whitelists.schema';
import { SeasonServiceModule } from '@/services/season/season.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NftWhiteList.name, schema: NftWhiteListSchema },
    ]),
    NftServiceModule,
    SeasonServiceModule,
  ],
  providers: [NftService],
  exports: [NftService],
})
export class NftServiceModule {}
