import { list, put } from "@vercel/blob";

const STORE_PATH = "planning/attendance-votes.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const ALLOWED_VOTES = new Set(["present", "absent"]);

function sanitizeName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 80);
}

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
    votersById: {},
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

  const votersById = rawPayload.votersById;

  const sanitizedVotesByActivity = {};
  const sanitizedVotersById = {};

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

  if (votersById && typeof votersById === "object") {
    for (const [voterId, voterInfo] of Object.entries(votersById)) {
      if (!voterId || typeof voterInfo !== "object" || !voterInfo) {
        continue;
      }

      const firstName = sanitizeName(voterInfo.firstName);
      const lastName = sanitizeName(voterInfo.lastName);

      if (!firstName || !lastName) {
        continue;
      }

      sanitizedVotersById[voterId] = {
        firstName,
        lastName,
      };
    }
  }

  return {
    votesByActivity: sanitizedVotesByActivity,
    votersById: sanitizedVotersById,
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

export function toAttendanceSummaryByActivity(votesByActivity, votersById) {
  const summaryByActivity = {};

  for (const [activityId, activityVotes] of Object.entries(votesByActivity || {})) {
    const voteEntries = Object.entries(activityVotes || {});
    let present = 0;
    let absent = 0;
    const voters = [];

    for (const [voterId, voteValue] of voteEntries) {
      if (voteValue === "present") {
        present += 1;
      } else if (voteValue === "absent") {
        absent += 1;
      }

      const voterInfo = votersById?.[voterId];
      voters.push({
        voterId,
        firstName: sanitizeName(voterInfo?.firstName) || "Anonyme",
        lastName: sanitizeName(voterInfo?.lastName) || "",
        vote: voteValue,
      });
    }

    summaryByActivity[activityId] = {
      present,
      absent,
      total: present + absent,
      voters,
    };
  }

  return summaryByActivity;
}

export async function submitAttendanceVote(activityId, voterId, vote, firstName, lastName) {
  if (!activityId || typeof activityId !== "string") {
    throw new Error("activityId is required");
  }

  if (!voterId || typeof voterId !== "string") {
    throw new Error("voterId is required");
  }

  if (!isValidAttendanceVote(vote)) {
    throw new Error("Invalid vote value");
  }

  const safeFirstName = sanitizeName(firstName);
  const safeLastName = sanitizeName(lastName);

  if (!safeFirstName || !safeLastName) {
    throw new Error("Le nom et le prenom sont obligatoires");
  }

  const currentPayload = await readAttendanceVotesPayload();
  const votesByActivity = { ...currentPayload.votesByActivity };
  const votersById = { ...currentPayload.votersById };
  const currentVotesForActivity = { ...(votesByActivity[activityId] || {}) };

  currentVotesForActivity[voterId] = vote;
  votesByActivity[activityId] = currentVotesForActivity;
  votersById[voterId] = {
    firstName: safeFirstName,
    lastName: safeLastName,
  };

  const savedPayload = await writeAttendanceVotesPayload({ votesByActivity, votersById });
  const summaryByActivity = toAttendanceSummaryByActivity(savedPayload.votesByActivity, savedPayload.votersById);

  return {
    activityId,
    summary: summaryByActivity[activityId] || { present: 0, absent: 0, total: 0, voters: [] },
  };
}

export async function getAttendanceSummaryByActivity() {
  const payload = await readAttendanceVotesPayload();
  return toAttendanceSummaryByActivity(payload.votesByActivity, payload.votersById);
}
