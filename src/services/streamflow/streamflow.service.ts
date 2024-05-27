import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import {
  ICluster,
  IGetAllData,
  StreamDirection,
  StreamflowSolana,
  StreamType,
} from '@streamflow/stream';
import { Connection } from '@solana/web3.js';
import SolanaStreamClient from '@streamflow/stream/dist/solana';
import { MyStreamFlowStream } from '@/services/streamflow/streamflow.response';
import { getDecimalOfToken } from '@helpers/contract.helper';

@Injectable()
export class StreamFlowService {
  private solanaClient: SolanaStreamClient;

  private readonly conn: Connection;

  constructor() {
    this.solanaClient = new StreamflowSolana.SolanaStreamClient(
      process.env.RPC_ENDPOINT as string,
      process.env.STAGE === 'dev' ? ICluster.Devnet : ICluster.Mainnet,
    );
    this.conn = new Connection(process.env.RPC_ENDPOINT as string, 'confirmed');
  }

  async incomingStreamsOfOwner(
    projectId: string,
    owner: string,
    token: string,
  ): Promise<MyStreamFlowStream[]> {
    const query: IGetAllData = {
      address: owner,
      type: StreamType.Vesting,
      direction: StreamDirection.Incoming,
    };
    const [decimals, streams] = await Promise.all([
      getDecimalOfToken(token, this.conn),
      this.solanaClient.get(query),
    ]);
    const matchStreams = streams.filter(
      (stream) => stream[1].name.split('-')[0] === projectId,
    );
    const numDecimals = Number(1 + '0'.repeat(decimals));
    const streamsMatch: MyStreamFlowStream[] = [];
    matchStreams.forEach((stream) => {
      const fullStreamData = stream[1];
      const streamId = stream[0];
      const isCliff = fullStreamData.period === 1;
      if (fullStreamData.mint === token) {
        const data: MyStreamFlowStream = {
          stream_id: streamId,
          is_cliff: isCliff,
          name: fullStreamData.name.split('\u0000')[0],
          sender: fullStreamData.sender,
          recipient: fullStreamData.recipient,
          token: fullStreamData.mint,
          period: fullStreamData.period,
          start_at: new Date(fullStreamData.start * 1000).toISOString(),
          end_at: new Date(fullStreamData.end * 1000).toISOString(),
          amount_per_period:
            fullStreamData.amountPerPeriod.toNumber() / numDecimals,
          total_amount:
            (fullStreamData.depositedAmount || 0).toNumber() / numDecimals,
          withdrawn_amount:
            (fullStreamData.withdrawnAmount || 0).toNumber() / numDecimals,
          fee: fullStreamData.streamflowFeeTotal.toNumber(),
          deposit: fullStreamData.depositedAmount.toNumber(),
          cliff_at: new Date(fullStreamData.cliff * 1000).toISOString(),
          cliff_amount: fullStreamData.cliffAmount.toNumber(),
          automatic_withdrawal: fullStreamData.automaticWithdrawal,
          cancelable_by_recipient: fullStreamData.cancelableByRecipient,
          cancelable_by_sender: fullStreamData.cancelableBySender,
          transferable_by_recipient: fullStreamData.transferableByRecipient,
          transferableBySender: fullStreamData.transferableBySender,
          created_at: new Date(fullStreamData.createdAt * 1000).toISOString(),
        };
        if (fullStreamData.lastWithdrawnAt > 0)
          data.last_withdrawn_at = new Date(
            fullStreamData.lastWithdrawnAt * 1000,
          ).toISOString();
        const currentTime = new Date().getTime();
        const endTime = new Date(fullStreamData.end * 1000).getTime();
        const releaseRange =
          (currentTime < endTime
            ? currentTime
            : endTime + data.amount_per_period) -
          (fullStreamData.start + data.period) * 1000;
        let releasedRatio =
          releaseRange < 0 ? 0 : Math.ceil(releaseRange / 1000 / data.period);
        if (isCliff) releasedRatio = 1;
        data.released_amount = releasedRatio * data.amount_per_period;
        data.available_amount =
          data.released_amount - (data.withdrawn_amount || 0);
        streamsMatch.push(data);
      }
    });
    return streamsMatch;
  }
}
