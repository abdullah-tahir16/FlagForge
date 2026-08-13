import { createHash } from "node:crypto";

export const getPercentageRolloutBucket = (environmentId: string, flagKey: string, userId: string): number => {
  const hash = createHash("sha256").update(`${environmentId}:${flagKey}:${userId}`).digest();

  return hash.readUInt32BE(0) % 100;
};
