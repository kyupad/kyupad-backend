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

export { GetRequestOption, ClassType };
