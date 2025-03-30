#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ErrorCode, 
  McpError 
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';

// AnkiConnect API endpoint
const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';

/**
 * Invokes an AnkiConnect action
 * @param {string} action - The action to perform
 * @param {object} params - The parameters for the action
 * @param {number} version - The AnkiConnect API version (default: 6)
 * @returns {Promise<any>} - The result of the action
 */
async function invokeAnkiConnect(action, params = {}, version = 6) {
  try {
    const response = await fetch(ANKI_CONNECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        version,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.hasOwnProperty('error')) {
      throw new Error('Response is missing required error field');
    }
    
    if (!data.hasOwnProperty('result')) {
      throw new Error('Response is missing required result field');
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.result;
  } catch (error) {
    console.error(`AnkiConnect error: ${error.message}`);
    throw error;
  }
}

// Initialize the MCP server
const server = new Server(
  { 
    name: "anki-connect-server", 
    version: "0.1.0" 
  }, 
  { 
    capabilities: { 
      tools: {} 
    } 
  }
);

// Define the getDeckNames tool
const GET_DECK_NAMES_TOOL = {
  name: "getDeckNames",
  description: "Returns an array of all deck names for the current AnkiConnect user",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the createDeck tool
const CREATE_DECK_TOOL = {
  name: "createDeck",
  description: "Creates a new deck with the given name. Returns the deck ID.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "string",
        description: "The name of the deck to create"
      }
    },
    required: ["deck"]
  }
};

// Log when server is starting
console.error("Starting AnkiConnect MCP server...");

// Handle the ListTools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("ListTools request received");
  return {
    tools: [GET_DECK_NAMES_TOOL, CREATE_DECK_TOOL]
  };
});

// Handle the CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`CallTool request received: ${JSON.stringify(request.params)}`);
  
  try {
    if (request.params.name === "getDeckNames") {
      console.error("Processing getDeckNames tool");
      const deckNames = await invokeAnkiConnect("deckNames");
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(deckNames, null, 2)
          }
        ]
      };
    } else if (request.params.name === "createDeck") {
      console.error("Processing createDeck tool");
      
      if (!request.params.arguments?.deck) {
        throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
      }
      
      const deckName = request.params.arguments.deck;
      const deckId = await invokeAnkiConnect("createDeck", { deck: deckName });
      
      return {
        content: [
          {
            type: "text",
            text: `Deck created with ID: ${deckId}`
          }
        ]
      };
    }
    
    console.error(`Tool not found: ${request.params.name}`);
    throw new McpError(ErrorCode.ToolNotFound, `Tool not found: ${request.params.name}`);
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
