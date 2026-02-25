import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TdxClient } from "../tdx-client.js";
import { Ticket, TicketSearch, TicketForm, EligibleAssignment } from "../types.js";

export function registerTicketTools(server: McpServer, client: TdxClient) {
  // --- search_tickets ---
  server.tool(
    "search_tickets",
    "Search for TDX tickets with filters. Returns a list of matching tickets (limited fields).",
    {
      searchText: z
        .string()
        .optional()
        .describe("Free-text search across ticket fields"),
      statusIDs: z
        .array(z.number())
        .optional()
        .describe("Filter by status IDs"),
      priorityIDs: z
        .array(z.number())
        .optional()
        .describe("Filter by priority IDs"),
      requestorUids: z
        .array(z.string())
        .optional()
        .describe("Filter by requestor UIDs"),
      responsibilityUids: z
        .array(z.string())
        .optional()
        .describe("Filter by responsible person UIDs"),
      responsibilityGroupIDs: z
        .array(z.number())
        .optional()
        .describe("Filter by responsible group IDs"),
      createdDateFrom: z
        .string()
        .optional()
        .describe("Filter tickets created on or after this date (YYYY-MM-DD)"),
      createdDateTo: z
        .string()
        .optional()
        .describe("Filter tickets created on or before this date (YYYY-MM-DD)"),
      modifiedDateFrom: z
        .string()
        .optional()
        .describe("Filter tickets modified on or after this date (YYYY-MM-DD)"),
      modifiedDateTo: z
        .string()
        .optional()
        .describe("Filter tickets modified on or before this date (YYYY-MM-DD)"),
      maxResults: z
        .number()
        .optional()
        .default(25)
        .describe("Maximum number of results to return (default 25)"),
    },
    async (args) => {
      try {
        const searchBody: TicketSearch = {
          MaxResults: args.maxResults,
        };

        if (args.searchText) searchBody.SearchText = args.searchText;
        if (args.statusIDs) searchBody.StatusIDs = args.statusIDs;
        if (args.priorityIDs) searchBody.PriorityIDs = args.priorityIDs;
        if (args.requestorUids) searchBody.RequestorUids = args.requestorUids;
        if (args.responsibilityUids) searchBody.ResponsibilityUids = args.responsibilityUids;
        if (args.responsibilityGroupIDs) searchBody.ResponsibilityGroupIDs = args.responsibilityGroupIDs;
        if (args.createdDateFrom) searchBody.CreatedDateFrom = args.createdDateFrom;
        if (args.createdDateTo) searchBody.CreatedDateTo = args.createdDateTo;
        if (args.modifiedDateFrom) searchBody.ModifiedDateFrom = args.modifiedDateFrom;
        if (args.modifiedDateTo) searchBody.ModifiedDateTo = args.modifiedDateTo;

        const tickets = await client.post<Ticket[]>("/tickets/search", searchBody);

        if (!tickets || tickets.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No tickets found matching the search criteria." }],
          };
        }

        const summary = tickets.map((t) => ({
          id: t.ID,
          title: t.Title,
          status: t.StatusName,
          priority: t.PriorityName,
          requestor: t.RequestorName,
          responsible: t.ResponsibleFullName,
          responsibleGroup: t.ResponsibleGroupName,
          created: t.CreatedDate,
          modified: t.ModifiedDate,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: `Found ${tickets.length} ticket(s):\n\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error searching tickets: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // --- get_ticket ---
  server.tool(
    "get_ticket",
    "Get full details of a specific TDX ticket by ID.",
    {
      ticketId: z.number().describe("The ticket ID to retrieve"),
    },
    async (args) => {
      try {
        const ticket = await client.get<Ticket>(`/tickets/${args.ticketId}`);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(ticket, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error retrieving ticket ${args.ticketId}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // --- get_ticket_forms ---
  server.tool(
    "get_ticket_forms",
    "List all active ticket forms for the TDX ticketing application.",
    {},
    async () => {
      try {
        const forms = await client.get<TicketForm[]>("/tickets/forms");

        if (!forms || forms.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No active ticket forms found." }],
          };
        }

        const summary = forms.map((f) => ({
          id: f.ID,
          name: f.Name,
          description: f.Description,
          isActive: f.IsActive,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: `Found ${forms.length} form(s):\n\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error retrieving ticket forms: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // --- get_ticket_resources ---
  server.tool(
    "get_ticket_resources",
    "Search for eligible ticket assignment resources (people/groups).",
    {
      searchText: z
        .string()
        .optional()
        .default("")
        .describe("Search text to filter resources (max 5 results returned)"),
    },
    async (args) => {
      try {
        const query = args.searchText ? `?searchText=${encodeURIComponent(args.searchText)}` : "";
        const resources = await client.get<EligibleAssignment[]>(
          `/tickets/resources${query}`
        );

        if (!resources || resources.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No matching resources found." }],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: `Found ${resources.length} resource(s):\n\n${JSON.stringify(resources, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error retrieving resources: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
