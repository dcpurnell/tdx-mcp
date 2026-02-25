import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TdxClient } from "./tdx-client.js";
import { TdxConfig } from "./types.js";
import { registerTicketTools } from "./tools/tickets.js";
import { registerFeedTools } from "./tools/feed.js";

// --- Load config from environment ---
function loadConfig(): TdxConfig {
  const baseUrl = process.env.TDX_BASE_URL;
  const appId = process.env.TDX_APP_ID;
  const authMethod = process.env.TDX_AUTH_METHOD as "login" | "loginadmin" | undefined;

  if (!baseUrl) throw new Error("TDX_BASE_URL environment variable is required");
  if (!appId) throw new Error("TDX_APP_ID environment variable is required");
  if (!authMethod || !["login", "loginadmin"].includes(authMethod)) {
    throw new Error('TDX_AUTH_METHOD must be "login" or "loginadmin"');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""), // strip trailing slash
    appId,
    authMethod,
    username: process.env.TDX_USERNAME,
    password: process.env.TDX_PASSWORD,
    beid: process.env.TDX_BEID,
    webServicesKey: process.env.TDX_WEB_SERVICES_KEY,
  };
}

// --- Main ---
async function main() {
  const config = loadConfig();
  const tdxClient = new TdxClient(config);

  const server = new McpServer({
    name: "tdx-mcp",
    version: "1.0.0",
  });

  // Register tool groups
  registerTicketTools(server, tdxClient);
  registerFeedTools(server, tdxClient);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[tdx-mcp] Server started");
}

main().catch((error) => {
  console.error("[tdx-mcp] Fatal error:", error);
  process.exit(1);
});
