import { Module } from '@nestjs/common';
import { UserPoolController } from '@usecases/pools/user_pool.controller';

@Module({
  imports: [],
  controllers: [UserPoolController],
})
export class UserPoolModule {}
