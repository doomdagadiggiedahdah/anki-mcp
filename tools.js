import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
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
export async function invokeAnkiConnect(action, params = {}, version = 6) {
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

// Define the getDeckNames tool
export const GET_DECK_NAMES_TOOL = {
  name: "getDeckNames",
  description: "Returns an array of all deck names for the current AnkiConnect user",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the createDeck tool
export const CREATE_DECK_TOOL = {
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

// Get all available tools
export const getTools = () => {
  return [GET_DECK_NAMES_TOOL, CREATE_DECK_TOOL];
};

// Handle the getDeckNames tool
export async function handleGetDeckNames() {
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
}

// Handle the createDeck tool
export async function handleCreateDeck(arguments_) {
  console.error("Processing createDeck tool");
  
  if (!arguments_?.deck) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  const deckName = arguments_.deck;
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

// Handle tool calls
export async function handleToolCall(toolName, arguments_) {
  if (toolName === "getDeckNames") {
    return await handleGetDeckNames();
  } else if (toolName === "createDeck") {
    return await handleCreateDeck(arguments_);
  }
  
  throw new McpError(ErrorCode.ToolNotFound, `Tool not found: ${toolName}`);
}
