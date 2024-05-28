import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cookie from "cookie";
import { decrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
export async function me(req: Request, res: Response) {
  // console.log(req.get("cookie"));
  // const cookieHeader = req.get("cookie") || "";
  // const cookies = cookie.parse(cookieHeader);
  // if (cookies["session"]) {
  //   const sessionId = decrypt(cookies["session"], "123");
  //   console.log(sessionId);
  //   const data = await redisClient.get(sessionId);
  //   console.log(data);
  // }
  // const cookieStore = await redisClient.keys(sessionId);
  // await redisClient.del("session:9999999:03nj98lpyevq");
  // console.log(cookieStore);
  console.log(req.session.user);
  console.log(req.sessionID);

  res.status(StatusCodes.OK).send("oke");
}
