import { Controller, Get } from '@nestjs/common';
import { ISignInDataResponse } from './sigin-data.type';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { SolanaSignInInput } from '@solana/wallet-standard-features';
import { CHAIN_ID } from '@/constants';

@Controller()
export class SigninDataController {
  private readonly WEB_URL: string;
  private readonly CHAIN_ID: string;
  constructor(private readonly configService: ConfigService) {
    this.WEB_URL = this.configService.get<string>('WEB_URL')!;
    this.CHAIN_ID = this.configService.get<string>('CHAIN_ID')!;
  }
  @Get()
  signinData(): ISignInDataResponse {
    const now: Date = new Date();
    const currentUrl = new URL(this.WEB_URL);
    const domain = currentUrl.host;
    const nonce = crypto.randomBytes(16).toString('hex');

    // Convert the Date object to a string
    const currentDateTime = now.toISOString();
    const signInData: SolanaSignInInput = {
      domain,
      statement:
        'Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.',
      version: '1',
      nonce,
      chainId:
        this.CHAIN_ID === CHAIN_ID.Testnet
          ? CHAIN_ID.Testnet
          : CHAIN_ID.Mainnet,
      issuedAt: currentDateTime,
    };

    return { data: signInData, statusCode: 200 };
  }
}
