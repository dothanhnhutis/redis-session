import { CookieOptions, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { encrypt, decrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
import configs from "@/config";

const cookieName = "session";
const userId = "9999999";

export async function signin(req: Request, res: Response) {
  const randomId = Math.random().toString(36).substring(2);
  const key = `${cookieName}:${userId}:${randomId}`;
  const expires = new Date(Date.now() + 5 * 60000);
  const opt: CookieOptions = {
    path: "/",
    expires,
    secure: configs.NODE_ENV == "production",
    httpOnly: true,
  };
  await redisClient.set(
    key,
    JSON.stringify({ cookie: opt, user: { id: userId } }),
    "PX",
    Math.abs(expires.getTime() - Date.now()),
    "NX"
  );

  res.cookie(cookieName, encrypt(key, "123"), opt);
  // req.session.userId = true;

  res.status(StatusCodes.OK).send("oke");
}
