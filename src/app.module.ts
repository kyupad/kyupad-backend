import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import env from './config/env.config';
import { envSchema } from '@/validation/env.validation';
import { HealthModule } from '@modules/health/health.module';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { AllExceptionsFilter } from '@filters/all-exceptions.filter';
import { AuthModule } from '@usecases/auth/auth.module';
import { PingModule } from '@modules/ping/ping.module';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';
import { ClsModule } from 'nestjs-cls';
import { parseCookies } from '@helpers/common.helper';
import { SigninDataModule, VerifySiwsModule } from '@usecases/auth/solana';
import { RefreshModule } from '@usecases/auth/refresh/refresh.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '@usecases/admin/admin.module';
import { CollectionsModule } from '@usecases/admin/nft';
import { SeasonModule } from '@usecases/admin/season/season.module';
import { ProjectsModule } from './usecases/projects/projects/projects.module';
import { UserSeasonModule } from '@usecases/season/user_season.module';
import { UserPoolModule } from '@usecases/pools/user_pool.module';
import { UserRegistrationModule } from '@usecases/registration/user_registration.module';
import { UserInvestmentsModule } from '@usecases/investments/user_investments.module';
import { UserParticipationModule } from '@usecases/investments/participations/participation_investments.module';
import { UserVestingModule } from '@usecases/vesting/user_vesting.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [env],
      cache: true,
      validationSchema: envSchema,
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60 * 1000,
    //     limit: 10,
    //   },
    // ]),
    AuthModule,
    PingModule,
    AdminModule,
    ProjectsModule,
    UserSeasonModule,
    UserPoolModule,
    UserRegistrationModule,
    UserInvestmentsModule,
    UserParticipationModule,
    UserVestingModule,
    ClsModule.forRoot({
      middleware: {
        mount: true,
        setup: (cls, req) => {
          const parsedCookies = parseCookies(req.headers.cookie);
          const accessToken = parsedCookies[ACCESS_TOKEN_KEY];
          const refreshToken = parsedCookies[REFRESH_TOKEN_KEY];

          if (accessToken) {
            cls.set('accessToken', accessToken);
          }

          if (refreshToken) {
            cls.set('refreshToken', refreshToken);
          }
        },
      },
    }),
    RouterModule.register([
      {
        path: 'health',
        module: HealthModule,
      },
      {
        path: 'ping',
        module: PingModule,
      },
      {
        path: 'auth',
        module: AuthModule,
        children: [
          { path: 'signin-data', module: SigninDataModule },
          { path: 'verify-siws', module: VerifySiwsModule },
          { path: 'refresh', module: RefreshModule },
        ],
      },
      {
        path: 'admin',
        module: AdminModule,
        children: [
          { path: 'nft/collections', module: CollectionsModule },
          {
            path: 'season',
            module: SeasonModule,
          },
        ],
      },
      {
        path: 'projects',
        module: ProjectsModule,
      },
      {
        path: 'seasons',
        module: UserSeasonModule,
      },
      {
        path: 'pools',
        module: UserPoolModule,
      },
      {
        path: 'registration',
        module: UserRegistrationModule,
      },
      {
        path: 'vesting',
        module: UserVestingModule,
      },
      {
        path: 'investments',
        module: UserInvestmentsModule,
        children: [
          {
            path: 'participation',
            module: UserParticipationModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
