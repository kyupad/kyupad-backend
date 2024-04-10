import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UserServiceModule } from '@/services/user/user.module';

@Module({
  imports: [
    UserServiceModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
