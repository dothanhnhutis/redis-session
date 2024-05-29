import { redisClient } from "./connection";

export function setData(key: string, value: string, maxAge?: number): void {
  redisClient.set(key, value, "PX", maxAge || -1, (err, data) => {
    if (err) throw new Error(err.message);
    return data == "OK";
  });
}

export function getData(key: string) {
  return redisClient.get(key, (err, data) => {
    if (err) throw new Error(err.message);
    return data == "OK";
  });
}

export function deteleData(pattern: string) {
  redisClient.keys(pattern, (err, datas) => {
    if (err) throw new Error(err.message);
    redisClient.del(datas!, (err, data) => {
      if (err) throw new Error(err.message);
    });
  });
}
