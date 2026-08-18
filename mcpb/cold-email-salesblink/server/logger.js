/**
 * Stderr-only logger. stdout is reserved for the MCP protocol — never write there.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function resolveLevel(raw) {
  const level = String(raw || "info").toLowerCase();
  return Object.hasOwn(LEVELS, level) ? level : "info";
}

const activeLevel = resolveLevel(process.env.SALESBLINK_MCPB_LOG_LEVEL);

/** Redact anything that looks like a SalesBlink API key before logging. */
function redact(value) {
  return String(value).replace(/key-[A-Za-z0-9-]+/g, "key-***REDACTED***");
}

function write(level, args) {
  if (LEVELS[level] < LEVELS[activeLevel]) return;
  const line = args
    .map((a) => {
      if (a instanceof Error) return `${a.message}\n${a.stack || ""}`;
      if (typeof a === "object" && a !== null) {
        try {
          return JSON.stringify(a);
        } catch {
          return "[unserializable]";
        }
      }
      return String(a);
    })
    .join(" ");
  process.stderr.write(
    `[${new Date().toISOString()}] [salesblink-mcpb] [${level}] ${redact(line)}\n`,
  );
}

export const logger = {
  debug: (...args) => write("debug", args),
  info: (...args) => write("info", args),
  warn: (...args) => write("warn", args),
  error: (...args) => write("error", args),
};
