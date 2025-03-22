// Use a custom implementation to avoid ESM issues with nanoid
import crypto from 'crypto';

// Simple ID generator function that creates random IDs
export const id = (size = 10) => {
  const bytes = crypto.randomBytes(Math.ceil(size * 3 / 4));
  return bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, size);
};