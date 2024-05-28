import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cookie from "cookie";
import { decrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
export async function signout(req: Request, res: Response) {
  const cookieHeader = req.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  if (cookies["session"]) {
    const sessionId = decrypt(cookies["session"], "123");
    console.log(sessionId);
    const keys = await redisClient.keys(sessionId);
    console.log(keys);
    await redisClient.del(keys);
  }
  res.clearCookie("session");
  res.status(StatusCodes.OK).send("oke");
}
