import z from "zod";
import dotenv from "dotenv";

dotenv.config({});

const envSchema = z.object({
  NODE_ENV: z.string(),
  REDIS_HOST: z.string(),
  CLIENT_URL: z.string(),
});

const envParse = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  REDIS_HOST: process.env.REDIS_HOST,
  CLIENT_URL: process.env.CLIENT_URL,
});
if (!envParse.success) {
  console.error(envParse.error.issues);
  throw new Error("The values in the env file are invalid");
}

const configs = envParse.data;
export default configs;
