// Cookie/session management for Hyble SSO

export const SESSION_COOKIE_CONFIG = {
  name: 'hyble_session',
  domain: '.hyble.co',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

export const CROSS_DOMAIN_COOKIE_OPTIONS = {
  domain: '.hyble.co',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  emailVerified?: Date | null;
}

export interface HybleSession {
  user: SessionUser;
  expires: string;
}

export function isSessionValid(session: HybleSession | null): boolean {
  if (!session) return false;
  const expiresDate = new Date(session.expires);
  return expiresDate > new Date();
}

export function getSessionExpiry(): Date {
  const now = new Date();
  now.setSeconds(now.getSeconds() + SESSION_COOKIE_CONFIG.maxAge);
  return now;
}
