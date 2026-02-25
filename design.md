# Design Document: TDX MCP Server

## Overview

The TDX MCP Server is a Model Context Protocol (MCP) server implementation that provides programmatic access to TeamDynamix (TDX) ticketing and service management APIs. It enables AI assistants and other MCP clients to interact with TDX resources through a standardized interface.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   MCP Client    │
│  (Claude, etc)  │
└────────┬────────┘
         │ stdio
         │ MCP Protocol
         │
┌────────▼────────┐
│   TDX MCP       │
│   Server        │
│                 │
│  ┌──────────┐   │
│  │  Tools   │   │
│  └──────────┘   │
│  ┌──────────┐   │
│  │  Client  │   │
│  └──────────┘   │
└────────┬────────┘
         │ HTTPS
         │ REST API
         │
┌────────▼────────┐
│  TeamDynamix    │
│   Web API       │
└─────────────────┘
```

### Component Architecture

#### 1. Entry Point (`src/index.ts`)
- **Responsibility**: Application bootstrapping and server lifecycle management
- **Key Functions**:
  - Environment configuration validation
  - MCP server initialization
  - Tool registration
  - stdio transport setup

#### 2. TDX Client (`src/tdx-client.ts`)
- **Responsibility**: HTTP communication layer with TDX API
- **Key Features**:
  - JWT token management with automatic refresh
  - Support for multiple authentication methods
  - Generic HTTP request wrapper with error handling
  - Convenience methods for REST operations (GET, POST, PUT, PATCH, DELETE)

**Design Decisions**:
- Token caching with 23-hour expiry (TDX tokens expire at 24 hours)
- Automatic re-authentication on token expiry
- Scoped API endpoints to configured application ID

#### 3. Type Definitions (`src/types.ts`)
- **Responsibility**: Type safety for TDX API contracts
- **Key Types**:
  - Configuration models (`TdxConfig`, auth params)
  - Domain models (`Ticket`, `FeedEntry`, `TicketForm`)
  - Search parameters (`TicketSearch`, `CustomAttributeSearch`)
  - Helper types for attachments, attributes, and assignments

**Design Decisions**:
- Comprehensive typing for all TDX API responses
- Optional fields to handle API variations
- Extensible structure for custom attributes

#### 4. Tool Modules (`src/tools/`)

##### Tickets Tool (`tickets.ts`)
Implements ticket-related operations:
- `search_tickets`: Advanced search with multiple filter parameters
- `get_ticket`: Retrieve full ticket details by ID
- `get_ticket_forms`: List available ticket forms
- `get_ticket_resources`: Search for eligible assignees

##### Feed Tool (`feed.ts`)
Implements activity feed operations:
- `get_ticket_feed`: Retrieve ticket activity history

## Design Principles

### 1. Separation of Concerns
- **Transport Layer**: MCP server handles protocol communication
- **Business Logic**: Tool implementations focus on TDX operations
- **API Layer**: TDX client abstracts HTTP details
- **Type Layer**: Separate type definitions ensure type safety

### 2. Error Handling Strategy
- Tool-level error catching with descriptive messages
- HTTP-level error propagation with status codes and response bodies
- Authentication errors trigger automatic retry with new token
- Client-facing errors include context (operation, parameters)

### 3. Authentication Flow
```
Tool Call
   ↓
ensureAuth()
   ↓
Is token valid? ─Yes→ Continue
   ↓ No
authenticate()
   ↓
Store token + expiry
   ↓
Continue with request
```

### 4. Configuration Management
- Environment-based configuration via dotenv
- Validation at startup (fail fast)
- Support for two authentication methods:
  - **login**: Username/password for individual users
  - **loginadmin**: BEID/WebServicesKey for service accounts

### 5. Extensibility

The modular tool architecture supports easy addition of new capabilities:

```typescript
// Adding a new tool module
import { registerNewTools } from "./tools/new-module.js";

