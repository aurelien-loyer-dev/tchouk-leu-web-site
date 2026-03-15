export type AttendanceVote = "present" | "maybe" | "absent";

export type AttendanceSummary = {
  present: number;
  maybe: number;
  absent: number;
  total: number;
};

type VoteResponse = {
  ok: boolean;
  activityId: string;
  summary: AttendanceSummary;
};

type AttendanceSummaryResponse = {
  summaryByActivity: Record<string, AttendanceSummary>;
};

const VOTER_ID_STORAGE_KEY = "tchoukleu_presence_voter_id";

export function getOrCreateAttendanceVoterId() {
  if (typeof window === "undefined") {
    return "server-voter";
  }

  const existingVoterId = window.localStorage.getItem(VOTER_ID_STORAGE_KEY);
  if (existingVoterId) {
    return existingVoterId;
  }

  const newVoterId = crypto.randomUUID();
  window.localStorage.setItem(VOTER_ID_STORAGE_KEY, newVoterId);
  return newVoterId;
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

export async function submitAttendanceVote(activityId: string, vote: AttendanceVote) {
  const voterId = getOrCreateAttendanceVoterId();
  const response = await fetch("/api/attendance-votes", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ activityId, voterId, vote }),
  });

  await ensureOkApiResponse(response, "Impossible d'enregistrer votre presence.");

  const payload = (await response.json()) as VoteResponse;
  return payload.summary;
}

export async function loadAttendanceSummaryForAdmin() {
  const response = await fetch("/api/attendance-votes", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  ensureOkResponse(response, "Impossible de charger le compte rendu des presences.");

  const payload = (await response.json()) as AttendanceSummaryResponse;
  return payload.summaryByActivity || {};
}
