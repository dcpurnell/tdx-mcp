# TDX MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with TeamDynamix (TDX) ticketing and service management systems.

## Overview

This MCP server provides a bridge between AI assistants (like Claude) and TeamDynamix, allowing natural language interactions with your organization's ticketing system. It exposes TDX functionality through standardized MCP tools that AI assistants can invoke to search tickets, retrieve details, view activity feeds, and more.

## Features

- **Ticket Search**: Search tickets with multiple filter criteria (status, priority, dates, assignees, etc.)
- **Ticket Details**: Retrieve complete ticket information including custom attributes and attachments
- **Activity Feed**: View ticket history, comments, and status changes
- **Form Management**: List available ticket forms for your application
- **Resource Lookup**: Search for eligible ticket assignees (people and groups)
- **Dual Authentication**: Support for both username/password and BEID/key authentication
- **Automatic Token Management**: JWT tokens cached and automatically refreshed

## Prerequisites

- Node.js 18 or higher
- Access to a TeamDynamix instance
- Valid TDX credentials (username/password or BEID/Web Services Key)
- TDX Application ID for your ticketing application

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tdx-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your TDX credentials
```

## Configuration

Create a `.env` file in the project root with the following variables:

### Required Settings

```bash
# Base URL for your TeamDynamix instance (without trailing slash)
TDX_BASE_URL=https://your-org.teamdynamix.com/TDWebApi

# Application ID for the ticketing app
TDX_APP_ID=1234

# Authentication method: "login" or "loginadmin"
TDX_AUTH_METHOD=login
```

### Authentication Methods

#### Standard Login (Username/Password)
```bash
TDX_AUTH_METHOD=login
TDX_USERNAME=your.username
TDX_PASSWORD=your.password
```

#### Admin Login (BEID/Web Services Key)
```bash
TDX_AUTH_METHOD=loginadmin
TDX_BEID=your-beid
TDX_WEB_SERVICES_KEY=your-web-services-key
```

### Finding Your Configuration Values

- **TDX_BASE_URL**: Your TeamDynamix API base URL (e.g., `https://elon.teamdynamix.com/TDWebApi`)
- **TDX_APP_ID**: Found in TDX Admin > Applications > Your Ticketing App > App ID
- **TDX_BEID** & **TDX_WEB_SERVICES_KEY**: Generated in TDX Admin > Web Services

## Usage

### With Claude Desktop

