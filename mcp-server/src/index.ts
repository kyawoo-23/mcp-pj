import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { registerCourseTools } from "./tools/courses.js";
import { registerFacilityTools } from "./tools/facilities.js";

// Load environment variables
const PORT = parseInt(process.env.PORT || "4004", 10);
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

/**
 * Create and configure the MCP server
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "uni-services",
    version: "0.1.0",
  });

  // Register all tools
  registerCourseTools(server);
  registerFacilityTools(server);

  return server;
}

/**
 * Validate the Authorization header
 */
function validateAuth(req: IncomingMessage): boolean {
  if (!AUTH_TOKEN) {
    // If no token is configured, skip auth (development mode)
    console.warn("⚠️  No MCP_AUTH_TOKEN configured - auth disabled");
    return true;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  // Support both "Bearer <token>" and plain token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === AUTH_TOKEN;
}

/**
 * Handle CORS for browser-based clients
 */
function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

/**
 * Main entry point
 */
async function main() {
  const mcpServer = createMcpServer();

  // Store active transports by session ID
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createServer(async (req, res) => {
    setCorsHeaders(res);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://localhost:${PORT}`);

    // Only handle /mcp endpoint
    if (url.pathname !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    // Validate auth
    if (!validateAuth(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // Handle POST requests (MCP messages)
    if (req.method === "POST") {
      // Check for existing session
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports.has(sessionId)) {
        // Reuse existing transport
        transport = transports.get(sessionId)!;
      } else {
        // Create new transport for this session
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports.set(newSessionId, transport);
            console.log(`✅ New MCP session: ${newSessionId}`);
          },
        });

        // Connect transport to MCP server
        await mcpServer.connect(transport);
      }

      // Handle the request
      await transport.handleRequest(req, res);
      return;
    }

    // Handle GET requests (SSE stream for server-to-client messages)
    if (req.method === "GET") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (!sessionId || !transports.has(sessionId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid or missing session ID" }));
        return;
      }

      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res);
      return;
    }

    // Handle DELETE requests (close session)
    if (req.method === "DELETE") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!;
        await transport.close();
        transports.delete(sessionId);
        console.log(`🔒 Session closed: ${sessionId}`);
      }
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 MCP Server running at http://localhost:${PORT}/mcp`);
    console.log(`📋 Available tools:`);
    console.log(`   Course: search_courses, get_course_details, get_course_sections, register_course, get_student_registrations, drop_course`);
    console.log(`   Facility: search_facilities, book_facility, get_student_bookings, cancel_booking`);
  });
}

main().catch(console.error);
