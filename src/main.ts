import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from '@fastify/compress';
import fastifyCsrf from '@fastify/csrf-protection';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { VersioningType, Logger } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Meow Meow');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: 'v1',
    prefix: false,
  });

  await app.register(cors);
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(fastifyCsrf);
  await app.register(helmet);
  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  await app.register(fastifyCookie);
  const configService = app.get(ConfigService);

  await app.listen(+configService.get('PORT')!, '0.0.0.0');
  logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
