/**
 * HTTP client for the SalesBlink public REST API.
 *
 * Defensive by design: fixed base URL (no SSRF), strict path validation,
 * request timeouts, one retry on transient network failure, and structured
 * errors that mirror the API's own status-code guidance.
 */

import { logger } from "./logger.js";

export const BASE_URL = "https://run.salesblink.io/api/public/v1.0.0";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 120_000;
const MAX_RESPONSE_CHARS = 100_000;

const STATUS_HINTS = {
  400: "Bad request — re-check the payload structure against the reference doc for this endpoint.",
  401: "Unauthorized — verify the configured SalesBlink API key.",
  403: "Forbidden — the API key's role is too low for this operation.",
  404: "Not found — verify the ID and endpoint path.",
  409: "Conflict — the resource already exists, or a connection attempt failed.",
  429: "Rate limited — wait at least 60 seconds before retrying this request.",
  500: "SalesBlink server error — retry once after 10 seconds.",
};

export class ApiError extends Error {
  constructor(message, { status = null, hint = null, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.hint = hint;
    this.details = details;
  }
}

export function getTimeoutMs() {
  const raw = Number.parseInt(process.env.SALESBLINK_TIMEOUT_MS || "", 10);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.min(raw, MAX_TIMEOUT_MS);
  }
  return DEFAULT_TIMEOUT_MS;
}

/**
 * Validate a relative API path. Returns the normalized path or throws.
 * Rejects absolute/protocol-relative URLs so requests can only ever hit BASE_URL.
 */
export function validatePath(path) {
  if (typeof path !== "string" || path.length === 0) {
    throw new ApiError("path must be a non-empty string like /lists", {
      hint: "Pass a relative API path, e.g. /sequences or /lists/abc-123.",
    });
  }
  if (!path.startsWith("/")) {
    throw new ApiError(`path must start with "/": ${JSON.stringify(path)}`, {
      hint: "Pass a relative API path, e.g. /sequences. The base URL is added automatically.",
    });
  }
  if (path.startsWith("//") || path.includes("://") || path.includes("\\")) {
    throw new ApiError(`path must be a relative API path, not a URL: ${JSON.stringify(path)}`, {
      hint: "Pass a relative API path, e.g. /sequences.",
    });
  }
  if (!/^[\x20-\x7E]+$/.test(path)) {
    throw new ApiError("path contains invalid (non-ASCII or control) characters");
  }
  return path;
}

function buildUrl(path, query) {
  const url = new URL(BASE_URL + path);
  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.append(key, String(value));
    }
  }
  return url;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function parseResponseBody(response) {
  let text = await response.text();
  let truncated = false;
  if (text.length > MAX_RESPONSE_CHARS) {
    text = text.slice(0, MAX_RESPONSE_CHARS);
    truncated = true;
  }
  if (text.length === 0) return { body: null, truncated };
  try {
    return { body: JSON.parse(text), truncated };
  } catch {
    return { body: text, truncated };
  }
}

/**
 * Perform one authenticated (or public) request against the SalesBlink API.
 *
 * @param {object} opts
 * @param {string} opts.method - GET | POST | PATCH | PUT | DELETE
 * @param {string} opts.path - relative API path, e.g. /lists
 * @param {object} [opts.query] - query string parameters
 * @param {*} [opts.body] - JSON request body (ignored for GET/DELETE)
 * @param {string|null} [opts.apiKey] - SalesBlink API key
 * @param {boolean} [opts.requireAuth=true] - enforce that an API key is configured
 * @returns {Promise<{status:number, body:*, truncated:boolean}>}
 */
export async function salesblinkRequest({
  method,
  path,
  query,
  body,
  apiKey = null,
  requireAuth = true,
}) {
  const safePath = validatePath(path);
  const upperMethod = String(method || "").toUpperCase();

  if (requireAuth && !apiKey) {
    throw new ApiError("No SalesBlink API key configured.", {
      status: 401,
      hint: "Set the api_key user config (SALESBLINK_API_KEY env var). Get a key at https://run.salesblink.io/account/integration/api, or use the salesblink_signup tool to create an account.",
    });
  }

  const headers = { Accept: "application/json" };
  if (apiKey) headers.Authorization = apiKey; // no "Bearer" prefix, per API docs

  const hasBody = body !== undefined && body !== null && upperMethod !== "GET" && upperMethod !== "DELETE";
  if (hasBody) headers["Content-Type"] = "application/json";

  const url = buildUrl(safePath, query);
  const timeoutMs = getTimeoutMs();
  const options = { method: upperMethod, headers };
  if (hasBody) options.body = JSON.stringify(body);

  logger.debug(`${upperMethod} ${url.pathname}${url.search} (timeout ${timeoutMs}ms)`);

  let response;
  let lastNetworkError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      response = await fetchWithTimeout(url, options, timeoutMs);
      lastNetworkError = null;
      break;
    } catch (err) {
      lastNetworkError = err;
      const isTimeout = err?.name === "AbortError";
      logger.warn(
        `Attempt ${attempt}/2 failed for ${upperMethod} ${safePath}: ${isTimeout ? `timeout after ${timeoutMs}ms` : err.message}`,
      );
      if (isTimeout) {
        throw new ApiError(`Request timed out after ${timeoutMs}ms: ${upperMethod} ${safePath}`, {
          hint: "Try again, or raise SALESBLINK_TIMEOUT_MS (max 120000).",
        });
      }
    }
  }

  if (!response) {
    throw new ApiError(`Network error calling ${upperMethod} ${safePath}: ${lastNetworkError?.message || "unknown"}`, {
      hint: "Check network connectivity to run.salesblink.io and retry.",
    });
  }

  const { body: parsedBody, truncated } = await parseResponseBody(response);
  logger.debug(`${upperMethod} ${safePath} -> ${response.status}`);

  if (!response.ok) {
    const apiMessage =
      parsedBody && typeof parsedBody === "object" && typeof parsedBody.message === "string"
        ? parsedBody.message
        : null;
    throw new ApiError(apiMessage || `HTTP ${response.status} from ${upperMethod} ${safePath}`, {
      status: response.status,
      hint: STATUS_HINTS[response.status] || null,
      details: parsedBody,
    });
  }

  // SalesBlink convention: HTTP 200 can still carry { success: false, message }.
  if (parsedBody && typeof parsedBody === "object" && parsedBody.success === false) {
    throw new ApiError(
      typeof parsedBody.message === "string" ? parsedBody.message : "API returned success: false",
      { status: 200, details: parsedBody },
    );
  }

  return { status: response.status, body: parsedBody, truncated };
}
