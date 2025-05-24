import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(__dirname, '../../data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadJson<T>(name: string, def: T): T {
  ensureDir();
  const file = path.join(DATA_DIR, name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(def, null, 2));
    return def;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return def;
  }
}

export function saveJson<T>(name: string, data: T) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), 'utf8');
}

const algorithm = 'aes-256-gcm';
const key = crypto.createHash('sha256').update(process.env.SECRET_KEY || 'secret').digest();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(data: string): string {
  const buf = Buffer.from(data, 'base64');
  const iv = buf.slice(0, 16);
  const tag = buf.slice(16, 32);
  const text = buf.slice(32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(text).toString('utf8') + decipher.final('utf8');
}

export function loadEncryptedJson<T>(name: string, def: T): T {
  ensureDir();
  const file = path.join(DATA_DIR, name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, encrypt(JSON.stringify(def)));
    return def;
  }
  try {
    const encrypted = fs.readFileSync(file, 'utf8');
    return JSON.parse(decrypt(encrypted)) as T;
  } catch {
    return def;
  }
}

export function saveEncryptedJson<T>(name: string, data: T) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, name), encrypt(JSON.stringify(data)), 'utf8');
}
