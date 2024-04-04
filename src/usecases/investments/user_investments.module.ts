import { Module } from '@nestjs/common';
import { UserInvestmentsController } from '@usecases/investments/investments_registration.controller';

@Module({
  imports: [],
  controllers: [UserInvestmentsController],
})
export class UserInvestmentsModule {}
