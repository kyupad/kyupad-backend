import { Module } from '@nestjs/common';
import { NftServiceModule } from '@/services/nft/nft.module';
import { WhiteListController } from '@usecases/admin/nft/whitelist/whitelist.controller';

@Module({
  imports: [NftServiceModule],
  controllers: [WhiteListController],
})
export class WhiteListModule {}
