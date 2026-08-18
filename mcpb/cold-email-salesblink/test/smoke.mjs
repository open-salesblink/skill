/**
 * Smoke test: spawns the MCP server over stdio and exercises the protocol
 * end-to-end. Runs without a SalesBlink API key (auth-required paths are
 * expected to return structured isError responses, not crashes).
 *
 * Usage: node test/smoke.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.join(__dirname, "..", "server", "index.js");

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function textOf(result) {
  return result?.content?.[0]?.type === "text" ? result.content[0].text : "";
}

function parseJson(result) {
  try {
    return JSON.parse(textOf(result));
  } catch {
    return null;
  }
}

async function main() {
  const env = { ...process.env };
  delete env.SALESBLINK_API_KEY; // ensure the unauthenticated code path

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_ENTRY],
    env,
    stderr: "pipe",
  });

  const client = new Client({ name: "mcpb-smoke-test", version: "0.1.0" });

  transport.stderr.on("data", (chunk) => {
    // Surface server logs only when the test fails loudly; keep output clean.
    if (process.env.DEBUG_SMOKE) process.stderr.write(`[server] ${chunk}`);
  });

  await client.connect(transport);
  check("initialize handshake", true);

  // --- tools/list ---
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  const expected = [
    "salesblink_check_auth",
    "salesblink_get_reference_doc",
    "salesblink_list_reference_docs",
    "salesblink_request",
    "salesblink_signup",
  ];
  check(
    "tools/list returns exactly the 5 expected tools",
    JSON.stringify(names) === JSON.stringify(expected),
    JSON.stringify(names),
  );
  check(
    "every tool has an object inputSchema",
    tools.every((t) => t.inputSchema && t.inputSchema.type === "object"),
  );

  // --- list reference docs ---
  const listRes = await client.callTool({ name: "salesblink_list_reference_docs", arguments: {} });
  const listJson = parseJson(listRes);
  check("list_reference_docs returns topics", Array.isArray(listJson?.topics));
  check(
    "list_reference_docs covers overview + 18 domains (19 total)",
    listJson?.topics?.length === 19,
    `got ${listJson?.topics?.length}`,
  );

  // --- get reference doc (valid) ---
  const docRes = await client.callTool({
    name: "salesblink_get_reference_doc",
    arguments: { topic: "overview" },
  });
  check(
    "get_reference_doc('overview') returns markdown with base URL",
    !docRes.isError && textOf(docRes).includes("https://run.salesblink.io/api/public/v1.0.0"),
  );

  // --- get reference doc (unknown topic) ---
  const badDocRes = await client.callTool({
    name: "salesblink_get_reference_doc",
    arguments: { topic: "does-not-exist" },
  });
  check(
    "get_reference_doc with unknown topic returns structured isError",
    badDocRes.isError === true && parseJson(badDocRes)?.error?.message?.length > 0,
  );

  // --- path traversal rejection ---
  const traversalRes = await client.callTool({
    name: "salesblink_get_reference_doc",
    arguments: { topic: "../../etc/passwd" },
  });
  check("get_reference_doc rejects path traversal", traversalRes.isError === true);

  // --- request without API key ---
  const noKeyRes = await client.callTool({
    name: "salesblink_request",
    arguments: { method: "GET", path: "/lists" },
  });
  const noKeyJson = parseJson(noKeyRes);
  check(
    "request without API key returns clear 401 isError",
    noKeyRes.isError === true &&
      noKeyJson?.error?.status === 401 &&
      /api key/i.test(noKeyJson?.error?.message || ""),
    textOf(noKeyRes).slice(0, 200),
  );

  // --- SSRF guard ---
  const ssrfRes = await client.callTool({
    name: "salesblink_request",
    arguments: { method: "GET", path: "https://evil.example.com/x" },
  });
  check("request rejects absolute URL path (SSRF guard)", ssrfRes.isError === true);

  const protoRelRes = await client.callTool({
    name: "salesblink_request",
    arguments: { method: "GET", path: "//evil.example.com/x" },
  });
  check("request rejects protocol-relative path", protoRelRes.isError === true);

  // --- invalid method rejected by schema validation ---
  // (the SDK reports input-validation failures as isError tool results)
  const badMethodRes = await client.callTool({
    name: "salesblink_request",
    arguments: { method: "TRACE", path: "/lists" },
  });
  check(
    "request rejects invalid HTTP method (schema validation)",
    badMethodRes.isError === true && /validation/i.test(textOf(badMethodRes)),
    textOf(badMethodRes).slice(0, 200),
  );

  // --- signup schema validation ---
  const weakPwRes = await client.callTool({
    name: "salesblink_signup",
    arguments: { email: "a@b.co", password: "weak", name: "T" },
  });
  check(
    "signup rejects weak password (schema validation)",
    weakPwRes.isError === true && /validation|password/i.test(textOf(weakPwRes)),
    textOf(weakPwRes).slice(0, 200),
  );

  // --- check_auth without key ---
  const authRes = await client.callTool({ name: "salesblink_check_auth", arguments: {} });
  check("check_auth without API key returns isError", authRes.isError === true);

  await client.close();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
