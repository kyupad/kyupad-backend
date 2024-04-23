import { IncomingHttpHeaders } from 'http';

declare type ClassType<T> = {
  new (...args: any[]): T;
};

interface GetRequestOption<I, O> {
  par?: string | number;
  byPassError?: boolean;
  header?: IncomingHttpHeaders;
  query?: I;
  plainToClass?: boolean;
  paging?: boolean;
  cls?: ClassType<O>;
  url: string;
}

interface PostRequestOption<O> {
  plain?: boolean;
  cls?: ClassType<O>;
  defaultResponse?: any;
  bodyMode?: 'default' | 'urlencoded' | 'form-data';
  header?: IncomingHttpHeaders;
  logPrivate?: {
    mode: 'BODY' | 'PARAMS';
    fields: string[];
  };
  dataKey?: 'success' | string;
  byPassError?: boolean;
}

export { GetRequestOption, ClassType, PostRequestOption };
