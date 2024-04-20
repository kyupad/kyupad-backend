import { Module } from '@nestjs/common';
import { NftServiceModule } from '@/services/nft/nft.module';
import { NftController } from '@usecases/nft/nft.controller';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [NftServiceModule, ClsModule],
  controllers: [NftController],
})
export class NftModule {}
