export default () => ({
  BASE_URL: process.env.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  WEB_URL: process.env.WEB_URL,
  CHAIN_ID: process.env.CHAIN_ID,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 8080,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  CRYPTO_ENCRYPT_TOKEN: process.env.CRYPTO_ENCRYPT_TOKEN,
  AWS_S3_BUCKET_URL: process.env.AWS_S3_BUCKET_URL,
  AWS_QUEUE_URL: process.env.AWS_QUEUE_URL,
  HELIUS_WEBHOOK_TOKEN: process.env.HELIUS_WEBHOOK_TOKEN,
  HELIUS_API_URL: process.env.HELIUS_API_URL,
  HELIUS_API_KEY: process.env.HELIUS_API_KEY,
  AWS_APPSYNC_ENDPOINT: process.env.AWS_APPSYNC_ENDPOINT,
  PREFER_ENCRYPT_TOKEN: process.env.PREFER_ENCRYPT_TOKEN,
  RPC_ENDPOINT: process.env.RPC_ENDPOINT,
});
