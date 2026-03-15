import crypto from "node:crypto";

const AUTH_COOKIE_NAME = "__Host-tchoukleu_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || `${getAdminPassword()}::session-secret`;
}

export function parseCookies(rawCookieHeader = "") {
  return rawCookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, currentCookie) => {
      const separatorIndex = currentCookie.indexOf("=");
      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = currentCookie.slice(0, separatorIndex).trim();
      const value = currentCookie.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function getRequestIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (!forwardedFor) {
    return "";
  }

  const firstSegment = String(forwardedFor).split(",")[0];
  return firstSegment.trim();
}

function getAllowedIps() {
  return (process.env.ADMIN_ALLOWED_IPS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isIpAllowedRequest(request) {
  const allowedIps = getAllowedIps();
  if (allowedIps.length === 0) {
    return true;
  }

  const requestIp = getRequestIp(request);
  return allowedIps.includes(requestIp);
}

function toBase64Url(rawValue) {
  return Buffer.from(rawValue, "utf8").toString("base64url");
}

function fromBase64Url(base64Value) {
  return Buffer.from(base64Value, "base64url").toString("utf8");
}

function signPayload(payloadSegment) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payloadSegment).digest("base64url");
}

function createSessionToken() {
  const payload = {
    username: getAdminUsername(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const signatureSegment = signPayload(payloadSegment);
  return `${payloadSegment}.${signatureSegment}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const [payloadSegment, signatureSegment] = token.split(".");

  if (!payloadSegment || !signatureSegment) {
    return false;
  }

  const expectedSignature = signPayload(payloadSegment);
  const providedSignatureBuffer = Buffer.from(signatureSegment);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadSegment));
    return payload?.username === getAdminUsername() && Number(payload?.expiresAt || 0) > Date.now();
  } catch {
    return false;
  }
}

export function isAuthenticatedRequest(request) {
  if (!isIpAllowedRequest(request)) {
    return false;
  }

  const cookies = parseCookies(request.headers.cookie || "");
  const cookieValue = cookies[AUTH_COOKIE_NAME];
  return verifySessionToken(cookieValue);
}

export function getSessionCookieValue() {
  const maxAgeInSeconds = Math.floor(SESSION_DURATION_MS / 1000);
  const sessionToken = createSessionToken();
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${maxAgeInSeconds}`;
}

export function clearSessionCookieValue() {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`;
}
