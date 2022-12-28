import bcrypt from 'bcrypt';

const salt = process.env.BCRYPT_SALT ?? '10';

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, parseInt(salt));
};
