import jwt from 'jsonwebtoken';
import { env } from '../../lib/env';

export interface AccessClaims {
  sub: string; // userId
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO';
}

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign(claims, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, env.jwtAccessSecret) as AccessClaims;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
}
