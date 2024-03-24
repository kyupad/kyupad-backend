import {
  Catch,
  ArgumentsHost,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    this.logger.error(JSON.stringify(exception.message));
    super.catch(
      (!exception?.response || exception?.response?.error) &&
        !exception?.response?.info
        ? new InternalServerErrorException("Ops. Meow's fault!")
        : exception,
      host,
    );
  }
}
