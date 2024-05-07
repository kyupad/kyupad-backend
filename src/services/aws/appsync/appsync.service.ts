import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HeaderBag, HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import {
  IAppSyncBody,
  IAppSyncQueryOption,
} from '@/services/aws/appsync/appsync.input';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AppsyncService {
  private readonly logger = new Logger(AppsyncService.name);
  private AWS_APPSYNC_ENDPOINT = process.env.AWS_APPSYNC_ENDPOINT as string;

  async sign<I>(input: IAppSyncBody<I>): Promise<HeaderBag> {
    const { hostname, pathname } = new URL(this.AWS_APPSYNC_ENDPOINT);
    const request = new HttpRequest({
      hostname: hostname,
      path: pathname,
      body: JSON.stringify(input),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: hostname,
      },
    });
    const signer = new SignatureV4({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
      service: 'appsync',
      region: process.env.AWS_REGION || 'ap-southeast-1',
      sha256: Sha256,
    });
    const { headers } = await signer.sign(request);
    return headers;
  }

  async query<I, O>(
    body: IAppSyncBody<I>,
    option?: IAppSyncQueryOption<O>,
  ): Promise<O | undefined> {
    this.logger.log(
      `[PROCESSING] [APPSYNC] Call [${option?.functionName}] with params [${JSON.stringify(body.variables)}]`,
    );
    const headers = await this.sign<I>(body);
    let data: O;
    try {
      const result: any = await axios.post(this.AWS_APPSYNC_ENDPOINT, body, {
        headers,
      });
      if (result.data?.errors && result.data?.errors.length > 0) {
        throw new Error(JSON.stringify(result.data?.errors));
      }
      data = result.data.data[option?.functionName || ''];
      if (option?.plain && data && option.cls) {
        data = plainToInstance(option.cls, data);
      }
      this.logger.log(`[SUCCESS] [APPSYNC] Call [${option?.functionName}]`);
      return data;
    } catch (e: any) {
      if (option?.passError) {
        this.logger.error(
          `[APPSYNC] call [${option?.functionName}] has error: ${
            e?.response?.data?.errors
              ? JSON.stringify(e?.response?.data?.errors)
              : e.stack
          }`,
        );
      } else {
        throw new InternalServerErrorException(
          `[APPSYNC] call [${option?.functionName}] has error: ${
            e?.response?.data?.errors
              ? JSON.stringify(e?.response?.data?.errors)
              : e.stack
          }`,
        );
      }
    }
  }
}