// In main()
registerNewTools(server, tdxClient);
```

Each tool module:
- Registers its own MCP tools
- Uses shared TDX client
- Handles its own error scenarios
- Defines its own Zod schemas for validation

## Technology Stack

### Runtime & Language
- **Node.js**: ES2022 target with NodeNext modules
- **TypeScript**: Full strict mode for type safety

### Core Dependencies
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **dotenv**: Environment configuration
- **zod**: Runtime schema validation for tool inputs

### Build & Development
- **TypeScript Compiler**: Native TypeScript compilation
- **ES Modules**: Modern JavaScript module system

## Data Flow

### Typical Request Flow

```
1. MCP Client → Tool Call Request
   ↓
2. Server validates input (Zod schemas)
   ↓
3. Tool handler invoked with typed arguments
   ↓
4. TDX Client checks/refreshes authentication
   ↓
5. HTTP request to TDX API
   ↓
6. Response parsing and transformation
   ↓
7. Formatted response to MCP Client
```

### Authentication Flow

```
Initial Request:
- Load config from environment
- No token cached

First API Call:
- authenticate() called
- JWT token stored
- Expiry set to now + 23 hours

Subsequent Calls (within 23 hours):
- Token reused
- No re-authentication

After 23 Hours:
- Token expired
- Re-authentication triggered automatically
- New token cached
```

## Security Considerations

### 1. Credential Storage
- Credentials stored in environment variables (not committed)
- `.env.example` provides template without sensitive data
- `.gitignore` prevents accidental credential commit

### 2. Token Management
- JWT tokens cached in memory only
- No persistent token storage
- Automatic token refresh prevents expiry-related failures

### 3. API Scope
- All ticket operations scoped to configured application ID
- Prevents cross-application data access
- Server runs with permissions of authenticated user

### 4. Error Messages
- Avoid exposing sensitive data in error responses
- Include operation context for debugging
- HTTP status codes preserved for client handling

## Scalability & Performance

### Current Limitations
- Single-threaded Node.js process
- Synchronous tool execution
- In-memory token storage (not suitable for multi-instance deployment)

### Future Considerations
- Connection pooling for high-volume scenarios
- Batch operation support for bulk ticket operations
- Caching layer for frequently accessed data (forms, resources)
- Distributed token cache (Redis) for multi-instance deployment

## Testing Strategy (Recommendations)

### Unit Tests
- TDX client authentication logic
- Tool parameter validation (Zod schemas)
- Error handling paths

### Integration Tests
- End-to-end tool execution with mock TDX API
- Token refresh scenarios
- MCP protocol compliance

### Manual Testing
- Real TDX instance integration
- Authentication method validation
- Error scenarios (network failures, invalid credentials)

## Future Enhancements

### Planned Features
1. **Ticket Creation/Updates**: Write operations for ticket management
2. **Feed Entry Creation**: Post comments to tickets
3. **Attachment Management**: Upload/download ticket attachments
4. **Advanced Search**: Custom attribute filtering
5. **Batch Operations**: Multiple ticket updates in single operation
6. **Webhook Support**: Real-time ticket notifications
7. **Asset Management**: TDX asset/CI operations
8. **Project Management**: Project and task operations

### Technical Debt
- Add comprehensive error type hierarchy
- Implement request rate limiting
- Add request/response logging (with PII masking)
- Implement retry logic for transient failures
- Add health check endpoint
- Create automated test suite

## Development Guidelines

### Adding New Tools

1. Create tool module in `src/tools/`
2. Define types in `src/types.ts`
3. Implement tool with Zod schema
4. Register in `src/index.ts`
5. Update documentation

### Code Style
- Strict TypeScript mode enforced
- Async/await for all asynchronous operations
- Explicit error handling (try/catch in tools)
- Descriptive variable and function names
- JSDoc comments for public APIs

### Commit Guidelines
- Keep credentials out of commits
- Test against real TDX instance before committing
- Update type definitions when API models change
- Document breaking changes in commit messages

## References

- [TeamDynamix API Documentation](https://solutions.teamdynamix.com/TDWebApi)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
