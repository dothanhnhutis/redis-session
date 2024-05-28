import { CookieOptions, RequestHandler as MiddleWare } from "express";
import { parse } from "cookie";
import { decrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
interface SessionData {
  cookie: Omit<CookieOptions, "encode"> | undefined;
  user?: { id: string };
}
declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      session: SessionData;
    }
  }
}

interface SessionOptions {
  secret: string;
  redis_uri: string;
  name?: string | undefined;
  cookie?: Omit<CookieOptions, "encode"> | undefined;
}

const cookieDefault: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: false,
  maxAge: undefined,
};

export const session =
  ({ name = "session", secret, cookie }: SessionOptions): MiddleWare =>
  async (req, res, next) => {
    let sessionData;
    const cookies = parse(req.get("cookie") || "");
    if (cookies[name]) {
      console.log("isAuth:true");

      req.sessionID = decrypt(cookies["session"], "123");
      const data = await redisClient.get(req.sessionID);

      sessionData = new Proxy<SessionData>(
        data
          ? JSON.parse(data)
          : {
              cookie: { ...cookieDefault, ...cookie },
            },
        {
          get(target, p, receiver) {
            return target[p as keyof SessionData];
          },
          set(target, p, newValue, receiver) {
            target[p as keyof SessionData] = newValue;
            if (p == "user" && target[p]) {
              res.cookie("sessionId", "1312312312", {
                httpOnly: true,
                secure: true,
              });
            }
            return true;
          },
        }
      );
    } else {
      console.log("isAuth:false");

      sessionData = new Proxy<SessionData>(
        {
          cookie: { ...cookieDefault, ...cookie },
        },
        {
          get(target, p, receiver) {
            return target[p as keyof SessionData];
          },
          set(target, p, newValue, receiver) {
            target[p as keyof SessionData] = newValue;
            if (p == "user" && target[p]) {
              res.cookie("sessionId", "1312312312", {
                httpOnly: true,
                secure: true,
              });
            }
            return true;
          },
        }
      );
    }
    req.session = sessionData;
    // const session = new Proxy<Session>(
    //   { isAuth: false },
    //   {
    //     set(target, property, value) {
    //       target[property as keyof Session] = value;
    //       if (property == "isAuth" && target[property]) {
    //         res.cookie("sessionId", "1312312312", {
    //           httpOnly: true,
    //           secure: true,
    //         });
    //       }

    //       return true;
    //     },
    //     get(target, property) {
    //       return target[property as keyof Session];
    //     },
    //   }
    // );
    // req.session = session;
    // const cookieHeader = req.get("cookie") || "";
    // const cookies = cookieaa.parse(cookieHeader);
    // if (cookies["session"]) {
    // }
    // if (req.isAuth)
    //   res.cookie("session1", `${req.isAuth}`, {
    //     ...cookieDefault,
    //     ...cookie,
    //   });

    // const data = new Proxy(
    //   { isAuth: false },
    //   {
    //     get(target, p, receiver) {
    //       return target;
    //     },
    //     set(target, p, newValue, receiver) {
    //       target["isAuth"] = newValue;
    //       return true;
    //     },
    //   }
    // );

    // req.session = data;

    next();
  };
