import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else {
  console.error('.env file not found.');
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production';

export const PORT = (process.env.PORT || 3003) as number;

export const MONGO_URI = prod ? (process.env.MONGO_PROD as string) : (process.env.MONGO_LOCAL as string);

if (!MONGO_URI) {
  if (prod) {
    console.error('No mongo connection string. Set MONGO_PROD environment variable.');
  } else {
    console.error('No mongo connection string. Set MONGO_LOCAL environment variable.');
  }
  process.exit(1);
}

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const COOKIE_KEY = process.env.COOKIE_KEY as string;
export const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY ?? ''
export const ACCESS_TOKEN_PRIVATE_TIME = process.env.ACCESS_TOKEN_PRIVATE_TIME ?? '10h'
export const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY ?? ''
export const REFRESH_TOKEN_PRIVATE_TIME = process.env.REFRESH_TOKEN_PRIVATE_TIME ?? '7d'
export const SALT = process.env.BCRYPT_SALT ?? '10';
export const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL ?? 'http://localhost:3000';
export const GOOGLE_CALLBACK_REDIRECT = process.env.GOOGLE_CALLBACK_REDIRECT ?? '/auth/google/redirect'
