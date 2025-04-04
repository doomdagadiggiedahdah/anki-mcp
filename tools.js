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

// Define the getEaseFactors tool
export const GET_EASE_FACTORS_TOOL = {
  name: "getEaseFactors",
  description: "Returns an array with the ease factor for each of the given cards (in the same order).",
  inputSchema: {
    type: "object",
    properties: {
      cards: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of card IDs"
      }
    },
    required: ["cards"]
  }
};

// Define the setEaseFactors tool
export const SET_EASE_FACTORS_TOOL = {
  name: "setEaseFactors",
  description: "Sets ease factor of cards by card ID; returns true if successful (all cards existed) or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      cards: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of card IDs"
      },
      easeFactors: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of ease factors (should match the length of cards array)"
      }
    },
    required: ["cards", "easeFactors"]
  }
};

// Define the setSpecificValueOfCard tool
export const SET_SPECIFIC_VALUE_OF_CARD_TOOL = {
  name: "setSpecificValueOfCard",
  description: "Sets specific value of a single card. Given the risk of wreaking havoc in the database when changing some of the values of a card, some of the keys require the argument 'warning_check' set to True.",
  inputSchema: {
    type: "object",
    properties: {
      card: {
        type: "number",
        description: "Card ID"
      },
      key: {
        type: "string",
        description: "The name of the property to set"
      },
      value: {
        type: "string",
        description: "The value to set for the property"
      },
      warning_check: {
        type: "boolean",
        description: "Set to true to confirm potentially dangerous operations"
      }
    },
    required: ["card", "key", "value"]
  }
};

// Get all available tools
export const getTools = () => {
  return [
    GET_DECK_NAMES_TOOL, 
    CREATE_DECK_TOOL,
    GET_EASE_FACTORS_TOOL,
    SET_EASE_FACTORS_TOOL,
    SET_SPECIFIC_VALUE_OF_CARD_TOOL
  ];
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

// Handle the getEaseFactors tool
export async function handleGetEaseFactors(arguments_) {
  console.error("Processing getEaseFactors tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const easeFactors = await invokeAnkiConnect("getEaseFactors", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(easeFactors, null, 2)
      }
    ]
  };
}

// Handle the setEaseFactors tool
export async function handleSetEaseFactors(arguments_) {
  console.error("Processing setEaseFactors tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  if (!arguments_?.easeFactors || !Array.isArray(arguments_.easeFactors)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: easeFactors (array of ease factors)");
  }
  
  if (arguments_.cards.length !== arguments_.easeFactors.length) {
    throw new McpError(ErrorCode.InvalidParams, "Cards and easeFactors arrays must have the same length");
  }
  
  const result = await invokeAnkiConnect("setEaseFactors", { 
    cards: arguments_.cards,
    easeFactors: arguments_.easeFactors
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set ease factors: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the setSpecificValueOfCard tool
export async function handleSetSpecificValueOfCard(arguments_) {
  console.error("Processing setSpecificValueOfCard tool");
  
  if (!arguments_?.card || typeof arguments_.card !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: card (card ID)");
  }
  
  if (!arguments_?.key || typeof arguments_.key !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: key (property name)");
  }
  
  if (arguments_.value === undefined) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: value (property value)");
  }
  
  const params = {
    card: arguments_.card,
    key: arguments_.key,
    value: arguments_.value
  };
  
  if (arguments_.warning_check !== undefined) {
    params.warning_check = arguments_.warning_check;
  }
  
  const result = await invokeAnkiConnect("setSpecificValueOfCard", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Set specific value of card: ${result ? "Success" : "Failed"}`
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
  } else if (toolName === "getEaseFactors") {
    return await handleGetEaseFactors(arguments_);
  } else if (toolName === "setEaseFactors") {
    return await handleSetEaseFactors(arguments_);
  } else if (toolName === "setSpecificValueOfCard") {
    return await handleSetSpecificValueOfCard(arguments_);
  }
  
  throw new McpError(ErrorCode.ToolNotFound, `Tool not found: ${toolName}`);
}
