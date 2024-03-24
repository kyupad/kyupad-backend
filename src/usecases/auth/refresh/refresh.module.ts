import { Module } from '@nestjs/common';
import { RefreshController } from './refresh.controller';

@Module({
  controllers: [RefreshController],
})
export class RefreshModule {}
