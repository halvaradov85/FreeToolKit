import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import { hashPassword, verifyPassword } from './password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

interface UserLike { id: string; role: 'USER' | 'ADMIN'; tier: 'FREE' | 'PRO'; }

async function issueTokens(user: UserLike) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, tier: user.tier });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return { accessToken, refreshToken };
}

export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'email_taken', 'No se pudo completar el registro.');
  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  return issueTokens(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Mensaje genérico: no revela si el email existe (FR-016).
  const generic = new AppError(401, 'invalid_credentials', 'Credenciales inválidas.');
  if (!user) {
    await hashPassword(password); // iguala el tiempo de respuesta
    throw generic;
  }
  if (!(await verifyPassword(password, user.passwordHash))) throw generic;
  if (user.status !== 'ACTIVE') throw new AppError(403, 'account_suspended', 'Cuenta suspendida.');
  return issueTokens(user);
}

export async function refresh(token: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'invalid_refresh', 'Sesión inválida.');
  }
  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!stored) throw new AppError(401, 'invalid_refresh', 'Sesión inválida.');

  // Rotación: revoca el actual y emite uno nuevo.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError(401, 'invalid_refresh', 'Sesión inválida.');
  return issueTokens(user);
}

export async function logout(token: string) {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
}
