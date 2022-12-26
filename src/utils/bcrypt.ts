import bcrypt from 'bcrypt';

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT as string));
};
