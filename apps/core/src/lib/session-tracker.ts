import { prisma, DeviceType } from "@hyble/db";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

export interface SessionInfo {
  sessionToken: string;
  deviceName: string | null;
  deviceType: DeviceType;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  ipAddress: string | null;
}

export function parseUserAgent(userAgent: string | null): Omit<SessionInfo, "sessionToken" | "ipAddress"> {
  if (!userAgent) {
    return {
      deviceName: null,
      deviceType: "UNKNOWN",
      browser: null,
      browserVersion: null,
      os: null,
      osVersion: null,
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Determine device type
  let deviceType: DeviceType = "UNKNOWN";
  const deviceTypeStr = result.device.type?.toLowerCase();

  if (deviceTypeStr === "mobile") {
    deviceType = "MOBILE";
  } else if (deviceTypeStr === "tablet") {
    deviceType = "TABLET";
  } else if (!deviceTypeStr || deviceTypeStr === "undefined") {
    // No device type usually means desktop
    deviceType = "DESKTOP";
  }

  // Create device name
  const deviceName = result.device.vendor && result.device.model
    ? `${result.device.vendor} ${result.device.model}`
    : result.os.name
      ? `${result.os.name} ${deviceType === "DESKTOP" ? "Bilgisayar" : "Cihaz"}`
      : null;

  return {
    deviceName,
    deviceType,
    browser: result.browser.name || null,
    browserVersion: result.browser.version || null,
    os: result.os.name || null,
    osVersion: result.os.version || null,
  };
}

export function getClientIP(request: Request): string | null {
  // Check various headers for IP
  const headers = request.headers;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

export async function createUserSession(
  userId: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<string> {
  const sessionToken = uuidv4();
  const parsed = parseUserAgent(userAgent);

  // Session expires in 30 days (matching JWT maxAge)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      ...parsed,
      ipAddress,
      expiresAt,
    },
  });

  return sessionToken;
}

export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await prisma.userSession.update({
      where: { sessionToken },
      data: { lastActiveAt: new Date() },
    });
  } catch {
    // Session might not exist, ignore
  }
}

export async function revokeSession(sessionToken: string): Promise<void> {
  try {
    await prisma.userSession.update({
      where: { sessionToken },
      data: { isRevoked: true },
    });
  } catch {
    // Session might not exist, ignore
  }
}

export async function revokeAllUserSessions(
  userId: string,
  exceptSessionToken?: string
): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: {
      userId,
      isRevoked: false,
      ...(exceptSessionToken ? { sessionToken: { not: exceptSessionToken } } : {}),
    },
    data: { isRevoked: true },
  });

  return result.count;
}

export async function getUserSessions(userId: string) {
  return prisma.userSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: "desc" },
  });
}

export async function isSessionValid(sessionToken: string): Promise<boolean> {
  const session = await prisma.userSession.findUnique({
    where: { sessionToken },
  });

  if (!session) return false;
  if (session.isRevoked) return false;
  if (session.expiresAt < new Date()) return false;

  return true;
}

export async function cleanExpiredSessions(): Promise<number> {
  const result = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true },
      ],
    },
  });

  return result.count;
}
