import crypto from "crypto";

export function encrypt(text: string, secret: string, salt?: string) {
  const key = crypto.scryptSync(secret, salt || "salt", 32);
  const iv = crypto.scryptSync(secret, salt || "salt", 16);
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  return encrypted;
}

export function decrypt(hash: string, secret: string, salt?: string) {
  const key = crypto.scryptSync(secret, salt || "salt", 32);
  const iv = crypto.scryptSync(secret, salt || "salt", 16);
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
  let decrypted = decipher.update(hash, "hex", "utf8");
  return decrypted;
}
