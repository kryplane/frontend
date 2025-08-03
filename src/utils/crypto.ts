import { ethers } from 'ethers';

/**
 * Generate a receiver hash from either a secret code or wallet signature
 * @param input - The secret code or signed message
 * @returns The keccak256 hash as a string
 */
export function generateReceiverHash(input: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

/**
 * Generate a secret code for users who don't want to use wallet signatures
 * @returns A cryptographically secure random secret code
 */
export function generateSecretCode(): string {
  const randomBytes = ethers.randomBytes(32);
  return ethers.hexlify(randomBytes);
}

/**
 * Encrypt data using AES-GCM
 * @param data - The data to encrypt
 * @param key - The encryption key
 * @returns The encrypted data with IV
 */
export async function encryptData(data: string, key: string): Promise<string> {
  // For now, we'll use a simple implementation
  // In production, you'd want to use proper AES-GCM encryption
  const encoder = new TextEncoder();
  const keyBytes = ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes(key)));
  
  // Simple XOR encryption for demo purposes
  // Replace with proper AES-GCM implementation
  const dataBytes = encoder.encode(data);
  const encrypted = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return ethers.hexlify(encrypted);
}

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - The encrypted data
 * @param key - The decryption key
 * @returns The decrypted data
 */
export async function decryptData(encryptedData: string, key: string): Promise<string> {
  const keyBytes = ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes(key)));
  const encrypted = ethers.getBytes(encryptedData);
  
  // Simple XOR decryption for demo purposes
  const decrypted = new Uint8Array(encrypted.length);
  
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
