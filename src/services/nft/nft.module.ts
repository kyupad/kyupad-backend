import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftService } from './nft.service';
import {
  NftCollection,
  NftCollectionSchema,
} from '@schemas/nft_collections.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NftCollection.name, schema: NftCollectionSchema },
    ]),
  ],
  controllers: [],
  providers: [NftService],
  exports: [NftService],
})
export class NftServiceModule {}
