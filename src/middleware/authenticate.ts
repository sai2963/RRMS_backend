import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { HTTP_STATUS } from "../constants";
import { JwtPayload } from "../types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};
