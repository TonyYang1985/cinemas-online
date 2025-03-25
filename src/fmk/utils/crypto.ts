import { createHash, createHmac } from 'crypto';
import { readFileSync } from 'fs';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';

interface KeyCache {
  privateKey?: string;
  publicKey?: string;
}

class FotCrypto {
  private static readonly keyCache: KeyCache = {};

  md5(input: string) {
    const md5 = createHash('md5');
    return md5.update(input).digest('hex');
  }

  sha1Hmac(input: string): string {
    const hmac = createHmac('sha1', this.privateKey);
    hmac.update(input);
    return hmac.digest('hex');
  }

  get privateKey(): string {
    const config = ConfigManager.getConfig<ApplicationConfig>('application');
    if (!FotCrypto.keyCache.privateKey) {
      FotCrypto.keyCache.privateKey = readFileSync(config.privateKeyPath, 'ascii');
    }
    return FotCrypto.keyCache.privateKey;
  }

  get publicKey(): string {
    const config = ConfigManager.getConfig<ApplicationConfig>('application');
    if (!FotCrypto.keyCache.publicKey) {
      FotCrypto.keyCache.publicKey = readFileSync(config.publicKeyPath, 'ascii');
    }
    return FotCrypto.keyCache.publicKey;
  }
}

export const crypto = new FotCrypto();
