import express, { type Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "core",
    timestamp: new Date().toISOString(),
  });
});

// Export services
export * from "./services/authService";

// Start server only if this is the main module
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[CORE] Server running on port ${PORT}`);
    console.log(`[CORE] Health check: http://localhost:${PORT}/health`);
  });
}

export { app };
