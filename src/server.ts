import compression from "compression";
import http from "http";
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import configs from "./config";
import { CustomError, IErrorResponse, NotFoundError } from "./error-handler";
import { StatusCodes } from "http-status-codes";
import { appRouter } from "./router";
import { initRedis } from "./redis/connection";
import { session } from "./middlewares/session.middleware";
import crypto from "crypto";
const SERVER_PORT = 4000;
export class RedisSessionServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start() {
    this.securityMiddleware(this.app);
    this.standarMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application) {
    app.set("trust proxy", 1);
    app.use(helmet());
    app.use(
      cors({
        origin: configs.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      })
    );
    app.use(morgan(configs.NODE_ENV == "production" ? "combined" : "dev"));
    initRedis();
    app.use(
      session({
        secret: configs.SESSION_SECRET,
        redis_uri: "",
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV == "production",

          // maxAge: SESSION_MAX_AGE,
        },
        genId: (req) => {
          const randomId = crypto.randomBytes(10).toString("hex");
          return `${req.session.user?.id}:${randomId}`;
        },
      })
    );
  }
  private standarMiddleware(app: Application) {
    app.use(compression());
    app.use(express.json({ limit: "200mb" }));
    app.use(express.urlencoded({ extended: true, limit: "200mb" }));
  }

  private routesMiddleware(app: Application): void {
    appRouter(app);
  }

  private errorHandler(app: Application): void {
    // handle 404
    app.use("*", (req: Request, res: Response, next: NextFunction) => {
      throw new NotFoundError();
    });
    // handle error
    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: "Something went wrong" });
      }
    );
  }

  private async startServer(app: Application) {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.log("GatewayService startServer() error method:", error);
    }
  }

  private startHttpServer(httpServer: http.Server) {
    try {
      console.log(`App server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        console.log(`App server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      console.log("AppService startServer() method error:", error);
    }
  }
}
