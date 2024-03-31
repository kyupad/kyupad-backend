import { MongoClient } from 'mongodb';

export const db = async () => {
  const client: any = await MongoClient.connect(
    process.env.MONGODB_URI as string,
  );
  return client.db();
};
