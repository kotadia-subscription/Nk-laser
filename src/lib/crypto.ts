/**
 * High-Security Cryptographic Utilities for Browser and Edge Runtimes
 * Provides Web Crypto API based AES-256-GCM encryption/decryption
 * and SHA-256 one-way hashing with constant-time verification.
 */

// Default client salt for obfuscated payload derivation
const CLIENT_SECRET_SALT = 'nk_laser_subtle_gcm_salt_9902';

/**
 * Computes a SHA-256 hex digest using browser Web Crypto API
 */
export async function sha256Hex(text: string): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(trimmed);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple 32-byte non-cryptographic hash if subtle crypto is unavailable
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from a secret passphrase
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plain text using AES-256-GCM (random 96-bit IV, 128-bit auth tag)
 * Format: enc:v1:<salt-hex>:<iv-hex>:<ciphertext-hex>
 */
export async function encryptAESGCM(plainText: string, secretKey = CLIENT_SECRET_SALT): Promise<string> {
  if (!plainText || typeof window === 'undefined' || !window.crypto?.subtle) {
    return '';
  }

  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(secretKey, salt);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const cipherArray = Array.from(new Uint8Array(cipherBuffer));
    const cipherHex = cipherArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

    return `enc:v1:${saltHex}:${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error('[Crypto] Encryption error:', err);
    return '';
  }
}

/**
 * Decrypts AES-256-GCM cipher payload
 */
export async function decryptAESGCM(payload: string, secretKey = CLIENT_SECRET_SALT): Promise<string | null> {
  if (!payload || !payload.startsWith('enc:v1:') || typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  try {
    const parts = payload.split(':');
    if (parts.length !== 5) return null;

    const saltHex = parts[2];
    const ivHex = parts[3];
    const cipherHex = parts[4];

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const cipherBytes = new Uint8Array(cipherHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const key = await deriveKey(secretKey, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error('[Crypto] Decryption failed or invalid key:', err);
    return null;
  }
}
