import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";
import {
  getAttendanceSummaryByActivity,
  isValidAttendanceVote,
  submitAttendanceVote,
} from "./_lib/attendanceVotesStore.mjs";

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

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "POST") {
    let parsedBody = {};

    try {
      parsedBody = parseBody(request.body);
    } catch {
      return sendJson(response, 400, { error: "Invalid JSON body" });
    }

    const activityId = typeof parsedBody.activityId === "string" ? parsedBody.activityId : "";
    const voterId = typeof parsedBody.voterId === "string" ? parsedBody.voterId : "";
    const vote = typeof parsedBody.vote === "string" ? parsedBody.vote : "";
    const firstName = typeof parsedBody.firstName === "string" ? parsedBody.firstName : "";
    const lastName = typeof parsedBody.lastName === "string" ? parsedBody.lastName : "";

    if (!activityId || !voterId || !isValidAttendanceVote(vote) || !firstName.trim() || !lastName.trim()) {
      return sendJson(response, 400, { error: "Invalid vote payload" });
    }

    try {
      const result = await submitAttendanceVote(activityId, voterId, vote, firstName, lastName);
      return sendJson(response, 200, { ok: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save vote";
      return sendJson(response, 503, { error: message });
    }
  }

  if (request.method === "GET") {
    if (!isAuthenticatedRequest(request)) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    try {
      const summaryByActivity = await getAttendanceSummaryByActivity();
      return sendJson(response, 200, { summaryByActivity });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load attendance summary";
      return sendJson(response, 503, { error: message });
    }
  }

  return sendJson(response, 405, { error: "Method not allowed" });
}
