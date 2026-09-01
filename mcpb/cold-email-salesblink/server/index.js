/**
 * SalesBlink Cold Email — MCP server (MCPB bundle).
 *
 * Exposes the SalesBlink public REST API over the Model Context Protocol
 * via stdio transport. Design: a generic, hardened API gateway tool plus
 * bundled reference docs so the model can learn exact request shapes.
 *
 * stdout carries MCP protocol frames only — all logging goes to stderr.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { ApiError, BASE_URL, salesblinkRequest } from "./api-client.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REFERENCES_DIR = path.join(__dirname, "references");

const SERVER_NAME = "cold-email-salesblink";
const SERVER_VERSION = "1.0.0";

const API_KEY = process.env.SALESBLINK_API_KEY || null;

/** One-line descriptions for each bundled reference doc topic. */
const TOPIC_DESCRIPTIONS = {
  overview: "API basics: base URL, auth, gotchas, rate limits, pagination, error handling — read this first",
  lists: "Create and manage lists (containers for contacts/leads)",
  contacts: "Add, update, move, remove leads in lists (batch up to 500 per request)",
  templates: "Reusable email templates with merge variables, spintax, attachments",
  sequences: "Automated email campaigns: steps, launch, pause, resume, clone, archive",
  senders: "Sending accounts: Gmail/Outlook OAuth, SMTP/IMAP, sender folders, warmup links",
  inbox: "Reply threads, sent/scheduled emails, drafts, replies, forwards, outcome classification",
  activity: "Engagement events: sent, opens, clicks, replies, per-lead activity history",
  analytics: "Aggregated stats: overall, daily, lead-level, per-mailbox",
  blocklist: "Account-level unsubscribes and blocked emails/domains (uses /unsubscribe routes)",
  organization: "Users, roles, and workspaces",
  folders: "Organize lists, templates, sequences, and senders into folders",
  "account-config": "Account config: custom tracking domains, signatures, API key verification",
  dfy: "Done-For-You: domain search/purchase and mailbox provisioning",
  billing: "Saved payment methods and billing magic links",
  "api-keys": "List, create, refresh, and delete API keys",
  reports: "Aggregated activity reports over a date range",
  "inbox-placement": "Deliverability tests: inbox/spam/promotions placement across providers",
  workflows: "End-to-end campaign setup examples (list -> contacts -> templates -> sequence -> launch)",
};

/** Resolve a doc topic to a safe file path inside REFERENCES_DIR, or null. */
async function resolveTopicFile(topic) {
  if (typeof topic !== "string" || !/^[a-z0-9-]{1,64}$/.test(topic)) return null;
  const filePath = path.join(REFERENCES_DIR, `${topic}.md`);
  if (!filePath.startsWith(REFERENCES_DIR + path.sep)) return null;
  try {
    await readFile(filePath, "utf8");
    return filePath;
  } catch {
    return null;
  }
}

function jsonResult(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function errorResult(err) {
  if (err instanceof ApiError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: {
                message: err.message,
                status: err.status,
                hint: err.hint,
                details: err.details,
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  }
  logger.error("Unexpected tool error:", err);
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { error: { message: "Internal server error while handling the tool call." } },
          null,
          2,
        ),
      },
    ],
  };
}

const server = new McpServer(
  { name: SERVER_NAME, version: SERVER_VERSION },
  {
    instructions: [
      "SalesBlink cold email outreach API gateway.",
      "Workflow: call salesblink_get_reference_doc with topic 'overview' first, then fetch the topic for the domain you need (lists, contacts, templates, sequences, senders, inbox, ...), then call salesblink_get for read endpoints or salesblink_mutate for write endpoints with the exact path/body from the docs.",
      `All requests go to ${BASE_URL}. Authentication uses the configured API key in the Authorization header (no Bearer prefix).`,
      "Always check the 'success' field in API responses. Paginate list endpoints with limit/skip (per_page/page for activity endpoints).",
    ].join(" "),
  },
);

// --- Tool 1a: read-only GET gateway ----------------------------------------

