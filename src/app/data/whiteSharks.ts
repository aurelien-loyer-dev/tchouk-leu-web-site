export type WhiteSharksPalmaresEntry = {
  id: string;
  title: string;
  year: string;
  description: string;
  createdAt: string;
};

export type WhiteSharksMemberType = "joueur" | "capitaine" | "coach" | "benevole";

export type WhiteSharksPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  club: string;
  position: string;
  memberType: WhiteSharksMemberType;
  createdAt: string;
};

export type WhiteSharksData = {
  palmares: WhiteSharksPalmaresEntry[];
  players: WhiteSharksPlayer[];
};

type CreatePalmaresInput = {
  title: string;
  year: string;
  description: string;
};

type UpdatePalmaresInput = CreatePalmaresInput & {
  id: string;
};

type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  club: string;
  position: string;
  memberType: WhiteSharksMemberType;
};

type UpdatePlayerInput = CreatePlayerInput & {
  id: string;
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

export async function loadWhiteSharksData() {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  await ensureOkApiResponse(response, "Impossible de charger les données White Sharks.");
  const payload = await parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");

  return {
    palmares: payload.palmares ?? [],
    players: payload.players ?? [],
  };
}

export async function createWhiteSharksPalmares(input: CreatePalmaresInput) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "palmares",
      ...input,
    }),
  });

  await ensureOkApiResponse(response, "Impossible d'ajouter le palmarès White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}

export async function updateWhiteSharksPalmares(input: UpdatePalmaresInput) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "palmares",
      ...input,
    }),
  });

  await ensureOkApiResponse(response, "Impossible de modifier le palmarès White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}

export async function deleteWhiteSharksPalmares(id: string) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "palmares",
      id,
    }),
  });

  await ensureOkApiResponse(response, "Impossible de supprimer le palmarès White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}

export async function createWhiteSharksPlayer(input: CreatePlayerInput) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "player",
      ...input,
    }),
  });

  await ensureOkApiResponse(response, "Impossible d'ajouter le joueur White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}

export async function updateWhiteSharksPlayer(input: UpdatePlayerInput) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "player",
      ...input,
    }),
  });

  await ensureOkApiResponse(response, "Impossible de modifier le joueur White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}

export async function deleteWhiteSharksPlayer(id: string) {
  const response = await fetchWithTimeout("/api/white-sharks", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: "player",
      id,
    }),
  });

  await ensureOkApiResponse(response, "Impossible de supprimer le joueur White Sharks.");
  return parseJsonResponse<WhiteSharksData>(response, "/api/white-sharks");
}