Add to your Claude Desktop MCP configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tdx": {
      "command": "node",
      "args": ["/absolute/path/to/tdx-mcp/dist/index.js"],
      "env": {
        "TDX_BASE_URL": "https://your-org.teamdynamix.com/TDWebApi",
        "TDX_APP_ID": "1234",
        "TDX_AUTH_METHOD": "login",
        "TDX_USERNAME": "your.username",
        "TDX_PASSWORD": "your.password"
      }
    }
  }
}
```

Restart Claude Desktop for changes to take effect.

### Standalone Mode

Run the server directly:

```bash
npm start
```

The server will start and communicate via stdio, waiting for MCP client connections.

## Available Tools

### `search_tickets`
Search for tickets with optional filters.

**Parameters**:
- `searchText` (optional): Free-text search across ticket fields
- `statusIDs` (optional): Array of status IDs to filter by
- `priorityIDs` (optional): Array of priority IDs to filter by
- `requestorUids` (optional): Array of requestor UIDs
- `responsibilityUids` (optional): Array of responsible person UIDs
- `responsibilityGroupIDs` (optional): Array of responsible group IDs
- `createdDateFrom` (optional): Filter tickets created on/after date (YYYY-MM-DD)
- `createdDateTo` (optional): Filter tickets created on/before date (YYYY-MM-DD)
- `modifiedDateFrom` (optional): Filter tickets modified on/after date (YYYY-MM-DD)
- `modifiedDateTo` (optional): Filter tickets modified on/before date (YYYY-MM-DD)
- `maxResults` (optional): Maximum results to return (default: 25)

**Example**:
> "Show me all high priority tickets assigned to me created in the last week"

### `get_ticket`
Retrieve complete details for a specific ticket.

**Parameters**:
- `ticketId` (required): The ticket ID to retrieve

**Example**:
> "Get full details for ticket 12345"

### `get_ticket_feed`
View activity feed (comments, updates, status changes) for a ticket.

**Parameters**:
- `ticketId` (required): The ticket ID to get feed for

**Example**:
> "Show me the activity history for ticket 12345"

### `get_ticket_forms`
List all active ticket forms for your application.

**No parameters required**

**Example**:
> "What ticket forms are available?"

### `get_ticket_resources`
Search for eligible ticket assignment resources (people and groups).

**Parameters**:
- `searchText` (optional): Search text to filter resources (max 5 results)

**Example**:
> "Find resources matching 'IT Support'"

## Example Conversations

Once configured with Claude Desktop, you can have natural language conversations:

**User**: "Show me all open tickets assigned to the networking team"  
**Claude**: *Uses search_tickets with appropriate filters*

**User**: "What's the latest update on ticket 5678?"  
**Claude**: *Uses get_ticket_feed to show recent activity*

**User**: "Get details for that ticket"  
**Claude**: *Uses get_ticket to retrieve full information*

## Project Structure

```
tdx-mcp/
├── src/
│   ├── index.ts              # Server entry point
│   ├── tdx-client.ts         # TDX API client
│   ├── types.ts              # TypeScript type definitions
│   └── tools/
│       ├── tickets.ts        # Ticket-related tools
│       └── feed.ts           # Feed-related tools
├── dist/                     # Compiled JavaScript (generated)
├── .env.example              # Configuration template
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
├── requirements.md           # Detailed requirements
└── design.md                 # Architecture & design docs
```

## Development

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Extending the Server

To add new tools:

1. Define types in `src/types.ts`
2. Create tool module in `src/tools/`
3. Implement tool with Zod schema validation
4. Register tool in `src/index.ts`

Example:

```typescript
// src/tools/my-tools.ts
export function registerMyTools(server: McpServer, client: TdxClient) {
  server.tool(
    "my_tool",
    "Description of what the tool does",
    {
      param1: z.string().describe("Parameter description"),
    },
    async (args) => {
      try {
        const result = await client.get(`/endpoint/${args.param1}`);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
    }
  );
}
```

Then register in `src/index.ts`:

```typescript
import { registerMyTools } from "./tools/my-tools.js";

// In main()
registerMyTools(server, tdxClient);
```

## Troubleshooting

### Authentication Fails

**Error**: `TDX authentication failed (401)`

**Solutions**:
- Verify credentials in `.env` are correct
- Check `TDX_AUTH_METHOD` matches your credential type
- Ensure user has API access permissions in TDX
- Verify `TDX_BASE_URL` includes `/TDWebApi` suffix

### Server Won't Start

**Error**: `TDX_BASE_URL environment variable is required`

**Solutions**:
- Ensure `.env` file exists in project root
- Check all required variables are set
- Verify `.env` file format (no spaces around `=`)

### Connection Timeout

**Error**: `TDX API error (timeout)`

**Solutions**:
- Verify network connectivity to TDX instance
- Check firewall settings allow HTTPS to TDX
- Confirm TDX instance URL is correct and accessible

### Permission Denied

**Error**: `TDX API error (403)`

**Solutions**:
- User may lack permissions for requested resource
- Check TDX role and security assignments
- Verify Application ID matches a ticketing app you have access to

### Tools Not Appearing in Claude

**Issue**: Claude doesn't see TDX tools

**Solutions**:
- Restart Claude Desktop completely
- Check `claude_desktop_config.json` syntax (valid JSON)
- Verify absolute path to `dist/index.js` is correct
- Check Claude Desktop logs for startup errors

## Security Considerations

- **Never commit `.env` files** containing real credentials
- Use environment variables or secure vaults in production
- JWT tokens are cached in memory only (not persisted)
- Tokens automatically expire after 23 hours
- Server operates with authenticated user's permissions only
- No privilege escalation beyond TDX user capabilities

## Limitations

Current version is read-only:
- Cannot create or update tickets
- Cannot post comments or feed entries
- Cannot upload attachments
- See `requirements.md` for planned features

## Support

For issues and questions:
1. Check this README and troubleshooting section
2. Review `design.md` for architecture details
3. Review `requirements.md` for feature specifications
4. Check TeamDynamix API documentation for endpoint details

## License

[Add your license information here]

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [TeamDynamix Web API](https://solutions.teamdynamix.com/TDWebApi)
- [Zod](https://github.com/colinhacks/zod) for schema validation
