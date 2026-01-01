import crypto from "crypto";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; //For encrypting data
const IV_LENGTH = 16; // AES block size

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encrypted: string): string => {
  const [ivHex, encryptedData] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const cleanupUploadedFiles = async (files?: Express.Multer.File[]) => {
  if (!files || files.length === 0) return;

  for (const file of files) {
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error("[FILE CLEANUP ERROR]", file.path, err);
    }
  }
};
