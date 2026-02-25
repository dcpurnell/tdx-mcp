# Requirements Document: TDX MCP Server

## Project Overview

**Project Name**: TDX MCP Server
**Version**: 1.0.0
**Purpose**: Enable AI assistants and MCP clients to interact with TeamDynamix ticketing and
service management systems through the Model Context Protocol.

## Stakeholders

- **End Users**: Users of AI assistants (Claude, etc.) who need to access TDX ticketing data
- **Developers**: Engineers maintaining and extending the MCP server
- **System Administrators**: IT staff configuring and deploying the server
- **TDX Administrators**: TeamDynamix system administrators managing API access

## Business Requirements

### BR-1: TDX Integration

The system shall provide seamless integration with TeamDynamix Web API to enable
automated ticket management workflows through AI assistants.

### BR-2: Multi-Tenant Support

The system shall support multiple authentication methods to accommodate different
organizational security policies and user types.

### BR-3: Real-Time Data Access

The system shall provide current ticket information from TDX without manual data synchronization.

### BR-4: Secure Credential Management

The system shall protect TDX credentials and authentication tokens from unauthorized access.

## Functional Requirements

### FR-1: Authentication

#### FR-1.1: Authentication Methods

The system shall support two authentication methods:

- **Standard Login**: Username and password authentication
- **Admin Login**: BEID and Web Services Key authentication

#### FR-1.2: Token Management

- The system shall automatically obtain JWT tokens from TDX upon authentication
- The system shall cache authentication tokens for reuse
- The system shall automatically refresh expired tokens (expiring after 23 hours)
- The system shall handle authentication failures gracefully

#### FR-1.3: Configuration Validation

- The system shall validate all required configuration parameters at startup
- The system shall fail fast with descriptive error messages for missing/invalid configuration

### FR-2: Ticket Search

#### FR-2.1: Basic Search

The system shall provide a `search_tickets` tool that accepts the following parameters:

- Free-text search across ticket fields
- Maximum result limit (default: 25)

#### FR-2.2: Advanced Filtering

The search tool shall support filtering by:

- Status IDs
- Priority IDs
- Requestor UIDs
- Responsible person UIDs
- Responsible group IDs
- Creation date range (from/to)
- Modification date range (from/to)

#### FR-2.3: Search Results

The search tool shall return:

- Ticket ID
- Title
- Status name
- Priority name
- Requestor name
- Responsible person name
- Responsible group name
- Created date
- Modified date

### FR-3: Ticket Details

#### FR-3.1: Full Ticket Retrieval

The system shall provide a `get_ticket` tool that:

- Accepts a ticket ID as input
- Returns complete ticket details including:
  - All basic fields (title, description, status, priority, etc.)
  - SLA information
  - Custom attributes
  - Attachments metadata
  - Related tasks
  - Notification recipients

#### FR-3.2: Error Handling

The tool shall return descriptive errors when:

- Ticket ID does not exist
- User lacks permissions to view ticket
- API communication fails

### FR-4: Ticket Feed

#### FR-4.1: Activity Feed Retrieval

The system shall provide a `get_ticket_feed` tool that:

- Accepts a ticket ID as input
- Returns all feed entries chronologically

#### FR-4.2: Feed Entry Details

Each feed entry shall include:

- Entry ID
- Creation date
- Author full name
- Privacy flag (public/private)
- Entry body/content

### FR-5: Ticket Forms

#### FR-5.1: Form Listing

The system shall provide a `get_ticket_forms` tool that:

- Retrieves all active ticket forms for the configured application
- Returns form ID, name, description, and active status

#### FR-5.2: Form Details

Form information shall include:

- Unique form identifier
- Display name
- Description text
- Active/inactive status

### FR-6: Resource Search

#### FR-6.1: Assignment Resource Search

The system shall provide a `get_ticket_resources` tool that:

- Accepts optional search text
- Returns eligible assignment resources (people and groups)
- Limits results to 5 entries

#### FR-6.2: Resource Details

Each resource entry shall include:

- Resource ID
- Resource name
- Resource value (email or identifier)
- Resource type (person/group)

### FR-7: MCP Protocol Compliance

#### FR-7.1: Tool Registration

The system shall register all tools with the MCP server with:

- Unique tool names
- Descriptive tool descriptions
- Zod schemas for input validation

#### FR-7.2: Response Format

All tools shall return responses in MCP-compliant format:

- Content array with text elements
- Error flag for failed operations
- JSON-formatted data payloads

#### FR-7.3: Transport

The system shall communicate via stdio transport for compatibility with MCP clients.

## Non-Functional Requirements

### NFR-1: Performance

#### NFR-1.1: Response Time

- Tool invocations shall complete within 5 seconds under normal conditions
- Authentication shall complete within 3 seconds
- Token refresh shall not add more than 3 seconds to request latency

#### NFR-1.2: Throughput

- The system shall handle sequential tool invocations without degradation
- Token caching shall eliminate redundant authentication requests

### NFR-2: Reliability

#### NFR-2.1: Error Handling

- All tool invocations shall include try/catch error handling
- All errors shall be logged to stderr
- Client-facing errors shall include operation context

#### NFR-2.2: Graceful Degradation

- Authentication failures shall not crash the server
- API errors shall be returned to client with error flag
- Network failures shall produce descriptive error messages