server.registerTool(
  "salesblink_get",
  {
    title: "SalesBlink API GET",
    description:
      "Make a read-only GET request to the SalesBlink public API " +
      `(${BASE_URL}). Use salesblink_get_reference_doc to look up exact endpoints, ` +
      "query parameters, and gotchas before calling this. " +
      "Example: path=/lists, query={ limit: 100, skip: 0 }.",
    inputSchema: {
      path: z
        .string()
        .min(1)
        .max(2048)
        .describe(
          "Relative API path starting with /, e.g. /sequences or /lists/550e8400-e29b-41d4-a716-446655440000. URL-encode messageIds in paths.",
        ),
      query: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Query string parameters, e.g. { limit: 100, skip: 0 }"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ path: apiPath, query }) => {
    try {
      const result = await salesblinkRequest({
        method: "GET",
        path: apiPath,
        query,
        apiKey: API_KEY,
      });
      return jsonResult({
        status: result.status,
        truncated: result.truncated || undefined,
        data: result.body,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

// --- Tool 1b: write/mutate gateway -----------------------------------------

server.registerTool(
  "salesblink_mutate",
  {
    title: "SalesBlink API Mutate",
    description:
      "Make a write request to the SalesBlink public API " +
      `(${BASE_URL}): POST, PATCH, PUT, or DELETE. Use salesblink_get_reference_doc ` +
      "to look up exact endpoints, payload shapes, and gotchas before calling this. " +
      "Example: method=POST path=/sequences body={...}.",
    inputSchema: {
      method: z
        .enum(["POST", "PATCH", "PUT", "DELETE"])
        .describe("HTTP method"),
      path: z
        .string()
        .min(1)
        .max(2048)
        .describe(
          "Relative API path starting with /, e.g. /sequences or /lists/abc-123. URL-encode messageIds in paths.",
        ),
      query: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Query string parameters"),
      body: z
        .unknown()
        .optional()
        .describe("JSON request body for POST/PATCH/PUT (ignored for DELETE)"),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async ({ method, path: apiPath, query, body }) => {
    try {
      const result = await salesblinkRequest({
        method,
        path: apiPath,
        query,
        body,
        apiKey: API_KEY,
      });
      return jsonResult({
        status: result.status,
        truncated: result.truncated || undefined,
        data: result.body,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

// --- Tool 2: public signup --------------------------------------------------

server.registerTool(
  "salesblink_signup",
  {
    title: "SalesBlink Signup",
    description:
      "Returns the public SalesBlink sign-up link where a new user can create an account. " +
      "No API key is required.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => {
    return jsonResult({
      success: true,
      message: "Please sign up through the SalesBlink web UI.",
      data: {
        login_link: "https://run.salesblink.io/signup",
        destination: "/signup",
        purpose: "signup",
      },
    });
  },
);

// --- Tool 3: list reference docs --------------------------------------------

server.registerTool(
  "salesblink_list_reference_docs",
  {
    title: "List API Reference Docs",
    description:
      "List the bundled SalesBlink API reference doc topics. Read 'overview' first, " +
      "then the topic for the domain you are working in, before using salesblink_get or salesblink_mutate.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => {
    try {
      const files = await readdir(REFERENCES_DIR);
      const available = new Set(
        files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")),
      );
      const topics = Object.entries(TOPIC_DESCRIPTIONS)
        .filter(([topic]) => available.has(topic))
        .map(([topic, description]) => ({ topic, description }));
      return jsonResult({ topics });
    } catch (err) {
      return errorResult(err);
    }
  },
);

// --- Tool 4: read a reference doc -------------------------------------------

server.registerTool(
  "salesblink_get_reference_doc",
  {
    title: "Read API Reference Doc",
    description:
      "Read a bundled SalesBlink API reference doc: exact endpoints, request/response " +
      "shapes, and gotchas for one domain. Call salesblink_list_reference_docs to see " +
      "all topics. Always read 'overview' first.",
    inputSchema: {
      topic: z
        .string()
        .min(1)
        .max(64)
        .describe("Doc topic, e.g. overview, sequences, lists, contacts, templates, senders"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ topic }) => {
    try {
      const normalized = topic.trim().toLowerCase();
      const filePath = await resolveTopicFile(normalized);
      if (!filePath) {
        throw new ApiError(`Unknown reference doc topic: ${JSON.stringify(topic)}`, {
          hint: "Call salesblink_list_reference_docs to see valid topics (e.g. overview, sequences, lists).",
        });
      }
      const content = await readFile(filePath, "utf8");
      return { content: [{ type: "text", text: content }] };
    } catch (err) {
      return errorResult(err);
    }
  },
);

// --- Tool 5: verify auth -----------------------------------------------------

server.registerTool(
  "salesblink_check_auth",
  {
    title: "Verify API Key",
    description:
      "Verify the configured SalesBlink API key by calling GET /account/verify. " +
      "Returns account info when the key is valid.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => {
    try {
      const result = await salesblinkRequest({
        method: "GET",
        path: "/account/verify",
        apiKey: API_KEY,
      });
      return jsonResult({ authenticated: true, status: result.status, data: result.body });
    } catch (err) {
      return errorResult(err);
    }
  },
);

// --- Startup / shutdown ------------------------------------------------------

async function main() {
  if (!API_KEY) {
    logger.warn(
      "SALESBLINK_API_KEY is not set — salesblink_get, salesblink_mutate, and salesblink_check_auth will fail until it is configured.",
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info(`${SERVER_NAME} v${SERVER_VERSION} connected via stdio (base URL: ${BASE_URL})`);

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down`);
    try {
      await server.close();
    } catch (err) {
      logger.error("Error during shutdown:", err);
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});
