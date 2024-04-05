import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from '@fastify/compress';
import fastifyCsrf from '@fastify/csrf-protection';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { AllExceptionsFilter } from '@filters/all-exceptions.filter';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { VersioningType, Logger, ValidationPipe } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import * as process from 'process';

async function bootstrap() {
  const logger = new Logger('Meow Meow');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { rawBody: true },
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: false }));
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: 'v1',
    prefix: false,
  });
  app.useBodyParser('json');
  await app.register(cors, {
    credentials: true,
    origin: ['http://localhost:3000'],
  });
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(fastifyCsrf);
  await app.register(helmet);
  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  await app.register(fastifyCookie);
  const configService = app.get(ConfigService);
  if (process.env.SWAGGER_ENABLE === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Kyupad - OpenAPI')
      .setDescription('Kyupad - OpenAPI')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'jwt-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }
  await app.listen(+configService.get('PORT')!, '0.0.0.0');
  logger.log(`Server is running on: ${await app.getUrl()}`);
}

bootstrap().then();
