import { Module } from '@nestjs/common';
import { NftServiceModule } from '@/services/nft/nft.module';
import { NftController } from '@usecases/nft/nft.controller';

@Module({
  imports: [NftServiceModule],
  controllers: [NftController],
})
export class NftModule {}
