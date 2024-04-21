import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CommonController } from '@usecases/common/common.controller';

@Module({
  imports: [ClsModule],
  controllers: [CommonController],
})
export class CommonModule {}
