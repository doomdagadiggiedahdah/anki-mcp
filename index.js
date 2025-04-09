#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  McpError 
} from "@modelcontextprotocol/sdk/types.js";
import { getTools, handleToolCall } from './tools.js';


// Initialize the MCP server
const server = new Server(
  { 
    name: "anki-connect-server", 
    version: "1.0.0" 
  }, 
  { 
    capabilities: { 
      tools: {} 
    } 
  }
);

// Log when server is starting
console.error("Starting AnkiConnect MCP server...");

// Handle the ListTools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getTools()
  };
});

// Handle the CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`CallTool request received: ${JSON.stringify(request.params)}`);

  try {
    return await handleToolCall(request.params.name, request.params.arguments);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    console.error(`Error processing tool: ${error.message}`);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Connect to the transport
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("AnkiConnect MCP server connected");
}).catch(err => {
  console.error("Error connecting MCP server:", err);
});
