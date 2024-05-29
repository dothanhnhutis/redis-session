import { CookieOptions, RequestHandler as MiddleWare, Request } from "express";
import { parse } from "cookie";
import { decrypt, encrypt } from "@/utils/helper";
import { redisClient } from "@/redis/connection";
import crypto from "crypto";
import { getData, setData } from "@/redis/cache";
interface SessionData {
  cookie: CookieOptions;
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
  prefix?: string;
  cookie?: CookieOptions | undefined;
  genId?: (request: Request) => string;
}

function genIdDefault(req: Request) {
  const randomId = crypto.randomBytes(10).toString("hex");
  return randomId;
}

const cookieDefault: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: false,
};

export const session =
  ({
    name = "session",
    secret,
    cookie,
    prefix = "sid",
    genId = genIdDefault,
  }: SessionOptions): MiddleWare =>
  async (req, res, next) => {
    const cookieOpt: CookieOptions = {
      ...cookieDefault,
      ...cookie,
    };

    let sessionData: SessionData = {
      cookie: cookieOpt,
    };

    const cookies = parse(req.get("cookie") || "");
    if (cookies[name]) {
      const sessionId = decrypt(cookies[name], secret);
      const cookieRedis = await getData(sessionId);
      if (cookieRedis) {
        sessionData = JSON.parse(cookieRedis);
      }
    }

    const cookieProxy = new Proxy<CookieOptions>(sessionData.cookie, {
      set(target, p: keyof CookieOptions, newValue, receiver) {
        if (p == "expires") {
          delete target["maxAge"];
        } else if (p == "maxAge") {
          delete target["expires"];
        }
        target[p] = newValue;
        req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
        res.cookie(name, encrypt(req.sessionID, secret), target);
        // fix here
        // setData(req.sessionID,JSON.stringify(req.session),target["expires"] ? Math.abs(new Date()) )
        return true;
      },
    });

    req.session = new Proxy<SessionData>(
      {
        cookie: cookieProxy,
      },
      {
        set(target, p: keyof SessionData, newValue, receiver) {
          target[p] = newValue;
          req.sessionID = req.sessionID || `${prefix}:${genId(req)}`;
          res.cookie(name, encrypt(req.sessionID, secret), target.cookie);

          return true;
        },
      }
    );

    console.log(req.session);
    next();
  };
