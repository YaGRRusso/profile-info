import { randomBytes } from "node:crypto";
import { compare } from "bcryptjs";
import mongoose from "mongoose";

export const API_TOKEN_PREFIX = "pi_";
const TOKEN_ID_PATTERN = /^[a-f0-9]{24}$/;

export function emitApiToken(): {
  plaintext: string;
  tokenId: string;
  secret: string;
} {
  const tokenId = new mongoose.Types.ObjectId().toHexString();
  const secret = randomBytes(32).toString("base64url");
  const plaintext = `${API_TOKEN_PREFIX}${tokenId}_${secret}`;
  return { plaintext, tokenId, secret };
}

export function parseApiToken(value: string): {
  tokenId: string;
  secret: string;
} | null {
  if (!value.startsWith(API_TOKEN_PREFIX)) return null;

  const payload = value.slice(API_TOKEN_PREFIX.length);
  const separatorIndex = payload.indexOf("_");
  if (separatorIndex <= 0) return null;

  const tokenId = payload.slice(0, separatorIndex);
  const secret = payload.slice(separatorIndex + 1);

  if (!TOKEN_ID_PATTERN.test(tokenId) || secret.length < 16) return null;

  return { tokenId, secret };
}

export function verifyApiToken(
  secret: string,
  hashedSecret: string
): Promise<boolean> {
  return compare(secret, hashedSecret);
}
