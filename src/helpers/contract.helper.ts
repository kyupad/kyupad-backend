import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

const getDecimalOfToken = async (
  tokenAddress: string,
  conn: Connection,
): Promise<number> => {
  const mint = new PublicKey(tokenAddress);
  const mintData = await getMint(conn, mint);
  return mintData.decimals;
};

export { getDecimalOfToken };
