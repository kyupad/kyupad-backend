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
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from '@usecases/project/project.module';

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
    ProjectModule,
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
      },
      {
        path: 'projects',
        module: ProjectModule,
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
