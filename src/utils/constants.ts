import { config } from 'dotenv';

config();

export const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY ?? '';
export const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY ?? '';
export const ACCESS_TOKEN_PRIVATE_TIME = process.env.ACCESS_TOKEN_PRIVATE_TIME ?? '';
export const REFRESH_TOKEN_PRIVATE_TIME = process.env.REFRESH_TOKEN_PRIVATE_TIME ?? '';
