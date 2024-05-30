import { EEmailType } from '@/enums';

interface ISesOption {
  type: EEmailType;
  from?: string;
  to: string[];
  subject: {
    data: string;
    charset: 'UTF-8';
  };
  body: {
    text?: {
      data: string;
      charset: 'UTF-8';
    };
    html?: {
      data: string;
      charset: 'UTF-8';
    };
  };
}

export { ISesOption };
