import * as crypto from 'crypto';

export const md5 = (text: string): string => {
  return crypto.createHash('md5').update(text).digest('hex');
};

export { crypto };
