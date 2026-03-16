const MIN_FILL_TIME_MS = 3000;
const MAX_FILL_TIME_MS = 1000 * 60 * 60 * 2;

const ipRequestLog = new Map();
const emailRequestLog = new Map();

function sendJson(response, statusCode, body) {
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(body);
}

function parseBody(requestBody) {
  if (!requestBody) {
    return {};
  }

  if (typeof requestBody === "string") {
    return JSON.parse(requestBody);
  }

  return requestBody;
}

function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  const realIp = request.headers["x-real-ip"];
  if (realIp) {
    return String(realIp).trim();
  }

  return "unknown";
}

function isRateLimited(logMap, key, limit, windowMs) {
  const now = Date.now();
  const entries = (logMap.get(key) || []).filter((timestamp) => now - timestamp < windowMs);

  if (entries.length >= limit) {
    logMap.set(key, entries);
    return true;
  }

  entries.push(now);
  logMap.set(key, entries);
  return false;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePayload(payload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const website = typeof payload.website === "string" ? payload.website.trim() : "";
  const formStartedAt = Number(payload.formStartedAt || 0);

  if (website) {
    throw new Error("Message refusé.");
  }

  if (!Number.isFinite(formStartedAt) || formStartedAt <= 0) {
    throw new Error("Formulaire invalide.");
  }

  const elapsed = Date.now() - formStartedAt;
  if (elapsed < MIN_FILL_TIME_MS) {
    throw new Error("Soumission trop rapide. Réessayez.");
  }

  if (elapsed > MAX_FILL_TIME_MS) {
    throw new Error("Le formulaire a expiré. Rechargez la page.");
  }

  if (!name || !email || !message) {
    throw new Error("Nom, email et message sont obligatoires.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Adresse email invalide.");
  }

  if (name.length > 120 || email.length > 190 || phone.length > 60 || message.length > 5000) {
    throw new Error("Les champs sont trop longs.");
  }

  const urlMatches = message.match(/https?:\/\/|www\./gi) || [];
  if (urlMatches.length > 2) {
    throw new Error("Message refusé.");
  }

  return { name, email, phone, message };
}

async function sendContactEmail({ name, email, phone, message }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || "bgaillard.pro@gmail.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Tchouk'Leu <onboarding@resend.dev>";

  if (!resendApiKey) {
    throw new Error("Le service email n'est pas configuré (RESEND_API_KEY manquante).");
  }

  const emailBody = [
    `Nom: ${name}`,
    `Email: ${email}`,
    `Téléphone: ${phone || "Non renseigné"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `Nouveau message contact - ${name}`,
      text: emailBody,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Erreur d'envoi email: ${details}`);
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let parsedBody = {};
  try {
    parsedBody = parseBody(request.body);
  } catch {
    return sendJson(response, 400, { error: "Invalid JSON body" });
  }

  const clientIp = getClientIp(request);

  if (isRateLimited(ipRequestLog, clientIp, 5, 1000 * 60 * 15)) {
    return sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
  }

  let validatedPayload;
  try {
    validatedPayload = validatePayload(parsedBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Formulaire invalide.";
    return sendJson(response, 400, { error: message });
  }

  if (isRateLimited(emailRequestLog, validatedPayload.email.toLowerCase(), 3, 1000 * 60 * 30)) {
    return sendJson(response, 429, { error: "Cet email a envoyé trop de messages récemment." });
  }

  try {
    await sendContactEmail(validatedPayload);
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible d'envoyer le message.";
    return sendJson(response, 503, { error: message });
  }
}
