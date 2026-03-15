export type WallOfFameFunction = "coach" | "joueur" | "benevole" | "president";

export type WallOfFameMember = {
  id: string;
  firstName: string;
  lastName: string;
  palmares: string;
  memberSince: string;
  functions: WallOfFameFunction[];
  photoSrc: string;
  createdAt: string;
};

type WallOfFameApiResponse = {
  members: WallOfFameMember[];
};

export type CreateWallOfFameMemberInput = {
  firstName: string;
  lastName: string;
  palmares: string;
  memberSince: string;
  functions: WallOfFameFunction[];
  photoSrc: string;
};

export type UpdateWallOfFameMemberInput = {
  id: string;
  firstName: string;
  lastName: string;
  palmares: string;
  memberSince: string;
  functions: WallOfFameFunction[];
  photoSrc?: string;
};

async function extractApiError(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const payload = (await response.clone().json()) as { error?: string };
    return typeof payload.error === "string" && payload.error ? payload.error : null;
  } catch {
    return null;
  }
}

async function ensureOkApiResponse(response: Response, defaultErrorMessage: string) {
  if (response.ok) {
    return;
  }

  const apiError = await extractApiError(response);
  throw new Error(apiError || defaultErrorMessage);
}

async function parseJsonResponse<T>(response: Response, apiName: string) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`${apiName} est inaccessible (réponse non JSON). Vérifiez le déploiement Vercel.`);
  }

  return (await response.json()) as T;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 15000) {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: abortController.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le serveur ne répond pas à temps. Vérifiez le déploiement Vercel et les fonctions API.");
    }

    if (error instanceof TypeError) {
      throw new Error("API inaccessible. Vérifiez la configuration Vercel et les variables d'environnement.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function loadWallOfFameMembers() {
  const response = await fetchWithTimeout("/api/wall-of-fame", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  await ensureOkApiResponse(response, "Impossible de charger le Wall of Fame.");
  const payload = await parseJsonResponse<WallOfFameApiResponse>(response, "/api/wall-of-fame");
  return payload.members ?? [];
}

export async function createWallOfFameMember(input: CreateWallOfFameMemberInput) {
  const response = await fetchWithTimeout("/api/wall-of-fame", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  await ensureOkApiResponse(response, "Impossible d'ajouter la personne.");
  const payload = await parseJsonResponse<WallOfFameApiResponse>(response, "/api/wall-of-fame");
  return payload.members ?? [];
}

export async function updateWallOfFameMember(input: UpdateWallOfFameMemberInput) {
  const response = await fetchWithTimeout("/api/wall-of-fame", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  await ensureOkApiResponse(response, "Impossible de modifier la personne.");
  const payload = await parseJsonResponse<WallOfFameApiResponse>(response, "/api/wall-of-fame");
  return payload.members ?? [];
}

export async function deleteWallOfFameMember(memberId: string) {
  const response = await fetchWithTimeout("/api/wall-of-fame", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: memberId }),
  });

  await ensureOkApiResponse(response, "Impossible de supprimer la personne.");
  const payload = await parseJsonResponse<WallOfFameApiResponse>(response, "/api/wall-of-fame");
  return payload.members ?? [];
}
