import jwt from 'jsonwebtoken';
import { getEnv } from './env';

export interface JwtPayload {
  id: number;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  const env = getEnv();
  return jwt.sign(payload as object, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as string & { __brand: never },
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  const env = getEnv();
  return jwt.sign(payload as object, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as string & { __brand: never },
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as JwtPayload;
}
