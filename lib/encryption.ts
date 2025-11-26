import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Derive a 32-byte key from the env string
const KEY = crypto
  .createHash("sha256")
  .update(process.env.MESSAGE_ENCRYPTION_KEY || "")
  .digest();

if (!process.env.MESSAGE_ENCRYPTION_KEY) {
  console.warn("⚠️ MESSAGE_ENCRYPTION_KEY is not set. Encryption will not work correctly.");
}

// Encrypts a UTF-8 string → base64 string
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Store iv + tag + ciphertext into one buffer
  const payload = Buffer.concat([iv, tag, encrypted]);
  return payload.toString("base64");
}

// Decrypts base64 string → original UTF-8 string
export function decrypt(payload: string): string {
  const data = Buffer.from(payload, "base64");

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28); // 16 bytes auth tag
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
