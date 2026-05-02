import crypto from "crypto";

/**
 * 🔐 AES-256-GCM Encryption Engine
 * - Military-grade encryption for all stored data
 * - Each encryption produces a unique IV (initialization vector)
 * - GCM mode provides both confidentiality AND integrity verification
 * - Auth tags prevent any tampering with encrypted data
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;        // 128-bit IV
const AUTH_TAG_LENGTH = 16;  // 128-bit auth tag

// Derive 32-byte key from the env secret (SHA-256 hash ensures exact 32 bytes)
const getKey = () => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    console.warn("⚠️ ENCRYPTION_KEY not set! Using fallback — set it in .env for production!");
    return crypto.createHash("sha256").update("default-dev-key-change-me").digest();
  }
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypt a plaintext string → "iv:authTag:ciphertext" (hex encoded)
 * Returns null for empty/null input
 */
export const encrypt = (plaintext) => {
  if (!plaintext && plaintext !== 0) return null;

  const text = String(plaintext);
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypt an "iv:authTag:ciphertext" string → plaintext
 * Returns the original input if it's not in encrypted format (backward compatibility)
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  const text = String(encryptedText);

  // Check if this is encrypted data (has the iv:authTag:ciphertext format)
  const parts = text.split(":");
  if (parts.length !== 3) {
    // Not encrypted — return as-is (backward compatibility for old data)
    return text;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const ciphertext = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    // If decryption fails, it might be unencrypted legacy data
    console.warn("Decryption failed, returning raw value (may be legacy data)");
    return text;
  }
};

/**
 * Encrypt an object's specified fields
 * Returns a new object with encrypted fields
 */
export const encryptFields = (obj, fields) => {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encrypt(String(result[field]));
    }
  }
  return result;
};

/**
 * Decrypt an object's specified fields
 * Returns a new object with decrypted fields
 */
export const decryptFields = (obj, fields) => {
  const result = obj.toObject ? obj.toObject() : { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = decrypt(result[field]);
    }
  }
  return result;
};
