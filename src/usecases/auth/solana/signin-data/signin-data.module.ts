import { Module } from '@nestjs/common';
import { SigninDataController } from './signin-data.controller';

@Module({
  controllers: [SigninDataController],
})
export class SigninDataModule {}
