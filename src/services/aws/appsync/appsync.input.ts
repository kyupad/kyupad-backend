import { ClassType } from '@/services/api/api.interface';

interface IAppSyncBody<T> {
  query: string;
  operationName: string;
  variables?: T;
}

interface IAppSyncQueryOption<O> {
  plain?: boolean;
  functionName: string;
  cls?: ClassType<O>;
  passError?: boolean;
}

export { IAppSyncBody, IAppSyncQueryOption };
