import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  status?: number;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  console.error(`[API ERROR] ${req.method} ${req.path}:`, {
    status,
    message,
    stack: err.stack,
  });

  res.status(status).json({
    status: "error",
    error: message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: "error",
    error: "Route not found",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
}
