import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: { message: "Duplicate value (unique constraint)" } });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: { message: "Record not found" } });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ error: { message: "Internal server error" } });
}
