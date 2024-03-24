import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SigninDataModule } from './solana/signin-data/signin-data.module';
import { VerifySiwsModule } from './solana/verify-siws/verify-siws.module';
import { RefreshModule } from './refresh/refresh.module';

@Module({
  imports: [
    SigninDataModule,
    VerifySiwsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    RefreshModule,
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
