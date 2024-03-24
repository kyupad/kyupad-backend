import { Module } from '@nestjs/common';
import { VerifySiwsController } from './verify-siws.controller';
import { UserModule } from '@/models/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [VerifySiwsController],
})
export class VerifySiwsModule {}
