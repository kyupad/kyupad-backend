import { Module } from '@nestjs/common';
import { UserVestingController } from '@usecases/vesting/user_vesting.controller';

@Module({
  imports: [],
  controllers: [UserVestingController],
})
export class UserVestingModule {}
