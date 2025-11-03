import { Request, Response, NextFunction } from "express";
import { logger } from "@/shared/utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, path, ip } = req;

  // Log request
  logger.debug(`${method} ${path}`, {
    ip,
    userAgent: req.get("User-Agent"),
    contentLength: req.get("content-length"),
  });

  // Capture response details
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log response
    const logLevel = statusCode >= 400 ? "warn" : "debug";
    logger[logLevel](`${method} ${path} ${statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get("content-length"),
      ip,
    });

    return originalSend.call(this, data);
  };

  next();
};
