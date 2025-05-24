import crypto from 'crypto';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

export function generateMfaSecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

function generateTotp(secret: string, offset = 0): string {
  const step = 30;
  const time = Math.floor(Date.now() / 1000 / step) + offset;
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(time, 4);
  const key = Buffer.from(secret, 'hex');
  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const pos = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(pos) & 0x7fffffff) % 1000000;
  return code.toString().padStart(6, '0');
}

export function verifyTotp(secret: string, token: string): boolean {
  for (let i = -1; i <= 1; i++) {
    if (generateTotp(secret, i) === token) return true;
  }
  return false;
}
