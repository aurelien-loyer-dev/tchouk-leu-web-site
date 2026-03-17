export type ActivityCategory = "entrainement" | "tournoi" | "evenement";

export type Activity = {
  id: string;
  title: string;
  category: ActivityCategory;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  audience: string;
  description: string;
};

type ActivitiesApiResponse = {
  activities: Activity[];
};

type AdminSessionResponse = {
  authenticated: boolean;
};

export const defaultActivities: Activity[] = [
  {
    id: "training-wed-all",
    title: "Entrainement toutes categories",
    category: "entrainement",
    date: "2026-03-18",
    startTime: "14:00",
    endTime: "17:00",
    location: "Gymnase de Stella",
    audience: "Toutes categories",
    description: "Session collective en salle pour tous les groupes du club.",
  },
  {
    id: "training-sat-u12-u15",
    title: "Entrainement M12 / M15",
    category: "entrainement",
    date: "2026-03-21",
    startTime: "15:30",
    endTime: "17:00",
    location: "Terrain de Beach de Saint-Leu",
    audience: "M12 / M15",
    description: "Travail technique, jeu collectif et preparation physique adaptee.",
  },
  {
    id: "training-sat-senior",
    title: "Entrainement seniors",
    category: "entrainement",
    date: "2026-03-21",
    startTime: "17:00",
    endTime: "19:00",
    location: "Terrain de Beach de Saint-Leu",
    audience: "Seniors",
    description: "Seance competition et perfectionnement pour le groupe senior.",
  },
  {
    id: "tournament-regional",
    title: "Tournoi regional de Saint-Leu",
    category: "tournoi",
    date: "2026-04-11",
    startTime: "09:00",
    endTime: "18:00",
    location: "Gymnase de Stella",
    audience: "Club et public",
    description: "Journee de competition avec equipes invitees et matchs tout au long de la journee.",
  },
  {
    id: "event-open-day",
    title: "Journee decouverte du club",
    category: "evenement",
    date: "2026-04-25",
    startTime: "10:00",
    endTime: "15:00",
    location: "Front de mer de Saint-Leu",
    audience: "Debutants et familles",
    description: "Initiations, demonstrations et rencontre avec les membres du club.",
  },
];

export function sortActivities(activities: Activity[]) {
  return [...activities].sort((left, right) => {
    const leftValue = `${left.date}T${left.startTime}`;
    const rightValue = `${right.date}T${right.startTime}`;
    return leftValue.localeCompare(rightValue);
  });
}

function ensureOkResponse(response: Response, defaultErrorMessage: string) {
  if (!response.ok) {
    throw new Error(defaultErrorMessage);
  }
}

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

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 10000) {
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

export async function loadActivities() {
  const response = await fetchWithTimeout("/api/activities", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  await ensureOkApiResponse(response, "Impossible de charger les activites.");

  const payload = await parseJsonResponse<ActivitiesApiResponse>(response, "/api/activities");
  return sortActivities(payload.activities ?? defaultActivities);
}

export async function saveActivities(activities: Activity[]) {
  const response = await fetchWithTimeout("/api/activities", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ activities: sortActivities(activities) }),
  });

  await ensureOkApiResponse(response, "Impossible d'enregistrer les activites.");

  const payload = await parseJsonResponse<ActivitiesApiResponse>(response, "/api/activities");
  return sortActivities(payload.activities ?? activities);
}

export async function checkAdminSession() {
  const response = await fetchWithTimeout("/api/admin-session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  ensureOkResponse(response, "Impossible de verifier la session admin.");
  const payload = await parseJsonResponse<AdminSessionResponse>(response, "/api/admin-session");
  return Boolean(payload.authenticated);
}

export async function loginAsAdmin(username: string, password: string) {
  try {
    const response = await fetchWithTimeout("/api/admin-login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 401 || response.status === 403) {
      return false;
    }

    await ensureOkApiResponse(response, "Impossible de se connecter.");
    await parseJsonResponse<{ ok: boolean }>(response, "/api/admin-login");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("API admin inaccessible. Vérifiez le déploiement Vercel et les variables d'environnement.");
  }
}

export async function logoutAdmin() {
  const response = await fetchWithTimeout("/api/admin-logout", {
    method: "POST",
    credentials: "include",
  });

  await ensureOkApiResponse(response, "Impossible de se deconnecter.");
}

export function createEmptyActivity(): Activity {
  return {
    id: crypto.randomUUID(),
    title: "",
    category: "entrainement",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    audience: "",
    description: "",
  };
}

export function getCategoryLabel(category: ActivityCategory) {
  if (category === "entrainement") {
    return "Entrainement";
  }

  if (category === "tournoi") {
    return "Tournoi";
  }

  return "Evenement";
}
