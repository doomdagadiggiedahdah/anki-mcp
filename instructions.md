# AnkiConnect MCP Implementation Workflow

This document outlines the workflow for implementing AnkiConnect actions as MCP tools. Follow these steps to systematically implement all AnkiConnect actions.

## Workflow Overview

1. Extract a batch of actions from the action list
2. Implement each action as an MCP tool
3. Test the implementations with actual Anki decks
4. Remove the implemented actions from the list
5. Repeat until all actions are implemented

## Detailed Steps

### 1. Extract Actions

Use the following command to extract the next batch of actions (e.g., 3 actions) from the `conv-ac.txt` file:

```bash
awk 'BEGIN{RS="<<ACTION_END>>"; ORS="\n<<ACTION_END>>\n"} NR>=1 && NR<=3 {print}' ./conv-ac.txt
```

This will display the first three actions from the file. You can adjust the range (`NR>=1 && NR<=3`) to extract different actions.

### 2. Implement Actions

For each action:

1. **Define the tool in `tools.js`**:
   ```javascript
   export const ACTION_NAME_TOOL = {
     name: "actionName",
     description: "Description of the action",
     inputSchema: {
       type: "object",
       properties: {
         // Define parameters based on the action's requirements
         param1: {
           type: "string",
           description: "Description of parameter 1"
         }
       },
       required: ["param1"] // List required parameters
     }
   };
   ```

2. **Add the tool to the `getTools()` function**:
   ```javascript
   export const getTools = () => {
     return [
       // Existing tools...
       ACTION_NAME_TOOL
     ];
   };
   ```

3. **Implement a handler function**:
   ```javascript
   export async function handleActionName(arguments_) {
     console.error("Processing actionName tool");
     
     // Validate parameters
     if (!arguments_?.param1) {
       throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: param1");
     }
     
     // Call AnkiConnect
     const result = await invokeAnkiConnect("actionName", { 
       param1: arguments_.param1 
     });
     
     // Return result
     return {
       content: [
         {
           type: "text",
           text: JSON.stringify(result, null, 2)
         }
       ]
     };
   }
   ```

4. **Add the handler to the `handleToolCall()` function**:
   ```javascript
   export async function handleToolCall(toolName, arguments_) {
     // Existing handlers...
     else if (toolName === "actionName") {
       return await handleActionName(arguments_);
     }
     
     throw new McpError(ErrorCode.ToolNotFound, `Tool not found: ${toolName}`);
   }
   ```

### 3. Delete Implemented Actions

After successful implementation and testing, remove the implemented actions from the `conv-ac.txt` file:

```bash
awk 'BEGIN{RS="<<ACTION_END>>"; ORS="\n<<ACTION_END>>\n"} NR>3 {print}' ./conv-ac.txt > ./conv-ac.txt.new && mv ./conv-ac.txt.new ./conv-ac.txt
```

This command will remove the first three actions and save the remaining actions back to the file.

### 4. Repeat

Go back to step 1 and extract the next batch of actions until all actions are implemented.

## Implementation Guidelines

- **Parameter Validation**: Always validate input parameters before calling AnkiConnect
- **Error Handling**: Handle errors appropriately and return meaningful error messages
- **Consistent Formatting**: Return results in a consistent format
- **Documentation**: Document any special considerations for each action
- **Testing**: Test each action thoroughly before marking it as complete

## Example Implementation

Here's an example of implementing the `getEaseFactors` action:

```javascript
// Define the tool
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

// Add to getTools()
export const getTools = () => {
  return [
    // ... existing tools
    GET_EASE_FACTORS_TOOL
  ];
};

// Implement handler
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

// Add to handleToolCall()
export async function handleToolCall(toolName, arguments_) {
  // ... existing tool handlers
  else if (toolName === "getEaseFactors") {
    return await handleGetEaseFactors(arguments_);
  }
}
```

By following this workflow, you can systematically implement all AnkiConnect actions as MCP tools, making them available to AI assistants through the Model Context Protocol.
