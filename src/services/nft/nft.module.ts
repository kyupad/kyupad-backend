import { Module } from '@nestjs/common';
import { NftService } from '@/services/nft/nft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NftWhiteList,
  NftWhiteListSchema,
} from '@schemas/nft_whitelists.schema';
import { SeasonServiceModule } from '@/services/season/season.module';
import { S3Module } from '../aws/s3/s3.module';
import { KyupadNft, KyupadNftSchema } from '@schemas/kyupad_nft.schema';
import { HeliusServiceModule } from '@/services/helius/helius.module';
import { AppsyncServiceModule } from '@/services/aws/appsync/appsync.module';
import {
  NftCollection,
  NftCollectionSchema,
} from '@schemas/nft_collections.schema';
import { RefCode, RefCodeSchema } from '@schemas/ref_code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NftWhiteList.name, schema: NftWhiteListSchema },
      { name: KyupadNft.name, schema: KyupadNftSchema },
      { name: NftCollection.name, schema: NftCollectionSchema },
      { name: RefCode.name, schema: RefCodeSchema },
    ]),
    NftServiceModule,
    SeasonServiceModule,
    S3Module,
    HeliusServiceModule,
    AppsyncServiceModule,
  ],
  providers: [NftService],
  exports: [NftService],
})
export class NftServiceModule {}
