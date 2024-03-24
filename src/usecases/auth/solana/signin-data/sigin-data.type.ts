import { SolanaSignInInput } from '@solana/wallet-standard-features';

interface ISignInDataResponse extends IResponseBase {
  data: SolanaSignInInput;
}

export { ISignInDataResponse };
