import axios, { AxiosRequestConfig } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import Timeout = NodeJS.Timeout;
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { GetRequestOption } from '@/services/api/api.interface';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ApiService {
  private logger = new Logger(ApiService.name);

  public async get<I, O = any>(option: GetRequestOption<I, O>): Promise<O> {
    this.logger.log(
      `API METHOD [GET] URL [${option.url}] QUERY [${JSON.stringify(option.query || {})}]`,
    );
    try {
      return await new Promise(async (resolve, reject) => {
        try {
          const source = axios.CancelToken.source();
          const id: Timeout = setTimeout(
            () => {
              source.cancel(`Request cancel by time out error`);
              throw new InternalServerErrorException('TimeOut!');
            },
            Number(process.env.API_REQUEST_TIMEOUT || 20000),
          );
          let start = 0;
          if (process.env.PROCCESS_LOG === '1') start = Date.now();
          const config: AxiosRequestConfig = {
            cancelToken: source.token,
            params: { ...option.query },
            headers: { ...option.header },
          };
          const result: any = await axios.get(option.url, config);
          clearTimeout(id);
          if (process.env.PROCCESS_LOG === '1')
            this.logger.log(
              `PROCESS REQUEST ${(Date.now() - start).toString()}ms ${option.url}`,
            );
          let data: O = result?.data;
          if (option.plainToClass) {
            data = plainToInstance(option.cls as any, result?.data) as O;
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      throw e;
    }
  }
}
