import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import crypto from "crypto";

const cookieName = "session";
const userId = "9999999";

export async function signin(req: Request, res: Response) {
  // const randomId = Math.random().toString(36).substring(2);
  const expires = new Date(Date.now() + 5 * 60000);

  // const randomId = crypto.randomBytes(10).toString("hex");
  // console.log(randomId);

  req.session.user = {
    id: "12132121",
  };
  req.session.cookie = {
    expires,
    maxAge: 120000,
  };

  // req.session.cookie.expires = expires;
  // req.session.cookie.maxAge = 120000;

  // res.cookie("test", "asdasd", {
  //   path: "/",
  //   httpOnly: true,
  //   secure: false,
  //   maxAge: 120000,
  //   expires,
  // });

  res.status(StatusCodes.OK).send("oke");
}
