import { CHAIN_ID } from '@/constants';
import Joi from 'joi';

const envSchema = Joi.object({
  BASE_URL: Joi.string().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  WEB_URL: Joi.string().required(),
  CHAIN_ID: Joi.string()
    .valid(CHAIN_ID.Mainnet, CHAIN_ID.Testnet, CHAIN_ID.Devnet)
    .required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
  PORT: Joi.number().required().default(8080),
  ALLOWED_ORIGINS: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  CRYPTO_ENCRYPT_TOKEN: Joi.string().required(),
  AWS_S3_BUCKET_URL: Joi.string().required(),
  AWS_QUEUE_URL: Joi.string().required(),
  HELIUS_WEBHOOK_TOKEN: Joi.string().required(),
  HELIUS_API_URL: Joi.string().required(),
  HELIUS_API_KEY: Joi.string().required(),
  AWS_APPSYNC_ENDPOINT: Joi.string().required(),
  PREFER_ENCRYPT_TOKEN: Joi.string().required(),
  RPC_ENDPOINT: Joi.string().required(),
});

export { envSchema };
