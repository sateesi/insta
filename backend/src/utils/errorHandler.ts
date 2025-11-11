import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, "Not Found"));
};

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  console.error("Unexpected error", err);
  return res.status(500).json({ message: "Internal server error" });
};

