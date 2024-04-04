import { Module } from '@nestjs/common';
import { UserRegistrationController } from '@usecases/registration/user_registration.controller';

@Module({
  imports: [],
  controllers: [UserRegistrationController],
})
export class UserRegistrationModule {}
