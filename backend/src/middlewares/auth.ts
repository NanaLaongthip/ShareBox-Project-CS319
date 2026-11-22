import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "../generated/prisma/client";
import { env } from "../config/env";
import { HttpError } from "./errorHandler";

type TokenPayload = { sub: string; role: Role; email: string };

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return next(new HttpError(401, "Authentication required"));
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;
    req.user = { id: Number(payload.sub), role: payload.role, email: payload.email };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, "Insufficient permissions"));
    next();
  };
}
