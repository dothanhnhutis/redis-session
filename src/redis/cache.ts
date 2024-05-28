import { redisClient } from "./connection";

export function setData(key: string, value: string, maxAge?: number) {
  redisClient.set(key, value, "EX", maxAge || -1);
}
