import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

import { Express } from "express";

const app: Express = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development (mobile apps)
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

/**
 * @openapi
 * /health:
 *   get:
 *     description: Health check endpoint
 *     responses:
 *       200:
 *         description: Returns the health status of the API
 */
// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

// Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

// API Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Health check: http://localhost:${PORT}/health`);
  console.log(`[API] Auth routes: http://localhost:${PORT}/auth/*`);
});

export { app };
