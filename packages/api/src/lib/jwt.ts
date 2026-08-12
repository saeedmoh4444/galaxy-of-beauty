import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getEnv } from './env';

export interface JwtPayload {
  id: number;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  email: string;
  name?: string;
}

interface JwtClaims extends JwtPayload {
  jti: string;
  iss: string;
  aud: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

const ISSUER = 'galaxy-of-beauty';
const AUDIENCE = 'galaxy-of-beauty-api';
const ALGORITHM = 'HS256';

function signToken(payload: JwtPayload, secret: string, expiry: string, type: 'access' | 'refresh'): string {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
      iss: ISSUER,
      aud: AUDIENCE,
      type,
    },
    secret,
    {
      algorithm: ALGORITHM,
      expiresIn: expiry as string & { __brand: never },
    } as jwt.SignOptions,
  );
}

function verifyToken(token: string, secret: string, expectedType: 'access' | 'refresh'): JwtPayload {
  const decoded = jwt.verify(token, secret, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as unknown as JwtClaims;

  if (decoded.type !== expectedType) {
    throw new Error(`Token type mismatch: expected ${expectedType}, got ${decoded.type}`);
  }

  return {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
    name: decoded.name,
  };
}

export function signAccessToken(payload: JwtPayload): string {
  const env = getEnv();
  return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRY, 'access');
}

export function signRefreshToken(payload: JwtPayload): string {
  const env = getEnv();
  return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRY, 'refresh');
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv();
  return verifyToken(token, env.JWT_ACCESS_SECRET, 'access');
}

export function verifyRefreshToken(token: string): JwtPayload {
  const env = getEnv();
  return verifyToken(token, env.JWT_REFRESH_SECRET, 'refresh');
}

/** Generate a unique token family ID for refresh-token rotation lineage. */
export function generateTokenFamilyId(): string {
  return crypto.randomUUID();
}
