import configs from "@/config";
import { RedisConnectionError } from "@/error-handler";
import { Redis } from "ioredis";

let redisClient: Redis, reconnectTimeOut: NodeJS.Timeout;
const REDIS_RECONNECTION_TIMEOUT = 10000;

function handleReconnectTimeOut() {
  reconnectTimeOut = setTimeout(() => {
    throw new RedisConnectionError();
  }, REDIS_RECONNECTION_TIMEOUT);
}

function handleEventConnection(redisClient: Redis) {
  redisClient.on("connect", () => {
    console.log("Redis connection status: connected");
    clearTimeout(reconnectTimeOut);
  });
  redisClient.on("end", () => {
    console.log("Redis connection status: disconnected");
    handleReconnectTimeOut();
  });
  redisClient.on("reconnecting", () => {
    console.log("Redis connection status: reconnecting");
    clearTimeout(reconnectTimeOut);
  });
  redisClient.on("error", (err) => {
    console.log(`Redis connection status: error - ${err}`);
    handleReconnectTimeOut();
  });
}
export function initRedis() {
  const redisInstance: Redis = new Redis(configs.REDIS_HOST);
  redisClient = redisInstance;
  handleEventConnection(redisClient);
  process.on("SIGINT", () => {
    redisClient.disconnect();
  });
}

export { redisClient };
