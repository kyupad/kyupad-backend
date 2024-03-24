interface IResponseBase {
  statusCode: number;
  message?: string;
  data?: any;
  error?: string;
}