### NFR-3: Security

#### NFR-3.1: Credential Protection

- Credentials shall be loaded from environment variables
- Credentials shall never be logged or included in error messages
- Example configuration files shall not contain real credentials

#### NFR-3.2: Token Security

- JWT tokens shall be stored in memory only
- Tokens shall not be persisted to disk
- Tokens shall not be exposed in API responses

#### NFR-3.3: API Access Control

- All API requests shall use the authenticated user's permissions
- API scope shall be limited to the configured application ID
- No privilege escalation beyond authenticated user capabilities

### NFR-4: Maintainability

#### NFR-4.1: Code Quality

- All code shall use TypeScript strict mode
- All dependencies shall have fixed major versions
- Code shall follow consistent naming conventions

#### NFR-4.2: Modularity

- Tools shall be organized in separate modules by domain
- Client logic shall be isolated from tool implementations
- Type definitions shall be centralized

#### NFR-4.3: Documentation

- All public APIs shall include JSDoc comments
- Configuration requirements shall be documented
- Architecture decisions shall be recorded

### NFR-5: Usability

#### NFR-5.1: Configuration

- Configuration shall use standard .env files
- Required vs. optional settings shall be clearly documented
- Invalid configuration shall produce clear error messages

#### NFR-5.2: Setup

- Installation shall require only npm install
- Build process shall be single-step (npm run build)
- Startup shall validate all dependencies and configuration

### NFR-6: Compatibility

#### NFR-6.1: Runtime Environment

- The system shall run on Node.js 18+
- The system shall support macOS, Linux, and Windows
- The system shall use ES modules (not CommonJS)

#### NFR-6.2: TDX Compatibility

- The system shall work with TeamDynamix Web API v4.0+
- The system shall handle API schema variations gracefully
- The system shall support custom TDX instances

#### NFR-6.3: MCP Compatibility

- The system shall use MCP SDK version 1.12.1+
- The system shall follow MCP specification for stdio transport
- The system shall be compatible with Claude Desktop and other MCP clients

## Constraints

### Technical Constraints

- Must use Node.js runtime (TypeScript compiled to JavaScript)
- Must use stdio for MCP transport (no HTTP endpoints)
- Must authenticate to TDX on each server startup (no persistent sessions)

### Operational Constraints

- Requires network connectivity to TDX instance
- Requires valid TDX user account or service account
- Inherits rate limits from TDX API (if any)

### Security Constraints

- Cannot bypass TDX authentication mechanisms
- Cannot access data outside authenticated user's permissions
- Must protect credentials according to organizational policies

## Assumptions

1. TDX instance is accessible via HTTPS
2. TDX API endpoints follow standard TeamDynamix schema
3. JWT tokens remain valid for 24 hours as documented
4. MCP clients support stdio transport
5. Users have appropriate TDX permissions for requested operations
6. Network latency to TDX instance is reasonable (<1 second)

## Dependencies

### External Services

- **TeamDynamix Web API**: Core dependency for all operations
- **TDX Authentication Service**: Required for token issuance

### NPM Packages

- **@modelcontextprotocol/sdk**: MCP protocol implementation (^1.12.1)
- **dotenv**: Environment configuration (^16.4.7)
- **zod**: Schema validation (^3.24.2)

### Development Dependencies

- **TypeScript**: Language compiler (^5.7.3)
- **@types/node**: Node.js type definitions (^22.13.0)

## Success Criteria

### Launch Criteria

- [ ] All five core tools implemented and functional
- [ ] Both authentication methods tested and working
- [ ] Error handling covers common failure scenarios
- [ ] Documentation complete (README, design, requirements)
- [ ] Example configuration provided
- [ ] Successfully tested with Claude Desktop

### Acceptance Criteria by Feature

#### Authentication (FR-1)

- [ ] Successful authentication with username/password
- [ ] Successful authentication with BEID/key
- [ ] Token automatically refreshed after expiry
- [ ] Descriptive errors for invalid credentials

#### Ticket Search (FR-2)

- [ ] Search returns results within 5 seconds
- [ ] All filter parameters function correctly
- [ ] Results limited to specified maximum
- [ ] Empty searches return appropriate message

#### Ticket Details (FR-3)

- [ ] Full ticket data retrieved by ID
- [ ] Custom attributes included in response
- [ ] Attachments metadata present
- [ ] Nonexistent tickets return error

#### Ticket Feed (FR-4)

- [ ] All feed entries retrieved chronologically
- [ ] Private entries properly flagged
- [ ] Author information accurate

#### Ticket Forms (FR-5)

- [ ] All active forms listed
- [ ] Form details complete and accurate

#### Resource Search (FR-6)

- [ ] People and groups searchable
- [ ] Search results relevant to query
- [ ] Results limited to 5 entries

## Out of Scope (Version 1.0)

The following features are explicitly out of scope for the initial release:

- Ticket creation or modification
- Feed entry posting (commenting on tickets)
- Attachment upload/download
- Task management operations
- Asset/CI management
- Project management features
- Webhook/real-time notifications
- Batch operations
- Advanced custom attribute filtering
- TDX reporting capabilities
- Knowledge base article access
- Time tracking operations

These may be considered for future versions based on user feedback and requirements.
