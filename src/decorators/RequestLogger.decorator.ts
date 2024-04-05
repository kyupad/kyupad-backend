import { Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { v4 } from 'uuid';

const RequestLogger = () => (target: any, _: any, descriptor: any) => {
  const logger = new Logger('RequestLogger');
  const method = descriptor.value;
  descriptor.value = async function (...args: any) {
    const request = args[0] as FastifyRequest;
    logger.log(request);
    const requestId = v4();
    let logInfo = `[REQUEST-${requestId}] ${request.method} ${request.url}`;
    if (request.query)
      logInfo = `${logInfo} query ${JSON.stringify(request.query)}`;
    if (request.body)
      logInfo = `${logInfo} query ${JSON.stringify(request.body)}`;
    logger.log(logInfo);
    await method.apply(target, args);
  };
  return descriptor;
};
export default RequestLogger;
