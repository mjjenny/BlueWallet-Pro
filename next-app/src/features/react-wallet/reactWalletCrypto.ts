import type { ReactWalletCryptoEnvelope } from "./reactWalletTypes";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 8;
export const PIN_KDF_ITERATIONS = 310_000;

export function validatePin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`).test(pin);
}

function getCrypto(): Crypto {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is not available in this browser.");
  return globalThis.crypto;
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  getCrypto().getRandomValues(bytes);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export async function generateVaultDataKey(): Promise<CryptoKey> {
  return getCrypto().subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function importAesKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return getCrypto().subtle.importKey("raw", toArrayBuffer(rawKey), { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function derivePinKey(pin: string, salt: string, iterations = PIN_KDF_ITERATIONS): Promise<CryptoKey> {
  if (!validatePin(pin)) throw new Error("PIN must be 4 to 8 digits.");
  const baseKey = await getCrypto().subtle.importKey("raw", toArrayBuffer(textEncoder.encode(pin)), "PBKDF2", false, ["deriveKey"]);
  return getCrypto().subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(base64ToBytes(salt)),
      iterations,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(
  key: CryptoKey,
  plaintext: Uint8Array,
  aad?: string,
): Promise<ReactWalletCryptoEnvelope> {
  const iv = randomBytes(12);
  const additionalData = aad ? toArrayBuffer(textEncoder.encode(aad)) : undefined;
  const encrypted = await getCrypto().subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv), additionalData }, key, toArrayBuffer(plaintext));
  return {
    version: 1,
    algorithm: "AES-256-GCM",
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    aad,
  };
}

export async function decryptBytes(key: CryptoKey, envelope: ReactWalletCryptoEnvelope, aad?: string): Promise<Uint8Array> {
  if (envelope.version !== 1 || envelope.algorithm !== "AES-256-GCM") {
    throw new Error("Unsupported crypto envelope.");
  }
  const expectedAad = aad ?? envelope.aad;
  const additionalData = expectedAad ? toArrayBuffer(textEncoder.encode(expectedAad)) : undefined;
  const decrypted = await getCrypto().subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(envelope.iv)), additionalData },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  );
  return new Uint8Array(decrypted);
}

export async function encryptJson<T>(key: CryptoKey, value: T, aad: string): Promise<ReactWalletCryptoEnvelope> {
  return encryptBytes(key, textEncoder.encode(JSON.stringify(value)), aad);
}

export async function decryptJson<T>(key: CryptoKey, envelope: ReactWalletCryptoEnvelope, aad: string): Promise<T> {
  const bytes = await decryptBytes(key, envelope, aad);
  return JSON.parse(textDecoder.decode(bytes)) as T;
}

export async function wrapVaultDataKey(dataKey: CryptoKey, pinKey: CryptoKey): Promise<ReactWalletCryptoEnvelope> {
  const raw = new Uint8Array(await getCrypto().subtle.exportKey("raw", dataKey));
  return encryptBytes(pinKey, raw, "vault-data-key");
}

export async function unwrapVaultDataKey(envelope: ReactWalletCryptoEnvelope, pinKey: CryptoKey): Promise<CryptoKey> {
  const raw = await decryptBytes(pinKey, envelope, "vault-data-key");
  return importAesKey(raw);
}

export function createSalt(): string {
  return bytesToBase64(randomBytes(16));
}
