import { Module } from '@nestjs/common';
import { CollectionsController } from '@usecases/admin/nft/collections/collections.controller';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [NftServiceModule],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
