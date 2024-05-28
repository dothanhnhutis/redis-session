import { Application } from "express";
import { healthRoutes } from "./routes/health.route";
import { authRoutes } from "./routes/auth.route";

const BASE_PATH = "/api/v1";

export function appRouter(app: Application) {
  app.use("", healthRoutes());
  app.use(BASE_PATH, authRoutes());
}
