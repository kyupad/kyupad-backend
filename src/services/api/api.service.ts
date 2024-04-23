import axios, { AxiosRequestConfig } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import Timeout = NodeJS.Timeout;
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import {
  GetRequestOption,
  PostRequestOption,
} from '@/services/api/api.interface';
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
        let id: Timeout;
        try {
          const source = axios.CancelToken.source();
          const id: Timeout = setTimeout(
            () => {
              source.cancel(`Request cancel by time out error`);
              reject(new InternalServerErrorException('TimeOut!'));
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          if (id) clearTimeout(id);
          reject(e);
        }
      });
    } catch (e) {
      throw e;
    }
  }

  public async post<I, O>(
    url: string,
    data: I,
    option: PostRequestOption<O>,
  ): Promise<O | undefined> {
    try {
      return await new Promise(async (resolve, reject) => {
        let id: Timeout;
        try {
          const body: any = data;
          const source = axios.CancelToken.source();
          id = setTimeout(
            () => {
              source.cancel(`API REQUEST cancel by time out error`);
              reject(new InternalServerErrorException('TimeOut!'));
            },
            Number(process.env.API_REQUEST_TIMEOUT || 20000),
          );

          let start = 0;
          if (process.env.PROCCESS_LOG === '1') start = Date.now();
          const config: AxiosRequestConfig = {
            cancelToken: source.token,
            headers: option?.header as any,
          };
          const bodyLog = { ...body };
          if (option?.logPrivate && option?.logPrivate.mode === 'BODY') {
            option?.logPrivate.fields.forEach(
              (field: any) => (bodyLog[field] = '*********'),
            );
          }
          this.logger.log(
            `API REQUEST POST ${url} body ${JSON.stringify(bodyLog)}`,
          );
          const result = await axios.post(url, body, config);
          clearTimeout(id);
          if (process.env.PROCCESS_LOG === '1')
            this.logger.log(`PROCESS API ${(Date.now() - start).toString()}ms`);
          let plainData: O = result?.data;
          if (option.plain && option.cls) {
            plainData = plainToInstance(option.cls, plainData);
          }
          resolve(plainData);
        } catch (e: any) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          if (id) clearTimeout(id);
          this.logger.error(
            `API REQUEST has error: ${JSON.stringify(e?.response?.data)}`,
          );
          reject(e);
        }
      });
    } catch (e: any) {
      if (!option?.byPassError) throw e;
    }
  }
}
