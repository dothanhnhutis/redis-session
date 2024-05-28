import express, { Express } from "express";
import { RedisSessionServer } from "./server";

class Application {
  initialize() {
    const app: Express = express();
    const server: RedisSessionServer = new RedisSessionServer(app);
    server.start();
  }
}
const app: Application = new Application();
app.initialize();
