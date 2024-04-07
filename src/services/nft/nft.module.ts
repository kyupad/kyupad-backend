import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftService } from './nft.service';
import {
  NftCollection,
  NftCollectionSchema,
} from '@schemas/nft_collections.schema';
import {
  NftWhiteList,
  NftWhiteListSchema,
} from '@schemas/nft_whitelists.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NftCollection.name, schema: NftCollectionSchema },
    ]),
    MongooseModule.forFeature([
      { name: NftWhiteList.name, schema: NftWhiteListSchema },
    ]),
  ],
  controllers: [],
  providers: [NftService],
  exports: [NftService],
})
export class NftServiceModule {}
