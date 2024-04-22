import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CommonController } from '@usecases/common/common.controller';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [ClsModule, NftServiceModule],
  controllers: [CommonController],
})
export class CommonModule {}
