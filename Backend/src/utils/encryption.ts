import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// IV length for AES-GCM is typically 12 bytes
const IV_LENGTH = 12;
// Auth tag length is typically 16 bytes
const AUTH_TAG_LENGTH = 16;

const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY;

if (!MASTER_KEY || Buffer.from(MASTER_KEY, 'hex').length !== 32) {
  console.warn('WARNING: MASTER_ENCRYPTION_KEY is not set or not 32 bytes. Encryption will fail.');
}

/**
 * Encrypts a string using AES-256-GCM.
 * @param text The plaintext string to encrypt.
 * @returns The encrypted string in the format "ivHex:authTagHex:encryptedTextHex".
 */
export function encrypt(text: string): string {
  if (!MASTER_KEY) {
    throw new Error('MASTER_ENCRYPTION_KEY is not configured');
  }

  const keyBuffer = Buffer.from(MASTER_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with AES-256-GCM.
 * @param hash The encrypted string in the format "ivHex:authTagHex:encryptedTextHex".
 * @returns The decrypted plaintext string.
 */
export function decrypt(hash: string): string {
  if (!MASTER_KEY) {
    throw new Error('MASTER_ENCRYPTION_KEY is not configured');
  }

  const parts = hash.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted hash format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const keyBuffer = Buffer.from(MASTER_KEY, 'hex');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const authTagBuffer = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
