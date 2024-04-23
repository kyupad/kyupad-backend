import { Inject, Injectable } from '@nestjs/common';
import { ApiService } from '@/services/api/api.service';
import { HeliusEventHook } from '@/services/helius/helius.response';

@Injectable()
export class HeliusService {
  private HELIUS_API_URL = process.env.HELIUS_API_URL;
  private HELIUS_API_KEY = process.env.HELIUS_API_KEY;

  constructor(
    @Inject(ApiService)
    private readonly apiService: ApiService,
  ) {}

  async getTxInfo(tx: string): Promise<HeliusEventHook[]> {
    const url = `${this.HELIUS_API_URL}/v0/transactions/?api-key=${this.HELIUS_API_KEY}`;
    const result = await this.apiService.post<
      { transactions: string[] },
      HeliusEventHook[]
    >(
      url,
      { transactions: [tx] },
      {
        cls: HeliusEventHook as any,
        plain: true,
        byPassError: true,
      },
    );
    return result || [];
  }
}
