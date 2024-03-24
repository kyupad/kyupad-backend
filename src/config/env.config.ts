export default () => ({
  BASE_URL: process.env.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  WEB_URL: process.env.WEB_URL,
  CHAIN_ID: process.env.CHAIN_ID,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 8080,
});
