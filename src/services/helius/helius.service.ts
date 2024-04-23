import { Injectable } from '@nestjs/common';

@Injectable()
class HeliusService {
  private HELIUS_API_URL = process.env.HELIUS_API_URL;
  private HELIUS_API_KEY = process.env.HELIUS_API_KEY;
  async getTxInfo(tx: string): Promise<any> {
    const url = ``;
  }
}
