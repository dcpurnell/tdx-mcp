import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TdxClient } from "../tdx-client.js";
import { FeedEntry } from "../types.js";

export function registerFeedTools(server: McpServer, client: TdxClient) {
  // --- get_ticket_feed ---
  server.tool(
    "get_ticket_feed",
    "Get the activity feed (comments, updates, status changes) for a TDX ticket.",
    {
      ticketId: z.number().describe("The ticket ID to get the feed for"),
    },
    async (args) => {
      try {
        const feed = await client.get<FeedEntry[]>(
          `/tickets/${args.ticketId}/feed`
        );

        if (!feed || feed.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No feed entries found for ticket ${args.ticketId}.`,
              },
            ],
          };
        }

        const summary = feed.map((entry) => ({
          id: entry.ID,
          date: entry.CreatedDate,
          author: entry.CreatedFullName,
          isPrivate: entry.IsPrivate,
          body: entry.Body,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: `Feed for ticket ${args.ticketId} (${feed.length} entries):\n\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error retrieving feed for ticket ${args.ticketId}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
