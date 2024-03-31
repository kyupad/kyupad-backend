import { Module } from '@nestjs/common';
import { VerifySiwsController } from './verify-siws.controller';
import { UserModule } from '@/services/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [VerifySiwsController],
})
export class VerifySiwsModule {}
