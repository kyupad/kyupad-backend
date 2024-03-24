interface IRefreshResponse extends IResponseBase {
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export { IRefreshResponse };
