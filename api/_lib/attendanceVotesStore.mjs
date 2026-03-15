import { list, put } from "@vercel/blob";

const STORE_PATH = "planning/attendance-votes.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const ALLOWED_VOTES = new Set(["present", "maybe", "absent"]);

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobHeaders() {
  return {
    Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
  };
}

function createEmptyVotePayload() {
  return {
    votesByActivity: {},
  };
}

function normalizeVotePayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return createEmptyVotePayload();
  }

  const votesByActivity = rawPayload.votesByActivity;
  if (!votesByActivity || typeof votesByActivity !== "object") {
    return createEmptyVotePayload();
  }

  const sanitizedVotesByActivity = {};

  for (const [activityId, activityVotes] of Object.entries(votesByActivity)) {
    if (!activityId || typeof activityVotes !== "object" || !activityVotes) {
      continue;
    }

    const sanitizedVotes = {};

    for (const [voterId, voteValue] of Object.entries(activityVotes)) {
      if (typeof voterId !== "string" || !voterId) {
        continue;
      }

      if (typeof voteValue !== "string" || !ALLOWED_VOTES.has(voteValue)) {
        continue;
      }

      sanitizedVotes[voterId] = voteValue;
    }

    sanitizedVotesByActivity[activityId] = sanitizedVotes;
  }

  return {
    votesByActivity: sanitizedVotesByActivity,
  };
}

export function isValidAttendanceVote(vote) {
  return typeof vote === "string" && ALLOWED_VOTES.has(vote);
}

export async function ensureAttendanceVotesInitialized() {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const allBlobs = await list({ prefix: "planning/", limit: 30 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    return existingBlob.url;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(createEmptyVotePayload()), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return createdBlob.url;
}

export async function readAttendanceVotesPayload() {
  if (!isBlobConfigured()) {
    return createEmptyVotePayload();
  }

  try {
    const blobUrl = await ensureAttendanceVotesInitialized();
    const response = await fetch(blobUrl, {
      cache: "no-store",
      headers: getBlobHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Attendance votes blob fetch failed with status ${response.status}`);
    }

    const parsedPayload = await response.json();
    return normalizeVotePayload(parsedPayload);
  } catch (error) {
    console.error("Unable to read attendance votes", error);
    return createEmptyVotePayload();
  }
}

async function writeAttendanceVotesPayload(payload) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const safePayload = normalizeVotePayload(payload);

  await put(STORE_PATH, JSON.stringify(safePayload), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return safePayload;
}

export function toAttendanceSummaryByActivity(votesByActivity) {
  const summaryByActivity = {};

  for (const [activityId, activityVotes] of Object.entries(votesByActivity || {})) {
    const voteValues = Object.values(activityVotes || {});
    let present = 0;
    let maybe = 0;
    let absent = 0;

    for (const voteValue of voteValues) {
      if (voteValue === "present") {
        present += 1;
      } else if (voteValue === "maybe") {
        maybe += 1;
      } else if (voteValue === "absent") {
        absent += 1;
      }
    }

    summaryByActivity[activityId] = {
      present,
      maybe,
      absent,
      total: present + maybe + absent,
    };
  }

  return summaryByActivity;
}

export async function submitAttendanceVote(activityId, voterId, vote) {
  if (!activityId || typeof activityId !== "string") {
    throw new Error("activityId is required");
  }

  if (!voterId || typeof voterId !== "string") {
    throw new Error("voterId is required");
  }

  if (!isValidAttendanceVote(vote)) {
    throw new Error("Invalid vote value");
  }

  const currentPayload = await readAttendanceVotesPayload();
  const votesByActivity = { ...currentPayload.votesByActivity };
  const currentVotesForActivity = { ...(votesByActivity[activityId] || {}) };

  currentVotesForActivity[voterId] = vote;
  votesByActivity[activityId] = currentVotesForActivity;

  const savedPayload = await writeAttendanceVotesPayload({ votesByActivity });
  const summaryByActivity = toAttendanceSummaryByActivity(savedPayload.votesByActivity);

  return {
    activityId,
    summary: summaryByActivity[activityId] || { present: 0, maybe: 0, absent: 0, total: 0 },
  };
}

export async function getAttendanceSummaryByActivity() {
  const payload = await readAttendanceVotesPayload();
  return toAttendanceSummaryByActivity(payload.votesByActivity);
}
