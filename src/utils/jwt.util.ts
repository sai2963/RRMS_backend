import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../types';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
};
