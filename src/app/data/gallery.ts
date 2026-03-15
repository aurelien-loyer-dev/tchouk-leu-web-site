export type GalleryCategory = "matches" | "training" | "events";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  createdAt: string;
};

type GalleryApiResponse = {
  photos: GalleryPhoto[];
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

export async function loadGalleryPhotos() {
  const response = await fetchWithTimeout("/api/gallery", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  await ensureOkApiResponse(response, "Impossible de charger les photos.");
  const payload = await parseJsonResponse<GalleryApiResponse>(response, "/api/gallery");
  return payload.photos ?? [];
}

export async function uploadGalleryPhoto(input: Omit<GalleryPhoto, "id" | "createdAt">) {
  const response = await fetchWithTimeout("/api/gallery", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  await ensureOkApiResponse(response, "Impossible d'ajouter la photo.");
  const payload = await parseJsonResponse<GalleryApiResponse>(response, "/api/gallery");
  return payload.photos ?? [];
}

export async function deleteGalleryPhoto(photoId: string) {
  const response = await fetchWithTimeout("/api/gallery", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: photoId }),
  });

  await ensureOkApiResponse(response, "Impossible de supprimer la photo.");
  const payload = await parseJsonResponse<GalleryApiResponse>(response, "/api/gallery");
  return payload.photos ?? [];
}
