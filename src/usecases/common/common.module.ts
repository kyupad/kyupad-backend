import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CommonController } from '@usecases/common/common.controller';
import { NftServiceModule } from '@/services/nft/nft.module';
import { UserProjectServiceModule } from '@/services/user-project/user-project.module';

@Module({
  imports: [ClsModule, NftServiceModule, UserProjectServiceModule],
  controllers: [CommonController],
})
export class CommonModule {}
