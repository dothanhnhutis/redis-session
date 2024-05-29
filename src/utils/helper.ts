import crypto from "crypto";
import { buffer } from "stream/consumers";
import z from "zod";

export function encrypt(text: string, secret: string) {
  const secretValidate = z
    .string()
    .refine(
      (v) => {
        const buff = Buffer.from(v, "base64");
        return buff.length == 32;
      },
      {
        message: "secret must be string base64 include 32byte",
      }
    )
    .safeParse(secret);
  if (!secretValidate.success)
    throw new Error("secret must be string base64 include 32byte");

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(secretValidate.data, "base64"),
    iv
  );
  const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
  return `${iv.toString("hex")}.${encrypted}`;
}

export function decrypt(encrypt: string, secret: string) {
  const secretValidate = z
    .string()
    .refine(
      (v) => {
        const buff = Buffer.from(v, "base64");
        return buff.length == 32;
      },
      {
        message: "secret must be string base64 include 32byte",
      }
    )
    .safeParse(secret);
  if (!secretValidate.success)
    throw new Error("secret must be string base64 include 32byte");

  const splitData = encrypt.split(".");
  const iv = Buffer.from(splitData[0], "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(secretValidate.data, "base64"),
    iv
  );
  let decrypted =
    decipher.update(splitData[1], "hex", "utf8") + decipher.final("utf8");
  return decrypted;
}
