import bcrypt from 'bcrypt';
import { SALT } from './secrets';

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, parseInt(SALT));
};
