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
        params,
        version
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

// Handle the replaceTags tool
export async function handleReplaceTags(arguments_) {
  console.error("Processing replaceTags tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  if (!arguments_?.tag_to_replace || typeof arguments_.tag_to_replace !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: tag_to_replace");
  }
  
  if (!arguments_?.replace_with_tag || typeof arguments_.replace_with_tag !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: replace_with_tag");
  }
  
  const result = await invokeAnkiConnect("replaceTags", { 
    notes: arguments_.notes,
    tag_to_replace: arguments_.tag_to_replace,
    replace_with_tag: arguments_.replace_with_tag
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Replace tags: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the replaceTagsInAllNotes tool
export async function handleReplaceTagsInAllNotes(arguments_) {
  console.error("Processing replaceTagsInAllNotes tool");
  
  if (!arguments_?.tag_to_replace || typeof arguments_.tag_to_replace !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: tag_to_replace");
  }
  
  if (!arguments_?.replace_with_tag || typeof arguments_.replace_with_tag !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: replace_with_tag");
  }
  
  const result = await invokeAnkiConnect("replaceTagsInAllNotes", { 
    tag_to_replace: arguments_.tag_to_replace,
    replace_with_tag: arguments_.replace_with_tag
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Replace tags in all notes: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Define the replaceTags tool
export const REPLACE_TAGS_TOOL = {
  name: "replaceTags",
  description: "Replace tags in notes by note ID.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      },
      tag_to_replace: {
        type: "string",
        description: "Tag to replace"
      },
      replace_with_tag: {
        type: "string",
        description: "Tag to replace with"
      }
    },
    required: ["notes", "tag_to_replace", "replace_with_tag"]
  }
};

// Define the replaceTagsInAllNotes tool
export const REPLACE_TAGS_IN_ALL_NOTES_TOOL = {
  name: "replaceTagsInAllNotes",
  description: "Replace tags in all the notes for the current user.",
  inputSchema: {
    type: "object",
    properties: {
      tag_to_replace: {
        type: "string",
        description: "Tag to replace"
      },
      replace_with_tag: {
        type: "string",
        description: "Tag to replace with"
      }
    },
    required: ["tag_to_replace", "replace_with_tag"]
  }
};// Handle the requestPermission tool
export async function handleRequestPermission() {
  console.error("Processing requestPermission tool");
  
  const result = await invokeAnkiConnect("requestPermission");
  
  return {
    content: [
      {
        type: "text",
        text: `Request permission: ${result ? "Granted" : "Denied"}`
      }
    ]
  };
}

// Handle the apiReflect tool
export async function handleApiReflect(arguments_) {
  console.error("Processing apiReflect tool");
  
  const params = {};
  
  if (arguments_?.scopes) {
    params.scopes = arguments_.scopes;
  }
  
  if (arguments_?.actions) {
    params.actions = arguments_.actions;
  }
  
  const reflection = await invokeAnkiConnect("apiReflect", params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(reflection, null, 2)
      }
    ]
  };
}

// Handle the getProfiles tool
export async function handleGetProfiles() {
  console.error("Processing getProfiles tool");
  
  const profiles = await invokeAnkiConnect("getProfiles");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(profiles, null, 2)
      }
    ]
  };
}

// Handle the getActiveProfile tool
export async function handleGetActiveProfile() {
  console.error("Processing getActiveProfile tool");
  
  const profile = await invokeAnkiConnect("getActiveProfile");
  
  return {
    content: [
      {
        type: "text",
        text: `Active profile: ${profile}`
      }
    ]
  };
}

// Handle the loadProfile tool
export async function handleLoadProfile(arguments_) {
  console.error("Processing loadProfile tool");
  
  if (!arguments_?.name || typeof arguments_.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: name (profile name)");
  }
  
  const result = await invokeAnkiConnect("loadProfile", { name: arguments_.name });
  
  return {
    content: [
      {
        type: "text",
        text: `Load profile: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the multi tool
export async function handleMulti(arguments_) {
  console.error("Processing multi tool");
  
  if (!arguments_?.actions || !Array.isArray(arguments_.actions)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: actions (array of actions)");
  }
  
  const results = await invokeAnkiConnect("multi", { actions: arguments_.actions });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Handle the reloadCollection tool
export async function handleReloadCollection() {
  console.error("Processing reloadCollection tool");
  
  const result = await invokeAnkiConnect("reloadCollection");
  
  return {
    content: [
      {
        type: "text",
        text: `Reload collection: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}// Handle the guiSelectCard tool
export async function handleGuiSelectCard(arguments_) {
  console.error("Processing guiSelectCard tool");
  
  if (!arguments_?.card || typeof arguments_.card !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: card (card ID)");
  }
  
  const result = await invokeAnkiConnect("guiSelectCard", { card: arguments_.card });
  
  return {
    content: [
      {
        type: "text",
        text: `Select card in browser: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiSelectedNotes tool
export async function handleGuiSelectedNotes() {
  console.error("Processing guiSelectedNotes tool");
  
  const notes = await invokeAnkiConnect("guiSelectedNotes");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(notes, null, 2)
      }
    ]
  };
}

// Handle the guiEditNote tool
export async function handleGuiEditNote(arguments_) {
  console.error("Processing guiEditNote tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note (note ID)");
  }
  
  const result = await invokeAnkiConnect("guiEditNote", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: `Edit note: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiUndo tool
export async function handleGuiUndo() {
  console.error("Processing guiUndo tool");
  
  const result = await invokeAnkiConnect("guiUndo");
  
  return {
    content: [
      {
        type: "text",
        text: `Undo: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiImportFile tool
export async function handleGuiImportFile(arguments_) {
  console.error("Processing guiImportFile tool");
  
  const params = {};
  
  if (arguments_?.path) {
    params.path = arguments_.path;
  }
  
  const result = await invokeAnkiConnect("guiImportFile", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Import file: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiExitAnki tool
export async function handleGuiExitAnki() {
  console.error("Processing guiExitAnki tool");
  
  const result = await invokeAnkiConnect("guiExitAnki");
  
  return {
    content: [
      {
        type: "text",
        text: `Exit Anki: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiCheckDatabase tool
export async function handleGuiCheckDatabase() {
  console.error("Processing guiCheckDatabase tool");
  
  const result = await invokeAnkiConnect("guiCheckDatabase");
  
  return {
    content: [
      {
        type: "text",
        text: `Check database: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the getReviewsOfCards tool
export async function handleGetReviewsOfCards(arguments_) {
  console.error("Processing getReviewsOfCards tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const reviews = await invokeAnkiConnect("getReviewsOfCards", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(reviews, null, 2)
      }
    ]
  };
}

// Handle the getLatestReviewID tool
export async function handleGetLatestReviewID(arguments_) {
  console.error("Processing getLatestReviewID tool");
  
  if (!arguments_?.deck || typeof arguments_.deck !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  const reviewId = await invokeAnkiConnect("getLatestReviewID", { deck: arguments_.deck });
  
  return {
    content: [
      {
        type: "text",
        text: `Latest review ID: ${reviewId}`
      }
    ]
  };
}

// Handle the insertReviews tool
export async function handleInsertReviews(arguments_) {
  console.error("Processing insertReviews tool");
  
  if (!arguments_?.reviews || !Array.isArray(arguments_.reviews)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: reviews (array of review tuples)");
  }
  
  // Validate the review tuples
  for (const review of arguments_.reviews) {
    if (!Array.isArray(review) || review.length !== 9) {
      throw new McpError(ErrorCode.InvalidParams, "Each review must be a tuple with 9 values");
    }
  }
  
  const result = await invokeAnkiConnect("insertReviews", { reviews: arguments_.reviews });
  
  return {
    content: [
      {
        type: "text",
        text: `Insert reviews: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the cloneDeckConfigId tool
export async function handleCloneDeckConfigId(arguments_) {
  console.error("Processing cloneDeckConfigId tool");
  
  if (!arguments_?.name || typeof arguments_.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: name");
  }
  
  if (!arguments_?.cloneFrom || typeof arguments_.cloneFrom !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cloneFrom");
  }
  
  const configId = await invokeAnkiConnect("cloneDeckConfigId", { 
    name: arguments_.name,
    cloneFrom: arguments_.cloneFrom
  });
  
  return {
    content: [
      {
        type: "text",
        text: `New configuration group ID: ${configId}`
      }
    ]
  };
}

// Handle the removeDeckConfigId tool
export async function handleRemoveDeckConfigId(arguments_) {
  console.error("Processing removeDeckConfigId tool");
  
  if (!arguments_?.configId || typeof arguments_.configId !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: configId");
  }
  
  const result = await invokeAnkiConnect("removeDeckConfigId", { configId: arguments_.configId });
  
  return {
    content: [
      {
        type: "text",
        text: `Remove deck config ID: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the canAddNotes tool
export async function handleCanAddNotes(arguments_) {
  console.error("Processing canAddNotes tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note data)");
  }
  
  const results = await invokeAnkiConnect("canAddNotes", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Handle the canAddNotesWithErrorDetail tool
export async function handleCanAddNotesWithErrorDetail(arguments_) {
  console.error("Processing canAddNotesWithErrorDetail tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note data)");
  }
  
  const results = await invokeAnkiConnect("canAddNotesWithErrorDetail", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Handle the updateNoteModel tool
export async function handleUpdateNoteModel(arguments_) {
  console.error("Processing updateNoteModel tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note");
  }
  
  if (!arguments_.note.id || typeof arguments_.note.id !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.id");
  }
  
  if (!arguments_.note.modelName || typeof arguments_.note.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.modelName");
  }
  
  if (!arguments_.note.fields || typeof arguments_.note.fields !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.fields");
  }
  
  const result = await invokeAnkiConnect("updateNoteModel", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: `Update note model: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the notesModTime tool
export async function handleNotesModTime(arguments_) {
  console.error("Processing notesModTime tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  const modTimes = await invokeAnkiConnect("notesModTime", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(modTimes, null, 2)
      }
    ]
  };
}

// Handle the removeEmptyNotes tool
export async function handleRemoveEmptyNotes() {
  console.error("Processing removeEmptyNotes tool");
  
  const result = await invokeAnkiConnect("removeEmptyNotes");
  
  return {
    content: [
      {
        type: "text",
        text: `Remove empty notes: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldRename tool
export async function handleModelFieldRename(arguments_) {
  console.error("Processing modelFieldRename tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.oldFieldName || typeof arguments_.oldFieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: oldFieldName");
  }
  
  if (!arguments_?.newFieldName || typeof arguments_.newFieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: newFieldName");
  }
  
  const result = await invokeAnkiConnect("modelFieldRename", { 
    modelName: arguments_.modelName,
    oldFieldName: arguments_.oldFieldName,
    newFieldName: arguments_.newFieldName
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Rename model field: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldReposition tool
export async function handleModelFieldReposition(arguments_) {
  console.error("Processing modelFieldReposition tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  if (arguments_?.index === undefined || typeof arguments_.index !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: index");
  }
  
  const result = await invokeAnkiConnect("modelFieldReposition", { 
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName,
    index: arguments_.index
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Reposition model field: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldAdd tool
export async function handleModelFieldAdd(arguments_) {
  console.error("Processing modelFieldAdd tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  const params = {
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName
  };
  
  if (arguments_?.index !== undefined) {
    params.index = arguments_.index;
  }
  
  const result = await invokeAnkiConnect("modelFieldAdd", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Add model field: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldRemove tool
export async function handleModelFieldRemove(arguments_) {
  console.error("Processing modelFieldRemove tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  const result = await invokeAnkiConnect("modelFieldRemove", { 
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Remove model field: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldSetFont tool
export async function handleModelFieldSetFont(arguments_) {
  console.error("Processing modelFieldSetFont tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  if (!arguments_?.font || typeof arguments_.font !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: font");
  }
  
  const result = await invokeAnkiConnect("modelFieldSetFont", { 
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName,
    font: arguments_.font
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set model field font: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldSetFontSize tool
export async function handleModelFieldSetFontSize(arguments_) {
  console.error("Processing modelFieldSetFontSize tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  if (arguments_?.fontSize === undefined || typeof arguments_.fontSize !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fontSize");
  }
  
  const result = await invokeAnkiConnect("modelFieldSetFontSize", { 
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName,
    fontSize: arguments_.fontSize
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set model field font size: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelFieldSetDescription tool
export async function handleModelFieldSetDescription(arguments_) {
  console.error("Processing modelFieldSetDescription tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.fieldName || typeof arguments_.fieldName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: fieldName");
  }
  
  if (!arguments_?.description || typeof arguments_.description !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: description");
  }
  
  const result = await invokeAnkiConnect("modelFieldSetDescription", { 
    modelName: arguments_.modelName,
    fieldName: arguments_.fieldName,
    description: arguments_.description
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set model field description: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}// Handle the findModelsById tool
export async function handleFindModelsById(arguments_) {
  console.error("Processing findModelsById tool");
  
  if (!arguments_?.modelIds || !Array.isArray(arguments_.modelIds)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelIds (array of model IDs)");
  }
  
  const models = await invokeAnkiConnect("findModelsById", { modelIds: arguments_.modelIds });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(models, null, 2)
      }
    ]
  };
}

// Handle the findModelsByName tool
export async function handleFindModelsByName(arguments_) {
  console.error("Processing findModelsByName tool");
  
  if (!arguments_?.modelNames || !Array.isArray(arguments_.modelNames)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelNames (array of model names)");
  }
  
  const models = await invokeAnkiConnect("findModelsByName", { modelNames: arguments_.modelNames });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(models, null, 2)
      }
    ]
  };
}

// Handle the modelFieldDescriptions tool
export async function handleModelFieldDescriptions(arguments_) {
  console.error("Processing modelFieldDescriptions tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const descriptions = await invokeAnkiConnect("modelFieldDescriptions", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(descriptions, null, 2)
      }
    ]
  };
}

// Handle the modelFieldFonts tool
export async function handleModelFieldFonts(arguments_) {
  console.error("Processing modelFieldFonts tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const fonts = await invokeAnkiConnect("modelFieldFonts", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(fonts, null, 2)
      }
    ]
  };
}

// Handle the findAndReplaceInModels tool
export async function handleFindAndReplaceInModels(arguments_) {
  console.error("Processing findAndReplaceInModels tool");
  
  if (!arguments_?.model || typeof arguments_.model !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model");
  }
  
  if (!arguments_.model.modelName || typeof arguments_.model.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.modelName");
  }
  
  if (!arguments_.model.findText || typeof arguments_.model.findText !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.findText");
  }
  
  if (!arguments_.model.replaceText || typeof arguments_.model.replaceText !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.replaceText");
  }
  
  const result = await invokeAnkiConnect("findAndReplaceInModels", { model: arguments_.model });
  
  return {
    content: [
      {
        type: "text",
        text: `Find and replace in models: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelTemplateRename tool
export async function handleModelTemplateRename(arguments_) {
  console.error("Processing modelTemplateRename tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.oldTemplateName || typeof arguments_.oldTemplateName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: oldTemplateName");
  }
  
  if (!arguments_?.newTemplateName || typeof arguments_.newTemplateName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: newTemplateName");
  }
  
  const result = await invokeAnkiConnect("modelTemplateRename", { 
    modelName: arguments_.modelName,
    oldTemplateName: arguments_.oldTemplateName,
    newTemplateName: arguments_.newTemplateName
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Rename model template: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelTemplateReposition tool
export async function handleModelTemplateReposition(arguments_) {
  console.error("Processing modelTemplateReposition tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.templateName || typeof arguments_.templateName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: templateName");
  }
  
  if (arguments_?.index === undefined || typeof arguments_.index !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: index");
  }
  
  const result = await invokeAnkiConnect("modelTemplateReposition", { 
    modelName: arguments_.modelName,
    templateName: arguments_.templateName,
    index: arguments_.index
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Reposition model template: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelTemplateAdd tool
export async function handleModelTemplateAdd(arguments_) {
  console.error("Processing modelTemplateAdd tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.template || typeof arguments_.template !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: template");
  }
  
  const result = await invokeAnkiConnect("modelTemplateAdd", { 
    modelName: arguments_.modelName,
    template: arguments_.template
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Add model template: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the modelTemplateRemove tool
export async function handleModelTemplateRemove(arguments_) {
  console.error("Processing modelTemplateRemove tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.templateName || typeof arguments_.templateName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: templateName");
  }
  
  const result = await invokeAnkiConnect("modelTemplateRemove", { 
    modelName: arguments_.modelName,
    templateName: arguments_.templateName
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Remove model template: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

//=============================================
// SYSTEM OPERATIONS
//=============================================

// Define the requestPermission tool
export const REQUEST_PERMISSION_TOOL = {
  name: "requestPermission",
  description: "Requests permission to use the API exposed by this plugin.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the apiReflect tool
export const API_REFLECT_TOOL = {
  name: "apiReflect",
  description: "Gets information about the AnkiConnect APIs available.",
  inputSchema: {
    type: "object",
    properties: {
      scopes: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of scopes to reflect on"
      },
      actions: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of actions to reflect on"
      }
    }
  }
};

// Define the getProfiles tool
export const GET_PROFILES_TOOL = {
  name: "getProfiles",
  description: "Retrieve the list of profiles.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the getActiveProfile tool
export const GET_ACTIVE_PROFILE_TOOL = {
  name: "getActiveProfile",
  description: "Retrieve the active profile.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the loadProfile tool
export const LOAD_PROFILE_TOOL = {
  name: "loadProfile",
  description: "Selects the profile specified in request.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Profile name"
      }
    },
    required: ["name"]
  }
};

// Define the multi tool
export const MULTI_TOOL = {
  name: "multi",
  description: "Performs multiple actions in one request, returning an array with the response of each action.",
  inputSchema: {
    type: "object",
    properties: {
      actions: {
        type: "array",
        items: {
          type: "object"
        },
        description: "Array of actions to perform"
      }
    },
    required: ["actions"]
  }
};

// Define the reloadCollection tool
export const RELOAD_COLLECTION_TOOL = {
  name: "reloadCollection",
  description: "Tells anki to reload all data from the database.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

//=============================================
// REMAINING GUI OPERATIONS
//=============================================

// Define the guiSelectCard tool
export const GUI_SELECT_CARD_TOOL = {
  name: "guiSelectCard",
  description: "Finds the open instance of the Card Browser dialog and selects a card given a card identifier.",
  inputSchema: {
    type: "object",
    properties: {
      card: {
        type: "number",
        description: "Card ID"
      }
    },
    required: ["card"]
  }
};

// Define the guiSelectedNotes tool
export const GUI_SELECTED_NOTES_TOOL = {
  name: "guiSelectedNotes",
  description: "Finds the open instance of the Card Browser dialog and returns an array of identifiers of the notes that are selected.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiEditNote tool
export const GUI_EDIT_NOTE_TOOL = {
  name: "guiEditNote",
  description: "Opens the Edit dialog with a note corresponding to given note ID.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "number",
        description: "Note ID"
      }
    },
    required: ["note"]
  }
};

// Define the guiUndo tool
export const GUI_UNDO_TOOL = {
  name: "guiUndo",
  description: "Undo the last action / card; returns true if succeeded or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiImportFile tool
export const GUI_IMPORT_FILE_TOOL = {
  name: "guiImportFile",
  description: "Invokes the Import dialog with an optional file path.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the file to import"
      }
    }
  }
};

// Define the guiExitAnki tool
export const GUI_EXIT_ANKI_TOOL = {
  name: "guiExitAnki",
  description: "Schedules a request to gracefully close Anki.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiCheckDatabase tool
export const GUI_CHECK_DATABASE_TOOL = {
  name: "guiCheckDatabase",
  description: "Requests a database check, but returns immediately without waiting for the check to complete.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

//=============================================
// REVIEWS OPERATIONS
//=============================================

// Define the getReviewsOfCards tool
export const GET_REVIEWS_OF_CARDS_TOOL = {
  name: "getReviewsOfCards",
  description: "Requests all card reviews for each card ID.",
  inputSchema: {
    type: "object",
    properties: {
      cards: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of card IDs"
      }
    },
    required: ["cards"]
  }
};

// Define the getLatestReviewID tool
export const GET_LATEST_REVIEW_ID_TOOL = {
  name: "getLatestReviewID",
  description: "Returns the unix time of the latest review for the given deck. 0 if no review has ever been made for the deck.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "string",
        description: "Deck name"
      }
    },
    required: ["deck"]
  }
};

// Define the insertReviews tool
export const INSERT_REVIEWS_TOOL = {
  name: "insertReviews",
  description: "Inserts the given reviews into the database.",
  inputSchema: {
    type: "object",
    properties: {
      reviews: {
        type: "array",
        items: {
          type: "array",
          items: {
            type: "number"
          },
          minItems: 9,
          maxItems: 9
        },
        description: "Array of review tuples (each tuple contains 9 values)"
      }
    },
    required: ["reviews"]
  }
};

//=============================================
// DECK CONFIG OPERATIONS
//=============================================

// Define the cloneDeckConfigId tool
export const CLONE_DECK_CONFIG_ID_TOOL = {
  name: "cloneDeckConfigId",
  description: "Creates a new configuration group with the given name, cloning from the group with the given ID.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name for the new configuration group"
      },
      cloneFrom: {
        type: "number",
        description: "ID of the configuration group to clone from"
      }
    },
    required: ["name", "cloneFrom"]
  }
};

// Define the removeDeckConfigId tool
export const REMOVE_DECK_CONFIG_ID_TOOL = {
  name: "removeDeckConfigId",
  description: "Removes the configuration group with the given ID.",
  inputSchema: {
    type: "object",
    properties: {
      configId: {
        type: "number",
        description: "ID of the configuration group to remove"
      }
    },
    required: ["configId"]
  }
};

//=============================================
// NOTE VALIDATION OPERATIONS
//=============================================

// Define the canAddNotes tool
export const CAN_ADD_NOTES_TOOL = {
  name: "canAddNotes",
  description: "Accepts an array of objects which define parameters for candidate notes and returns an array of booleans indicating whether the notes can be added.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            deckName: {
              type: "string",
              description: "The name of the deck"
            },
            modelName: {
              type: "string",
              description: "The name of the model"
            },
            fields: {
              type: "object",
              description: "Fields for the note (depends on model)"
            },
            tags: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Tags for the note"
            }
          },
          required: ["deckName", "modelName", "fields"]
        },
        description: "Array of candidate notes"
      }
    },
    required: ["notes"]
  }
};

// Define the canAddNotesWithErrorDetail tool
export const CAN_ADD_NOTES_WITH_ERROR_DETAIL_TOOL = {
  name: "canAddNotesWithErrorDetail",
  description: "Similar to canAddNotes but provides error details if notes cannot be added.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            deckName: {
              type: "string",
              description: "The name of the deck"
            },
            modelName: {
              type: "string",
              description: "The name of the model"
            },
            fields: {
              type: "object",
              description: "Fields for the note (depends on model)"
            },
            tags: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Tags for the note"
            }
          },
          required: ["deckName", "modelName", "fields"]
        },
        description: "Array of candidate notes"
      }
    },
    required: ["notes"]
  }
};

// Define the updateNoteModel tool
export const UPDATE_NOTE_MODEL_TOOL = {
  name: "updateNoteModel",
  description: "Update the model, fields, and tags of an existing note.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "Note ID"
          },
          modelName: {
            type: "string",
            description: "The name of the model"
          },
          fields: {
            type: "object",
            description: "Fields to update"
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Tags to set (replacing existing tags)"
          }
        },
        required: ["id", "modelName", "fields"]
      }
    },
    required: ["note"]
  }
};

// Define the notesModTime tool
export const NOTES_MOD_TIME_TOOL = {
  name: "notesModTime",
  description: "Returns a list of objects containing the modification time for each note ID.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      }
    },
    required: ["notes"]
  }
};

// Define the removeEmptyNotes tool
export const REMOVE_EMPTY_NOTES_TOOL = {
  name: "removeEmptyNotes",
  description: "Removes all the empty notes for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the modelFieldRename tool
export const MODEL_FIELD_RENAME_TOOL = {
  name: "modelFieldRename",
  description: "Rename the field name of a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      oldFieldName: {
        type: "string",
        description: "Old field name"
      },
      newFieldName: {
        type: "string",
        description: "New field name"
      }
    },
    required: ["modelName", "oldFieldName", "newFieldName"]
  }
};

// Define the modelFieldReposition tool
export const MODEL_FIELD_REPOSITION_TOOL = {
  name: "modelFieldReposition",
  description: "Reposition the field within the field list of a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      },
      index: {
        type: "number",
        description: "New index position"
      }
    },
    required: ["modelName", "fieldName", "index"]
  }
};

// Define the modelFieldAdd tool
export const MODEL_FIELD_ADD_TOOL = {
  name: "modelFieldAdd",
  description: "Creates a new field within a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      },
      index: {
        type: "number",
        description: "Index position"
      }
    },
    required: ["modelName", "fieldName"]
  }
};

// Define the modelFieldRemove tool
export const MODEL_FIELD_REMOVE_TOOL = {
  name: "modelFieldRemove",
  description: "Deletes a field within a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      }
    },
    required: ["modelName", "fieldName"]
  }
};

// Define the modelFieldSetFont tool
export const MODEL_FIELD_SET_FONT_TOOL = {
  name: "modelFieldSetFont",
  description: "Sets the font for a field within a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      },
      font: {
        type: "string",
        description: "Font name"
      }
    },
    required: ["modelName", "fieldName", "font"]
  }
};

// Define the modelFieldSetFontSize tool
export const MODEL_FIELD_SET_FONT_SIZE_TOOL = {
  name: "modelFieldSetFontSize",
  description: "Sets the font size for a field within a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      },
      fontSize: {
        type: "number",
        description: "Font size"
      }
    },
    required: ["modelName", "fieldName", "fontSize"]
  }
};

// Define the modelFieldSetDescription tool
export const MODEL_FIELD_SET_DESCRIPTION_TOOL = {
  name: "modelFieldSetDescription",
  description: "Sets the description (the text seen in the gui editor when a field is empty) for a field within a given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      fieldName: {
        type: "string",
        description: "Field name"
      },
      description: {
        type: "string",
        description: "Field description"
      }
    },
    required: ["modelName", "fieldName", "description"]
  }
};

//=============================================
// MODEL FIELD OPERATIONS
//=============================================

// Define the findModelsById tool
export const FIND_MODELS_BY_ID_TOOL = {
  name: "findModelsById",
  description: "Gets a list of models for the provided model IDs from the current user.",
  inputSchema: {
    type: "object",
    properties: {
      modelIds: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of model IDs"
      }
    },
    required: ["modelIds"]
  }
};

// Define the findModelsByName tool
export const FIND_MODELS_BY_NAME_TOOL = {
  name: "findModelsByName",
  description: "Gets a list of models for the provided model names from the current user.",
  inputSchema: {
    type: "object",
    properties: {
      modelNames: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of model names"
      }
    },
    required: ["modelNames"]
  }
};

// Define the modelFieldDescriptions tool
export const MODEL_FIELD_DESCRIPTIONS_TOOL = {
  name: "modelFieldDescriptions",
  description: "Gets the complete list of field descriptions (the text seen in the gui editor when a field is empty) for the provided model name.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      }
    },
    required: ["modelName"]
  }
};

// Define the modelFieldFonts tool
export const MODEL_FIELD_FONTS_TOOL = {
  name: "modelFieldFonts",
  description: "Gets the complete list of fonts along with their font sizes.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      }
    },
    required: ["modelName"]
  }
};

// Define the findAndReplaceInModels tool
export const FIND_AND_REPLACE_IN_MODELS_TOOL = {
  name: "findAndReplaceInModels",
  description: "Find and replace string in existing model by model name. Customise to replace in front, back or css by setting to true/false.",
  inputSchema: {
    type: "object",
    properties: {
      model: {
        type: "object",
        properties: {
          modelName: {
            type: "string",
            description: "The name of the model"
          },
          findText: {
            type: "string",
            description: "Text to find"
          },
          replaceText: {
            type: "string",
            description: "Text to replace with"
          },
          front: {
            type: "boolean",
            description: "Whether to replace in front template"
          },
          back: {
            type: "boolean",
            description: "Whether to replace in back template"
          },
          css: {
            type: "boolean",
            description: "Whether to replace in CSS"
          }
        },
        required: ["modelName", "findText", "replaceText"]
      }
    },
    required: ["model"]
  }
};

// Define the modelTemplateRename tool
export const MODEL_TEMPLATE_RENAME_TOOL = {
  name: "modelTemplateRename",
  description: "Renames a template in an existing model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      oldTemplateName: {
        type: "string",
        description: "Old template name"
      },
      newTemplateName: {
        type: "string",
        description: "New template name"
      }
    },
    required: ["modelName", "oldTemplateName", "newTemplateName"]
  }
};

// Define the modelTemplateReposition tool
export const MODEL_TEMPLATE_REPOSITION_TOOL = {
  name: "modelTemplateReposition",
  description: "Repositions a template in an existing model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      templateName: {
        type: "string",
        description: "Template name"
      },
      index: {
        type: "number",
        description: "New index position"
      }
    },
    required: ["modelName", "templateName", "index"]
  }
};

// Define the modelTemplateAdd tool
export const MODEL_TEMPLATE_ADD_TOOL = {
  name: "modelTemplateAdd",
  description: "Adds a template to an existing model by name.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      template: {
        type: "object",
        properties: {
          Name: {
            type: "string",
            description: "Template name"
          },
          Front: {
            type: "string",
            description: "Front template HTML"
          },
          Back: {
            type: "string",
            description: "Back template HTML"
          }
        },
        required: ["Name", "Front", "Back"]
      }
    },
    required: ["modelName", "template"]
  }
};

// Define the modelTemplateRemove tool
export const MODEL_TEMPLATE_REMOVE_TOOL = {
  name: "modelTemplateRemove",
  description: "Removes a template from an existing model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      templateName: {
        type: "string",
        description: "Template name"
      }
    },
    required: ["modelName", "templateName"]
  }
};// Handle the getNumCardsReviewedToday tool
export async function handleGetNumCardsReviewedToday() {
  console.error("Processing getNumCardsReviewedToday tool");
  
  const count = await invokeAnkiConnect("getNumCardsReviewedToday");
  
  return {
    content: [
      {
        type: "text",
        text: `Cards reviewed today: ${count}`
      }
    ]
  };
}

// Handle the getNumCardsReviewedByDay tool
export async function handleGetNumCardsReviewedByDay() {
  console.error("Processing getNumCardsReviewedByDay tool");
  
  const reviews = await invokeAnkiConnect("getNumCardsReviewedByDay");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(reviews, null, 2)
      }
    ]
  };
}

// Handle the getCollectionStatsHTML tool
export async function handleGetCollectionStatsHTML(arguments_) {
  console.error("Processing getCollectionStatsHTML tool");
  
  const params = {};
  
  if (arguments_?.wholeCollection !== undefined) {
    params.wholeCollection = arguments_.wholeCollection;
  }
  
  const html = await invokeAnkiConnect("getCollectionStatsHTML", params);
  
  return {
    content: [
      {
        type: "text",
        text: html
      }
    ]
  };
}

// Handle the cardReviews tool
export async function handleCardReviews(arguments_) {
  console.error("Processing cardReviews tool");
  
  if (!arguments_?.deck || typeof arguments_.deck !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  if (!arguments_?.startID || typeof arguments_.startID !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: startID (unix timestamp in milliseconds)");
  }
  
  const reviews = await invokeAnkiConnect("cardReviews", { 
    deck: arguments_.deck,
    startID: arguments_.startID
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(reviews, null, 2)
      }
    ]
  };
}

//=============================================
// STATS & REVIEW HISTORY
//=============================================

// Define the getNumCardsReviewedToday tool
export const GET_NUM_CARDS_REVIEWED_TODAY_TOOL = {
  name: "getNumCardsReviewedToday",
  description: "Gets the count of cards that have been reviewed in the current day (with day start time as configured by user in anki)",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the getNumCardsReviewedByDay tool
export const GET_NUM_CARDS_REVIEWED_BY_DAY_TOOL = {
  name: "getNumCardsReviewedByDay",
  description: "Gets the number of cards reviewed as a list of pairs of (dateString, number)",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the getCollectionStatsHTML tool
export const GET_COLLECTION_STATS_HTML_TOOL = {
  name: "getCollectionStatsHTML",
  description: "Gets the collection statistics report",
  inputSchema: {
    type: "object",
    properties: {
      wholeCollection: {
        type: "boolean",
        description: "Whether to get stats for the whole collection or current deck"
      }
    }
  }
};

// Define the cardReviews tool
export const CARD_REVIEWS_TOOL = {
  name: "cardReviews",
  description: "Requests all card reviews for a specified deck after a certain time.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "string",
        description: "Deck name"
      },
      startID: {
        type: "number",
        description: "Unix timestamp in milliseconds"
      }
    },
    required: ["deck", "startID"]
  }
};// Handle the modelTemplates tool
export async function handleModelTemplates(arguments_) {
  console.error("Processing modelTemplates tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const templates = await invokeAnkiConnect("modelTemplates", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(templates, null, 2)
      }
    ]
  };
}

// Handle the modelStyling tool
export async function handleModelStyling(arguments_) {
  console.error("Processing modelStyling tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const styling = await invokeAnkiConnect("modelStyling", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(styling, null, 2)
      }
    ]
  };
}

// Handle the updateModelTemplates tool
export async function handleUpdateModelTemplates(arguments_) {
  console.error("Processing updateModelTemplates tool");
  
  if (!arguments_?.model || typeof arguments_.model !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model");
  }
  
  if (!arguments_.model.name || typeof arguments_.model.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.name");
  }
  
  if (!arguments_.model.templates || typeof arguments_.model.templates !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.templates");
  }
  
  const result = await invokeAnkiConnect("updateModelTemplates", { model: arguments_.model });
  
  return {
    content: [
      {
        type: "text",
        text: `Update model templates: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the updateModelStyling tool
export async function handleUpdateModelStyling(arguments_) {
  console.error("Processing updateModelStyling tool");
  
  if (!arguments_?.model || typeof arguments_.model !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model");
  }
  
  if (!arguments_.model.name || typeof arguments_.model.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.name");
  }
  
  if (!arguments_.model.css || typeof arguments_.model.css !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: model.css");
  }
  
  const result = await invokeAnkiConnect("updateModelStyling", { model: arguments_.model });
  
  return {
    content: [
      {
        type: "text",
        text: `Update model styling: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the createModel tool
export async function handleCreateModel(arguments_) {
  console.error("Processing createModel tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  if (!arguments_?.inOrderFields || !Array.isArray(arguments_.inOrderFields)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: inOrderFields (array of field names)");
  }
  
  if (!arguments_?.cardTemplates || !Array.isArray(arguments_.cardTemplates)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cardTemplates (array of templates)");
  }
  
  const params = {
    modelName: arguments_.modelName,
    inOrderFields: arguments_.inOrderFields,
    cardTemplates: arguments_.cardTemplates
  };
  
  if (arguments_?.css) {
    params.css = arguments_.css;
  }
  
  if (arguments_?.isCloze !== undefined) {
    params.isCloze = arguments_.isCloze;
  }
  
  const result = await invokeAnkiConnect("createModel", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Create model: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

//=============================================
// MODEL TEMPLATE OPERATIONS
//=============================================

// Define the modelTemplates tool
export const MODEL_TEMPLATES_TOOL = {
  name: "modelTemplates",
  description: "Returns an object indicating the template content for each card connected to the provided model by name.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      }
    },
    required: ["modelName"]
  }
};

// Define the modelStyling tool
export const MODEL_STYLING_TOOL = {
  name: "modelStyling",
  description: "Gets the CSS styling for the provided model by name.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      }
    },
    required: ["modelName"]
  }
};

// Define the updateModelTemplates tool
export const UPDATE_MODEL_TEMPLATES_TOOL = {
  name: "updateModelTemplates",
  description: "Modify the templates of an existing model by name. Only specified cards and sides will be modified.",
  inputSchema: {
    type: "object",
    properties: {
      model: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the model"
          },
          templates: {
            type: "object",
            description: "Templates to update"
          }
        },
        required: ["name", "templates"]
      }
    },
    required: ["model"]
  }
};

// Define the updateModelStyling tool
export const UPDATE_MODEL_STYLING_TOOL = {
  name: "updateModelStyling",
  description: "Modify the CSS styling of an existing model by name.",
  inputSchema: {
    type: "object",
    properties: {
      model: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the model"
          },
          css: {
            type: "string",
            description: "CSS styling"
          }
        },
        required: ["name", "css"]
      }
    },
    required: ["model"]
  }
};

// Define the createModel tool
export const CREATE_MODEL_TOOL = {
  name: "createModel",
  description: "Creates a new model to be used in Anki.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "The name of the model"
      },
      inOrderFields: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of field names"
      },
      css: {
        type: "string",
        description: "CSS styling"
      },
      isCloze: {
        type: "boolean",
        description: "Whether the model is a cloze model"
      },
      cardTemplates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            Name: {
              type: "string",
              description: "Template name"
            },
            Front: {
              type: "string",
              description: "Front template HTML"
            },
            Back: {
              type: "string",
              description: "Back template HTML"
            }
          },
          required: ["Name", "Front", "Back"]
        },
        description: "Array of card templates"
      }
    },
    required: ["modelName", "inOrderFields", "cardTemplates"]
  }
};

// Handle the guiCurrentCard tool
export async function handleGuiCurrentCard() {
  console.error("Processing guiCurrentCard tool");
  
  const card = await invokeAnkiConnect("guiCurrentCard");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(card, null, 2)
      }
    ]
  };
}

// Handle the guiStartCardTimer tool
export async function handleGuiStartCardTimer() {
  console.error("Processing guiStartCardTimer tool");
  
  const result = await invokeAnkiConnect("guiStartCardTimer");
  
  return {
    content: [
      {
        type: "text",
        text: `Start card timer: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiShowQuestion tool
export async function handleGuiShowQuestion() {
  console.error("Processing guiShowQuestion tool");
  
  const result = await invokeAnkiConnect("guiShowQuestion");
  
  return {
    content: [
      {
        type: "text",
        text: `Show question: ${result ? "Success" : "Failed (not in review mode)"}`
      }
    ]
  };
}

// Handle the guiShowAnswer tool
export async function handleGuiShowAnswer() {
  console.error("Processing guiShowAnswer tool");
  
  const result = await invokeAnkiConnect("guiShowAnswer");
  
  return {
    content: [
      {
        type: "text",
        text: `Show answer: ${result ? "Success" : "Failed (not in review mode)"}`
      }
    ]
  };
}

// Handle the guiAnswerCard tool
export async function handleGuiAnswerCard(arguments_) {
  console.error("Processing guiAnswerCard tool");
  
  if (!arguments_?.ease || typeof arguments_.ease !== 'number' || arguments_.ease < 1 || arguments_.ease > 4) {
    throw new McpError(ErrorCode.InvalidParams, "Missing or invalid required parameter: ease (1-4)");
  }
  
  const result = await invokeAnkiConnect("guiAnswerCard", { ease: arguments_.ease });
  
  return {
    content: [
      {
        type: "text",
        text: `Answer card with ease ${arguments_.ease}: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiDeckBrowser tool
export async function handleGuiDeckBrowser() {
  console.error("Processing guiDeckBrowser tool");
  
  const result = await invokeAnkiConnect("guiDeckBrowser");
  
  return {
    content: [
      {
        type: "text",
        text: `Open deck browser: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiDeckOverview tool
export async function handleGuiDeckOverview(arguments_) {
  console.error("Processing guiDeckOverview tool");
  
  if (!arguments_?.name || typeof arguments_.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: name (deck name)");
  }
  
  const result = await invokeAnkiConnect("guiDeckOverview", { name: arguments_.name });
  
  return {
    content: [
      {
        type: "text",
        text: `Open deck overview for '${arguments_.name}': ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

//=============================================
// CARD OPERATIONS
//=============================================

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
  description: "Sets specific values of a single card. Given the risk of wreaking havoc in the database when changing some of the values of a card, some of the keys require the argument 'warning_check' set to True.",
  inputSchema: {
    type: "object",
    properties: {
      card: {
        type: "number",
        description: "Card ID"
      },
      keys: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of property names to set"
      },
      newValues: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of values to set for the properties (should match the length of keys array)"
      },
      warning_check: {
        type: "boolean",
        description: "Set to true to confirm potentially dangerous operations"
      }
    },
    required: ["card", "keys", "newValues"]
  }
};

// Define the suspend tool
export const SUSPEND_TOOL = {
  name: "suspend",
  description: "Suspend cards by card ID; returns true if successful (at least one card wasn't already suspended) or false",
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

// Define the unsuspend tool
export const UNSUSPEND_TOOL = {
  name: "unsuspend",
  description: "Unsuspend cards by card ID; returns true if successful (at least one card was previously suspended) or false",
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

// Define the suspended tool
export const SUSPENDED_TOOL = {
  name: "suspended",
  description: "Check if card is suspended by its ID. Returns true if suspended, false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      card: {
        type: "number",
        description: "Card ID"
      }
    },
    required: ["card"]
  }
};

// Define the areSuspended tool
export const ARE_SUSPENDED_TOOL = {
  name: "areSuspended",
  description: "Returns an array indicating whether each of the given cards is suspended (in the same order).",
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

// Define the areDue tool
export const ARE_DUE_TOOL = {
  name: "areDue",
  description: "Returns an array indicating whether each of the given cards is due (in the same order).",
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

// Define the findCards tool
export const FIND_CARDS_TOOL = {
  name: "findCards",
  description: "Returns an array of card IDs for a given query. Functionally identical to guiBrowse but doesn't use the GUI.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'deck:current')"
      }
    },
    required: ["query"]
  }
};

// Define the cardsToNotes tool
export const CARDS_TO_NOTES_TOOL = {
  name: "cardsToNotes",
  description: "Returns an unordered array of note IDs for the given card IDs. For cards with the same note, the ID is only given once.",
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

// Define the cardsInfo tool
export const CARDS_INFO_TOOL = {
  name: "cardsInfo",
  description: "Returns information for each card ID including fields, front and back sides, note type, etc.",
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

// Define the forgetCards tool
export const FORGET_CARDS_TOOL = {
  name: "forgetCards",
  description: "Forget cards, making the cards new again.",
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

// Define the answerCards tool
export const ANSWER_CARDS_TOOL = {
  name: "answerCards",
  description: "Answer cards. Ease is between 1 (Again) and 4 (Easy). Will start the timer immediately before answering.",
  inputSchema: {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            cardId: {
              type: "number",
              description: "Card ID"
            },
            ease: {
              type: "number",
              description: "Ease value (1-4)"
            }
          },
          required: ["cardId", "ease"]
        },
        description: "Array of card answers"
      }
    },
    required: ["answers"]
  }
};

//=============================================
// DECK OPERATIONS
//=============================================

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

// Define the deckNamesAndIds tool
export const DECK_NAMES_AND_IDS_TOOL = {
  name: "deckNamesAndIds",
  description: "Gets the complete list of deck names and their respective IDs for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the getDecks tool
export const GET_DECKS_TOOL = {
  name: "getDecks",
  description: "Accepts an array of card IDs and returns an object with each deck name as a key and its value an array of the given cards in that deck.",
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

// Define the changeDeck tool
export const CHANGE_DECK_TOOL = {
  name: "changeDeck",
  description: "Moves cards with the given IDs to a different deck, creating the deck if it doesn't exist yet.",
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
      deck: {
        type: "string",
        description: "Name of the destination deck"
      }
    },
    required: ["cards", "deck"]
  }
};

// Define the deleteDecks tool
export const DELETE_DECKS_TOOL = {
  name: "deleteDecks",
  description: "Deletes decks with the given names.",
  inputSchema: {
    type: "object",
    properties: {
      decks: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of deck names"
      },
      cardsToo: {
        type: "boolean",
        description: "Whether to delete the cards as well"
      }
    },
    required: ["decks"]
  }
};

// Define the getDeckConfig tool
export const GET_DECK_CONFIG_TOOL = {
  name: "getDeckConfig",
  description: "Gets the configuration group object for the given deck.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "string",
        description: "Name of the deck"
      }
    },
    required: ["deck"]
  }
};

// Define the saveDeckConfig tool
export const SAVE_DECK_CONFIG_TOOL = {
  name: "saveDeckConfig",
  description: "Saves the given configuration group, returning true on success or false if the ID of the configuration group is invalid.",
  inputSchema: {
    type: "object",
    properties: {
      config: {
        type: "object",
        description: "Deck configuration object"
      }
    },
    required: ["config"]
  }
};

// Define the setDeckConfigId tool
export const SET_DECK_CONFIG_ID_TOOL = {
  name: "setDeckConfigId",
  description: "Changes the configuration group for the given decks to the one with the given ID.",
  inputSchema: {
    type: "object",
    properties: {
      decks: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of deck names"
      },
      configId: {
        type: "number",
        description: "ID of the configuration group"
      }
    },
    required: ["decks", "configId"]
  }
};

// Define the getDeckStats tool
export const GET_DECK_STATS_TOOL = {
  name: "getDeckStats",
  description: "Gets statistics such as total cards and cards due for the given decks.",
  inputSchema: {
    type: "object",
    properties: {
      decks: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of deck names"
      }
    },
    required: ["decks"]
  }
};

//=============================================
// MODEL OPERATIONS
//=============================================

// Define the modelNames tool
export const MODEL_NAMES_TOOL = {
  name: "modelNames",
  description: "Gets the complete list of model names for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the modelNamesAndIds tool
export const MODEL_NAMES_AND_IDS_TOOL = {
  name: "modelNamesAndIds",
  description: "Gets the complete list of model names and their corresponding IDs for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the modelFieldNames tool
export const MODEL_FIELD_NAMES_TOOL = {
  name: "modelFieldNames",
  description: "Gets the complete list of field names for the provided model name.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "Name of the model"
      }
    },
    required: ["modelName"]
  }
};

// Define the modelFieldsOnTemplates tool
export const MODEL_FIELDS_ON_TEMPLATES_TOOL = {
  name: "modelFieldsOnTemplates",
  description: "Returns an object indicating the fields on the question and answer side of each card template for the given model.",
  inputSchema: {
    type: "object",
    properties: {
      modelName: {
        type: "string",
        description: "Name of the model"
      }
    },
    required: ["modelName"]
  }
};

//=============================================
// NOTE OPERATIONS
//=============================================

// Define the addNote tool
export const ADD_NOTE_TOOL = {
  name: "addNote",
  description: "Creates a note using the given deck and model, with the provided field values and tags. Returns the identifier of the created note.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "object",
        properties: {
          deckName: {
            type: "string",
            description: "The name of the deck"
          },
          modelName: {
            type: "string",
            description: "The name of the model"
          },
          fields: {
            type: "object",
            description: "Fields for the note (depends on model)"
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Tags for the note"
          },
          options: {
            type: "object",
            description: "Options for the note creation"
          }
        },
        required: ["deckName", "modelName", "fields"]
      }
    },
    required: ["note"]
  }
};

// Define the addNotes tool
export const ADD_NOTES_TOOL = {
  name: "addNotes",
  description: "Creates multiple notes using the given deck and model, with the provided field values and tags. Returns an array of note IDs or null for notes that could not be added.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            deckName: {
              type: "string",
              description: "The name of the deck"
            },
            modelName: {
              type: "string",
              description: "The name of the model"
            },
            fields: {
              type: "object",
              description: "Fields for the note (depends on model)"
            },
            tags: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Tags for the note"
            }
          },
          required: ["deckName", "modelName", "fields"]
        },
        description: "Array of notes to add"
      }
    },
    required: ["notes"]
  }
};

// Define the findNotes tool
export const FIND_NOTES_TOOL = {
  name: "findNotes",
  description: "Returns an array of note IDs for a given query. Query syntax is documented in Anki's documentation.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'deck:current')"
      }
    },
    required: ["query"]
  }
};

// Define the getIntervals tool
export const GET_INTERVALS_TOOL = {
  name: "getIntervals",
  description: "Returns an array of the most recent intervals for each given card ID, or a 2-dimensional array of all the intervals for each card.",
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
      complete: {
        type: "boolean",
        description: "Whether to return a complete history of intervals for each card"
      }
    },
    required: ["cards"]
  }
};

// Define the cardsModTime tool
export const CARDS_MOD_TIME_TOOL = {
  name: "cardsModTime",
  description: "Returns a list of objects containing the modification time for each card ID.",
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

// Define the relearnCards tool
export const RELEARN_CARDS_TOOL = {
  name: "relearnCards",
  description: "Make cards be 'relearning'.",
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

// Define the setDueDate tool
export const SET_DUE_DATE_TOOL = {
  name: "setDueDate",
  description: "Set Due Date. Turns cards into review cards if they are new, and makes them due on a certain date.",
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
      days: {
        type: "string",
        description: "Due date in days (can be a range like '3-7')"
      }
    },
    required: ["cards", "days"]
  }
};

// Define the getTags tool
export const GET_TAGS_TOOL = {
  name: "getTags",
  description: "Gets the complete list of tags for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the updateNoteFields tool
export const UPDATE_NOTE_FIELDS_TOOL = {
  name: "updateNoteFields",
  description: "Modify the fields of an existing note.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "Note ID"
          },
          fields: {
            type: "object",
            description: "Fields to update"
          }
        },
        required: ["id", "fields"]
      }
    },
    required: ["note"]
  }
};

// Define the updateNote tool
export const UPDATE_NOTE_TOOL = {
  name: "updateNote",
  description: "Modify the fields and/or tags of an existing note.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "Note ID"
          },
          fields: {
            type: "object",
            description: "Fields to update"
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Tags to set (replacing existing tags)"
          }
        },
        required: ["id"]
      }
    },
    required: ["note"]
  }
};

// Define the notesInfo tool
export const NOTES_INFO_TOOL = {
  name: "notesInfo",
  description: "Returns information for each note ID including fields, tags, note type, etc.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      }
    },
    required: ["notes"]
  }
};

// Define the deleteNotes tool
export const DELETE_NOTES_TOOL = {
  name: "deleteNotes",
  description: "Deletes notes with the given IDs. If a note has several cards associated with it, all associated cards will be deleted.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      }
    },
    required: ["notes"]
  }
};

//=============================================
// TAG OPERATIONS
//=============================================

// Define the updateNoteTags tool
export const UPDATE_NOTE_TAGS_TOOL = {
  name: "updateNoteTags",
  description: "Set a note's tags by note ID. Old tags will be removed.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "number",
        description: "Note ID"
      },
      tags: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of tags"
      }
    },
    required: ["note", "tags"]
  }
};

// Define the getNoteTags tool
export const GET_NOTE_TAGS_TOOL = {
  name: "getNoteTags",
  description: "Get a note's tags by note ID.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "number",
        description: "Note ID"
      }
    },
    required: ["note"]
  }
};

// Define the addTags tool
export const ADD_TAGS_TOOL = {
  name: "addTags",
  description: "Adds tags to notes by note ID.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      },
      tags: {
        type: "string",
        description: "Space-separated list of tags"
      }
    },
    required: ["notes", "tags"]
  }
};

// Define the removeTags tool
export const REMOVE_TAGS_TOOL = {
  name: "removeTags",
  description: "Remove tags from notes by note ID.",
  inputSchema: {
    type: "object",
    properties: {
      notes: {
        type: "array",
        items: {
          type: "number"
        },
        description: "Array of note IDs"
      },
      tags: {
        type: "string",
        description: "Space-separated list of tags"
      }
    },
    required: ["notes", "tags"]
  }
};

// Define the clearUnusedTags tool
export const CLEAR_UNUSED_TAGS_TOOL = {
  name: "clearUnusedTags",
  description: "Clears all the unused tags in the notes for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

//=============================================
// MEDIA OPERATIONS
//=============================================

// Define the storeMediaFile tool
export const STORE_MEDIA_FILE_TOOL = {
  name: "storeMediaFile",
  description: "Stores a file with the specified base64-encoded contents inside the media folder.",
  inputSchema: {
    type: "object",
    properties: {
      filename: {
        type: "string",
        description: "Name of the file to store"
      },
      data: {
        type: "string",
        description: "Base64-encoded contents of the file"
      }
    },
    required: ["filename", "data"]
  }
};

// Define the retrieveMediaFile tool
export const RETRIEVE_MEDIA_FILE_TOOL = {
  name: "retrieveMediaFile",
  description: "Retrieves the base64-encoded contents of the specified file, returning false if the file does not exist.",
  inputSchema: {
    type: "object",
    properties: {
      filename: {
        type: "string",
        description: "Name of the file to retrieve"
      }
    },
    required: ["filename"]
  }
};

// Define the getMediaFilesNames tool
export const GET_MEDIA_FILES_NAMES_TOOL = {
  name: "getMediaFilesNames",
  description: "Gets the names of media files matched the pattern. Returning all names by default.",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Pattern to match filenames"
      }
    }
  }
};

// Define the getMediaDirPath tool
export const GET_MEDIA_DIR_PATH_TOOL = {
  name: "getMediaDirPath",
  description: "Gets the full path to the collection.media folder of the currently opened profile.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the deleteMediaFile tool
export const DELETE_MEDIA_FILE_TOOL = {
  name: "deleteMediaFile",
  description: "Deletes the specified file inside the media folder.",
  inputSchema: {
    type: "object",
    properties: {
      filename: {
        type: "string",
        description: "Name of the file to delete"
      }
    },
    required: ["filename"]
  }
};

//=============================================
// GUI OPERATIONS
//=============================================

// Define the guiBrowse tool
export const GUI_BROWSE_TOOL = {
  name: "guiBrowse",
  description: "Invokes the Card Browser dialog and searches for a given query. Returns an array of identifiers of the cards that match the query.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'deck:current')"
      },
      reorderCards: {
        type: "object",
        properties: {
          order: {
            type: "string",
            description: "Order direction ('ascending' or 'descending')"
          },
          columnId: {
            type: "string",
            description: "Column ID to sort by"
          }
        }
      }
    },
    required: ["query"]
  }
};

// Define the guiAddCards tool
export const GUI_ADD_CARDS_TOOL = {
  name: "guiAddCards",
  description: "Invokes the Add Cards dialog, presets the note using the given deck and model, with the provided field values and tags.",
  inputSchema: {
    type: "object",
    properties: {
      note: {
        type: "object",
        properties: {
          deckName: {
            type: "string",
            description: "The name of the deck"
          },
          modelName: {
            type: "string",
            description: "The name of the model"
          },
          fields: {
            type: "object",
            description: "Fields for the note (depends on model)"
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Tags for the note"
          }
        },
        required: ["deckName", "modelName", "fields"]
      }
    },
    required: ["note"]
  }
};

// Define the guiDeckReview tool
export const GUI_DECK_REVIEW_TOOL = {
  name: "guiDeckReview",
  description: "Starts review for the deck with the given name; returns true if succeeded or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the deck"
      }
    },
    required: ["name"]
  }
};

// Define the guiCurrentCard tool
export const GUI_CURRENT_CARD_TOOL = {
  name: "guiCurrentCard",
  description: "Returns information about the current card or null if not in review mode.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiStartCardTimer tool
export const GUI_START_CARD_TIMER_TOOL = {
  name: "guiStartCardTimer",
  description: "Starts or resets the timerStarted value for the current card.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiShowQuestion tool
export const GUI_SHOW_QUESTION_TOOL = {
  name: "guiShowQuestion",
  description: "Shows question text for the current card; returns true if in review mode or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiShowAnswer tool
export const GUI_SHOW_ANSWER_TOOL = {
  name: "guiShowAnswer",
  description: "Shows answer text for the current card; returns true if in review mode or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiAnswerCard tool
export const GUI_ANSWER_CARD_TOOL = {
  name: "guiAnswerCard",
  description: "Answers the current card; returns true if succeeded or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      ease: {
        type: "number",
        description: "Ease value (1-4)"
      }
    },
    required: ["ease"]
  }
};

// Define the guiDeckBrowser tool
export const GUI_DECK_BROWSER_TOOL = {
  name: "guiDeckBrowser",
  description: "Opens the Deck Browser dialog.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the guiDeckOverview tool
export const GUI_DECK_OVERVIEW_TOOL = {
  name: "guiDeckOverview",
  description: "Opens the Deck Overview dialog for the deck with the given name.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the deck"
      }
    },
    required: ["name"]
  }
};

//=============================================
// UTILITY OPERATIONS
//=============================================

// Define the sync tool
export const SYNC_TOOL = {
  name: "sync",
  description: "Synchronizes the local Anki collections with AnkiWeb.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the version tool
export const VERSION_TOOL = {
  name: "version",
  description: "Gets the version of the API exposed by this plugin. Currently versions 1 through 6 are defined.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

// Define the exportPackage tool
export const EXPORT_PACKAGE_TOOL = {
  name: "exportPackage",
  description: "Exports a given deck in .apkg format. Returns true if successful or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "string",
        description: "Name of the deck to export"
      },
      path: {
        type: "string",
        description: "Full path where the .apkg file should be saved"
      },
      includeSched: {
        type: "boolean",
        description: "Whether to include scheduling information"
      }
    },
    required: ["deck", "path"]
  }
};

// Define the importPackage tool
export const IMPORT_PACKAGE_TOOL = {
  name: "importPackage",
  description: "Imports a file in .apkg format into the collection. Returns true if successful or false otherwise.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Full path to the .apkg file"
      }
    },
    required: ["path"]
  }
};

//=============================================
// HANDLER FUNCTIONS
//=============================================

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
  
  if (!arguments_?.keys || !Array.isArray(arguments_.keys)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: keys (array of property names)");
  }
  
  if (!arguments_?.newValues || !Array.isArray(arguments_.newValues)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: newValues (array of property values)");
  }
  
  if (arguments_.keys.length !== arguments_.newValues.length) {
    throw new McpError(ErrorCode.InvalidParams, "Keys and newValues arrays must have the same length");
  }
  
  const params = {
    card: arguments_.card,
    keys: arguments_.keys,
    newValues: arguments_.newValues
  };
  
  if (arguments_.warning_check !== undefined) {
    params.warning_check = arguments_.warning_check;
  }
  
  const result = await invokeAnkiConnect("setSpecificValueOfCard", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Set specific values of card: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the suspend tool
export async function handleSuspend(arguments_) {
  console.error("Processing suspend tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const result = await invokeAnkiConnect("suspend", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: `Suspend cards: ${result ? "Success" : "Failed (possibly already suspended)"}`
      }
    ]
  };
}

// Handle the unsuspend tool
export async function handleUnsuspend(arguments_) {
  console.error("Processing unsuspend tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const result = await invokeAnkiConnect("unsuspend", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: `Unsuspend cards: ${result ? "Success" : "Failed (possibly not suspended)"}`
      }
    ]
  };
}

// Handle the suspended tool
export async function handleSuspended(arguments_) {
  console.error("Processing suspended tool");
  
  if (!arguments_?.card || typeof arguments_.card !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: card (card ID)");
  }
  
  const result = await invokeAnkiConnect("suspended", { card: arguments_.card });
  
  return {
    content: [
      {
        type: "text",
        text: `Card is suspended: ${result}`
      }
    ]
  };
}

// Handle the areSuspended tool
export async function handleAreSuspended(arguments_) {
  console.error("Processing areSuspended tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const results = await invokeAnkiConnect("areSuspended", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Handle the areDue tool
export async function handleAreDue(arguments_) {
  console.error("Processing areDue tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const results = await invokeAnkiConnect("areDue", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Handle the findCards tool
export async function handleFindCards(arguments_) {
  console.error("Processing findCards tool");
  
  if (!arguments_?.query || typeof arguments_.query !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: query");
  }
  
  const cardIds = await invokeAnkiConnect("findCards", { query: arguments_.query });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(cardIds, null, 2)
      }
    ]
  };
}

// Handle the cardsToNotes tool
export async function handleCardsToNotes(arguments_) {
  console.error("Processing cardsToNotes tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const noteIds = await invokeAnkiConnect("cardsToNotes", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(noteIds, null, 2)
      }
    ]
  };
}

// Handle the cardsInfo tool
export async function handleCardsInfo(arguments_) {
  console.error("Processing cardsInfo tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const cardsInfo = await invokeAnkiConnect("cardsInfo", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(cardsInfo, null, 2)
      }
    ]
  };
}

// Handle the forgetCards tool
export async function handleForgetCards(arguments_) {
  console.error("Processing forgetCards tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const result = await invokeAnkiConnect("forgetCards", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: `Forget cards: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the answerCards tool
export async function handleAnswerCards(arguments_) {
  console.error("Processing answerCards tool");
  
  if (!arguments_?.answers || !Array.isArray(arguments_.answers)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: answers (array of card answers)");
  }
  
  const result = await invokeAnkiConnect("answerCards", { answers: arguments_.answers });
  
  return {
    content: [
      {
        type: "text",
        text: `Answer cards: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

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

// Handle the deckNamesAndIds tool
export async function handleDeckNamesAndIds() {
  console.error("Processing deckNamesAndIds tool");
  
  const decks = await invokeAnkiConnect("deckNamesAndIds");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(decks, null, 2)
      }
    ]
  };
}

// Handle the getDecks tool
export async function handleGetDecks(arguments_) {
  console.error("Processing getDecks tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const decks = await invokeAnkiConnect("getDecks", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(decks, null, 2)
      }
    ]
  };
}

// Handle the changeDeck tool
export async function handleChangeDeck(arguments_) {
  console.error("Processing changeDeck tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  if (!arguments_?.deck || typeof arguments_.deck !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  const result = await invokeAnkiConnect("changeDeck", { 
    cards: arguments_.cards,
    deck: arguments_.deck
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Change deck: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the deleteDecks tool
export async function handleDeleteDecks(arguments_) {
  console.error("Processing deleteDecks tool");
  
  if (!arguments_?.decks || !Array.isArray(arguments_.decks)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: decks (array of deck names)");
  }
  
  const params = {
    decks: arguments_.decks
  };
  
  if (arguments_.cardsToo !== undefined) {
    params.cardsToo = arguments_.cardsToo;
  }
  
  const result = await invokeAnkiConnect("deleteDecks", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Delete decks: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the addNote tool
export async function handleAddNote(arguments_) {
  console.error("Processing addNote tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note");
  }
  
  if (!arguments_.note.deckName || typeof arguments_.note.deckName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.deckName");
  }
  
  if (!arguments_.note.modelName || typeof arguments_.note.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.modelName");
  }
  
  if (!arguments_.note.fields || typeof arguments_.note.fields !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.fields");
  }
  
  const noteId = await invokeAnkiConnect("addNote", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: `Note created with ID: ${noteId}`
      }
    ]
  };
}

// Handle the findNotes tool
export async function handleFindNotes(arguments_) {
  console.error("Processing findNotes tool");
  
  if (!arguments_?.query || typeof arguments_.query !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: query");
  }
  
  const noteIds = await invokeAnkiConnect("findNotes", { query: arguments_.query });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(noteIds, null, 2)
      }
    ]
  };
}

// Handle the getTags tool
export async function handleGetTags() {
  console.error("Processing getTags tool");
  
  const tags = await invokeAnkiConnect("getTags");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(tags, null, 2)
      }
    ]
  };
}

// Handle the getIntervals tool
export async function handleGetIntervals(arguments_) {
  console.error("Processing getIntervals tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const params = {
    cards: arguments_.cards
  };
  
  if (arguments_.complete !== undefined) {
    params.complete = arguments_.complete;
  }
  
  const intervals = await invokeAnkiConnect("getIntervals", params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(intervals, null, 2)
      }
    ]
  };
}

// Handle the cardsModTime tool
export async function handleCardsModTime(arguments_) {
  console.error("Processing cardsModTime tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const modTimes = await invokeAnkiConnect("cardsModTime", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(modTimes, null, 2)
      }
    ]
  };
}

// Handle the relearnCards tool
export async function handleRelearnCards(arguments_) {
  console.error("Processing relearnCards tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  const result = await invokeAnkiConnect("relearnCards", { cards: arguments_.cards });
  
  return {
    content: [
      {
        type: "text",
        text: `Relearn cards: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the setDueDate tool
export async function handleSetDueDate(arguments_) {
  console.error("Processing setDueDate tool");
  
  if (!arguments_?.cards || !Array.isArray(arguments_.cards)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: cards (array of card IDs)");
  }
  
  if (!arguments_?.days) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: days");
  }
  
  const result = await invokeAnkiConnect("setDueDate", { 
    cards: arguments_.cards,
    days: arguments_.days
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set due date: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the getDeckConfig tool
export async function handleGetDeckConfig(arguments_) {
  console.error("Processing getDeckConfig tool");
  
  if (!arguments_?.deck || typeof arguments_.deck !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  const config = await invokeAnkiConnect("getDeckConfig", { deck: arguments_.deck });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(config, null, 2)
      }
    ]
  };
}

// Handle the saveDeckConfig tool
export async function handleSaveDeckConfig(arguments_) {
  console.error("Processing saveDeckConfig tool");
  
  if (!arguments_?.config || typeof arguments_.config !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: config");
  }
  
  const result = await invokeAnkiConnect("saveDeckConfig", { config: arguments_.config });
  
  return {
    content: [
      {
        type: "text",
        text: `Save deck config: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the setDeckConfigId tool
export async function handleSetDeckConfigId(arguments_) {
  console.error("Processing setDeckConfigId tool");
  
  if (!arguments_?.decks || !Array.isArray(arguments_.decks)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: decks (array of deck names)");
  }
  
  if (arguments_.configId === undefined || typeof arguments_.configId !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: configId");
  }
  
  const result = await invokeAnkiConnect("setDeckConfigId", { 
    decks: arguments_.decks,
    configId: arguments_.configId
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Set deck config ID: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the getDeckStats tool
export async function handleGetDeckStats(arguments_) {
  console.error("Processing getDeckStats tool");
  
  if (!arguments_?.decks || !Array.isArray(arguments_.decks)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: decks (array of deck names)");
  }
  
  const stats = await invokeAnkiConnect("getDeckStats", { decks: arguments_.decks });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(stats, null, 2)
      }
    ]
  };
}

// Handle the modelNames tool
export async function handleModelNames() {
  console.error("Processing modelNames tool");
  
  const modelNames = await invokeAnkiConnect("modelNames");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(modelNames, null, 2)
      }
    ]
  };
}

// Handle the modelNamesAndIds tool
export async function handleModelNamesAndIds() {
  console.error("Processing modelNamesAndIds tool");
  
  const models = await invokeAnkiConnect("modelNamesAndIds");
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(models, null, 2)
      }
    ]
  };
}

// Handle the modelFieldNames tool
export async function handleModelFieldNames(arguments_) {
  console.error("Processing modelFieldNames tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const fieldNames = await invokeAnkiConnect("modelFieldNames", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(fieldNames, null, 2)
      }
    ]
  };
}

// Handle the modelFieldsOnTemplates tool
export async function handleModelFieldsOnTemplates(arguments_) {
  console.error("Processing modelFieldsOnTemplates tool");
  
  if (!arguments_?.modelName || typeof arguments_.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: modelName");
  }
  
  const fieldsOnTemplates = await invokeAnkiConnect("modelFieldsOnTemplates", { modelName: arguments_.modelName });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(fieldsOnTemplates, null, 2)
      }
    ]
  };
}

// Handle the addNotes tool
export async function handleAddNotes(arguments_) {
  console.error("Processing addNotes tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of notes)");
  }
  
  const noteIds = await invokeAnkiConnect("addNotes", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(noteIds, null, 2)
      }
    ]
  };
}

// Handle the updateNote tool
export async function handleUpdateNote(arguments_) {
  console.error("Processing updateNote tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note");
  }
  
  if (!arguments_.note.id || typeof arguments_.note.id !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.id");
  }
  
  const result = await invokeAnkiConnect("updateNote", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: `Update note: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the notesInfo tool
export async function handleNotesInfo(arguments_) {
  console.error("Processing notesInfo tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  const notesInfo = await invokeAnkiConnect("notesInfo", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(notesInfo, null, 2)
      }
    ]
  };
}

// Handle the deleteNotes tool
export async function handleDeleteNotes(arguments_) {
  console.error("Processing deleteNotes tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  const result = await invokeAnkiConnect("deleteNotes", { notes: arguments_.notes });
  
  return {
    content: [
      {
        type: "text",
        text: `Delete notes: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the sync tool
export async function handleSync() {
  console.error("Processing sync tool");
  
  const result = await invokeAnkiConnect("sync");
  
  return {
    content: [
      {
        type: "text",
        text: `Sync: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the version tool
export async function handleVersion() {
  console.error("Processing version tool");
  
  const version = await invokeAnkiConnect("version");
  
  return {
    content: [
      {
        type: "text",
        text: `AnkiConnect API version: ${version}`
      }
    ]
  };
}

// Handle the updateNoteFields tool
export async function handleUpdateNoteFields(arguments_) {
  console.error("Processing updateNoteFields tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note");
  }
  
  if (!arguments_.note.id || typeof arguments_.note.id !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.id");
  }
  
  if (!arguments_.note.fields || typeof arguments_.note.fields !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.fields");
  }
  
  const result = await invokeAnkiConnect("updateNoteFields", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: `Update note fields: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the updateNoteTags tool
export async function handleUpdateNoteTags(arguments_) {
  console.error("Processing updateNoteTags tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note (note ID)");
  }
  
  if (!arguments_?.tags || !Array.isArray(arguments_.tags)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: tags (array of tags)");
  }
  
  const result = await invokeAnkiConnect("updateNoteTags", { 
    note: arguments_.note,
    tags: arguments_.tags
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Update note tags: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the getNoteTags tool
export async function handleGetNoteTags(arguments_) {
  console.error("Processing getNoteTags tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'number') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note (note ID)");
  }
  
  const tags = await invokeAnkiConnect("getNoteTags", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(tags, null, 2)
      }
    ]
  };
}

// Handle the addTags tool
export async function handleAddTags(arguments_) {
  console.error("Processing addTags tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  if (!arguments_?.tags || typeof arguments_.tags !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: tags (space-separated list of tags)");
  }
  
  const result = await invokeAnkiConnect("addTags", { 
    notes: arguments_.notes,
    tags: arguments_.tags
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Add tags: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the removeTags tool
export async function handleRemoveTags(arguments_) {
  console.error("Processing removeTags tool");
  
  if (!arguments_?.notes || !Array.isArray(arguments_.notes)) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: notes (array of note IDs)");
  }
  
  if (!arguments_?.tags || typeof arguments_.tags !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: tags (space-separated list of tags)");
  }
  
  const result = await invokeAnkiConnect("removeTags", { 
    notes: arguments_.notes,
    tags: arguments_.tags
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Remove tags: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the clearUnusedTags tool
export async function handleClearUnusedTags() {
  console.error("Processing clearUnusedTags tool");
  
  const result = await invokeAnkiConnect("clearUnusedTags");
  
  return {
    content: [
      {
        type: "text",
        text: `Clear unused tags: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the storeMediaFile tool
export async function handleStoreMediaFile(arguments_) {
  console.error("Processing storeMediaFile tool");
  
  if (!arguments_?.filename || typeof arguments_.filename !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: filename");
  }
  
  if (!arguments_?.data || typeof arguments_.data !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: data (base64-encoded file content)");
  }
  
  const result = await invokeAnkiConnect("storeMediaFile", { 
    filename: arguments_.filename,
    data: arguments_.data
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Store media file: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the retrieveMediaFile tool
export async function handleRetrieveMediaFile(arguments_) {
  console.error("Processing retrieveMediaFile tool");
  
  if (!arguments_?.filename || typeof arguments_.filename !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: filename");
  }
  
  const data = await invokeAnkiConnect("retrieveMediaFile", { filename: arguments_.filename });
  
  if (data === false) {
    return {
      content: [
        {
          type: "text",
          text: "File not found"
        }
      ]
    };
  }
  
  return {
    content: [
      {
        type: "text",
        text: data
      }
    ]
  };
}

// Handle the getMediaFilesNames tool
export async function handleGetMediaFilesNames(arguments_) {
  console.error("Processing getMediaFilesNames tool");
  
  const params = {};
  
  if (arguments_?.pattern) {
    params.pattern = arguments_.pattern;
  }
  
  const filenames = await invokeAnkiConnect("getMediaFilesNames", params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(filenames, null, 2)
      }
    ]
  };
}

// Handle the getMediaDirPath tool
export async function handleGetMediaDirPath() {
  console.error("Processing getMediaDirPath tool");
  
  const path = await invokeAnkiConnect("getMediaDirPath");
  
  return {
    content: [
      {
        type: "text",
        text: path
      }
    ]
  };
}

// Handle the deleteMediaFile tool
export async function handleDeleteMediaFile(arguments_) {
  console.error("Processing deleteMediaFile tool");
  
  if (!arguments_?.filename || typeof arguments_.filename !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: filename");
  }
  
  const result = await invokeAnkiConnect("deleteMediaFile", { filename: arguments_.filename });
  
  return {
    content: [
      {
        type: "text",
        text: `Delete media file: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the guiBrowse tool
export async function handleGuiBrowse(arguments_) {
  console.error("Processing guiBrowse tool");
  
  if (!arguments_?.query || typeof arguments_.query !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: query");
  }
  
  const params = { query: arguments_.query };
  
  if (arguments_?.reorderCards) {
    params.reorderCards = arguments_.reorderCards;
  }
  
  const cardIds = await invokeAnkiConnect("guiBrowse", params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(cardIds, null, 2)
      }
    ]
  };
}

// Handle the guiAddCards tool
export async function handleGuiAddCards(arguments_) {
  console.error("Processing guiAddCards tool");
  
  if (!arguments_?.note || typeof arguments_.note !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note");
  }
  
  if (!arguments_.note.deckName || typeof arguments_.note.deckName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.deckName");
  }
  
  if (!arguments_.note.modelName || typeof arguments_.note.modelName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.modelName");
  }
  
  if (!arguments_.note.fields || typeof arguments_.note.fields !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: note.fields");
  }
  
  const result = await invokeAnkiConnect("guiAddCards", { note: arguments_.note });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

// Handle the guiDeckReview tool
export async function handleGuiDeckReview(arguments_) {
  console.error("Processing guiDeckReview tool");
  
  if (!arguments_?.name || typeof arguments_.name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: name (deck name)");
  }
  
  const result = await invokeAnkiConnect("guiDeckReview", { name: arguments_.name });
  
  return {
    content: [
      {
        type: "text",
        text: `Start deck review: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the exportPackage tool
export async function handleExportPackage(arguments_) {
  console.error("Processing exportPackage tool");
  
  if (!arguments_?.deck || typeof arguments_.deck !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: deck");
  }
  
  if (!arguments_?.path || typeof arguments_.path !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: path");
  }
  
  const params = {
    deck: arguments_.deck,
    path: arguments_.path
  };
  
  if (arguments_?.includeSched !== undefined) {
    params.includeSched = arguments_.includeSched;
  }
  
  const result = await invokeAnkiConnect("exportPackage", params);
  
  return {
    content: [
      {
        type: "text",
        text: `Export package: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Handle the importPackage tool
export async function handleImportPackage(arguments_) {
  console.error("Processing importPackage tool");
  
  if (!arguments_?.path || typeof arguments_.path !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: path");
  }
  
  const result = await invokeAnkiConnect("importPackage", { path: arguments_.path });
  
  return {
    content: [
      {
        type: "text",
        text: `Import package: ${result ? "Success" : "Failed"}`
      }
    ]
  };
}

// Get all available tools
export const getTools = () => {
  return [
    // Card operations
    GET_EASE_FACTORS_TOOL,
    SET_EASE_FACTORS_TOOL,
    SET_SPECIFIC_VALUE_OF_CARD_TOOL,
    SUSPEND_TOOL,
    UNSUSPEND_TOOL,
    SUSPENDED_TOOL,
    ARE_SUSPENDED_TOOL,
    ARE_DUE_TOOL,
    GET_INTERVALS_TOOL,
    FIND_CARDS_TOOL,
    CARDS_TO_NOTES_TOOL,
    CARDS_MOD_TIME_TOOL,
    CARDS_INFO_TOOL,
    FORGET_CARDS_TOOL,
    RELEARN_CARDS_TOOL,
    ANSWER_CARDS_TOOL,
    SET_DUE_DATE_TOOL,

    // Deck operations
    GET_DECK_NAMES_TOOL,
    CREATE_DECK_TOOL,
    DECK_NAMES_AND_IDS_TOOL,
    GET_DECKS_TOOL,
    CHANGE_DECK_TOOL,
    DELETE_DECKS_TOOL,
    GET_DECK_CONFIG_TOOL,
    SAVE_DECK_CONFIG_TOOL,
    SET_DECK_CONFIG_ID_TOOL,
    CLONE_DECK_CONFIG_ID_TOOL,
    REMOVE_DECK_CONFIG_ID_TOOL,
    GET_DECK_STATS_TOOL,

    // Model operations
    MODEL_NAMES_TOOL,
    MODEL_NAMES_AND_IDS_TOOL,
    FIND_MODELS_BY_ID_TOOL,
    FIND_MODELS_BY_NAME_TOOL,
    MODEL_FIELD_NAMES_TOOL,
    MODEL_FIELD_DESCRIPTIONS_TOOL,
    MODEL_FIELD_FONTS_TOOL,
    MODEL_FIELDS_ON_TEMPLATES_TOOL,
    MODEL_TEMPLATES_TOOL,
    MODEL_STYLING_TOOL,
    UPDATE_MODEL_TEMPLATES_TOOL,
    UPDATE_MODEL_STYLING_TOOL,
    FIND_AND_REPLACE_IN_MODELS_TOOL,
    MODEL_TEMPLATE_RENAME_TOOL,
    MODEL_TEMPLATE_REPOSITION_TOOL,
    MODEL_TEMPLATE_ADD_TOOL,
    MODEL_TEMPLATE_REMOVE_TOOL,
    MODEL_FIELD_RENAME_TOOL,
    MODEL_FIELD_REPOSITION_TOOL,
    MODEL_FIELD_ADD_TOOL,
    MODEL_FIELD_REMOVE_TOOL,
    MODEL_FIELD_SET_FONT_TOOL,
    MODEL_FIELD_SET_FONT_SIZE_TOOL,
    MODEL_FIELD_SET_DESCRIPTION_TOOL,
    CREATE_MODEL_TOOL,

    // Note operations
    ADD_NOTE_TOOL,
    ADD_NOTES_TOOL,
    CAN_ADD_NOTES_TOOL,
    CAN_ADD_NOTES_WITH_ERROR_DETAIL_TOOL,
    FIND_NOTES_TOOL,
    NOTES_INFO_TOOL,
    NOTES_MOD_TIME_TOOL,
    UPDATE_NOTE_FIELDS_TOOL,
    UPDATE_NOTE_TOOL,
    UPDATE_NOTE_MODEL_TOOL,
    DELETE_NOTES_TOOL,
    REMOVE_EMPTY_NOTES_TOOL,

    // Tag operations
    GET_TAGS_TOOL,
    UPDATE_NOTE_TAGS_TOOL,
    GET_NOTE_TAGS_TOOL,
    ADD_TAGS_TOOL,
    REMOVE_TAGS_TOOL,
    CLEAR_UNUSED_TAGS_TOOL,
    REPLACE_TAGS_TOOL,
    REPLACE_TAGS_IN_ALL_NOTES_TOOL,

    // Media operations
    STORE_MEDIA_FILE_TOOL,
    RETRIEVE_MEDIA_FILE_TOOL,
    GET_MEDIA_FILES_NAMES_TOOL,
    GET_MEDIA_DIR_PATH_TOOL,
    DELETE_MEDIA_FILE_TOOL,

    // GUI operations
    GUI_BROWSE_TOOL,
    GUI_SELECT_CARD_TOOL,
    GUI_SELECTED_NOTES_TOOL,
    GUI_ADD_CARDS_TOOL,
    GUI_EDIT_NOTE_TOOL,
    GUI_CURRENT_CARD_TOOL,
    GUI_START_CARD_TIMER_TOOL,
    GUI_SHOW_QUESTION_TOOL,
    GUI_SHOW_ANSWER_TOOL,
    GUI_ANSWER_CARD_TOOL,
    GUI_UNDO_TOOL,
    GUI_DECK_BROWSER_TOOL,
    GUI_DECK_OVERVIEW_TOOL,
    GUI_DECK_REVIEW_TOOL,
    GUI_IMPORT_FILE_TOOL,
    GUI_EXIT_ANKI_TOOL,
    GUI_CHECK_DATABASE_TOOL,

    // Stats operations
    GET_NUM_CARDS_REVIEWED_TODAY_TOOL,
    GET_NUM_CARDS_REVIEWED_BY_DAY_TOOL,
    GET_COLLECTION_STATS_HTML_TOOL,
    CARD_REVIEWS_TOOL,
    GET_REVIEWS_OF_CARDS_TOOL,
    GET_LATEST_REVIEW_ID_TOOL,
    INSERT_REVIEWS_TOOL,

    // System operations
    REQUEST_PERMISSION_TOOL,
    VERSION_TOOL,
    API_REFLECT_TOOL,
    SYNC_TOOL,
    GET_PROFILES_TOOL,
    GET_ACTIVE_PROFILE_TOOL,
    LOAD_PROFILE_TOOL,
    MULTI_TOOL,
    EXPORT_PACKAGE_TOOL,
    IMPORT_PACKAGE_TOOL,
    RELOAD_COLLECTION_TOOL
  ];
};

// Handle tool calls
export async function handleToolCall(toolName, arguments_) {
  switch (toolName) {
    // Card operations
    case "getEaseFactors":
      return await handleGetEaseFactors(arguments_);
    case "setEaseFactors":
      return await handleSetEaseFactors(arguments_);
    case "setSpecificValueOfCard":
      return await handleSetSpecificValueOfCard(arguments_);
    case "suspend":
      return await handleSuspend(arguments_);
    case "unsuspend":
      return await handleUnsuspend(arguments_);
    case "suspended":
      return await handleSuspended(arguments_);
    case "areSuspended":
      return await handleAreSuspended(arguments_);
    case "areDue":
      return await handleAreDue(arguments_);
    case "getIntervals":
      return await handleGetIntervals(arguments_);
    case "findCards":
      return await handleFindCards(arguments_);
    case "cardsToNotes":
      return await handleCardsToNotes(arguments_);
    case "cardsModTime":
      return await handleCardsModTime(arguments_);
    case "cardsInfo":
      return await handleCardsInfo(arguments_);
    case "forgetCards":
      return await handleForgetCards(arguments_);
    case "relearnCards":
      return await handleRelearnCards(arguments_);
    case "answerCards":
      return await handleAnswerCards(arguments_);
    case "setDueDate":
      return await handleSetDueDate(arguments_);
    
    // Deck operations
    case "getDeckNames":
      return await handleGetDeckNames();
    case "createDeck":
      return await handleCreateDeck(arguments_);
    case "deckNamesAndIds":
      return await handleDeckNamesAndIds();
    case "getDecks":
      return await handleGetDecks(arguments_);
    case "changeDeck":
      return await handleChangeDeck(arguments_);
    case "deleteDecks":
      return await handleDeleteDecks(arguments_);
    case "getDeckConfig":
      return await handleGetDeckConfig(arguments_);
    case "saveDeckConfig":
      return await handleSaveDeckConfig(arguments_);
    case "setDeckConfigId":
      return await handleSetDeckConfigId(arguments_);
    case "cloneDeckConfigId":
      return await handleCloneDeckConfigId(arguments_);
    case "removeDeckConfigId":
      return await handleRemoveDeckConfigId(arguments_);
    case "getDeckStats":
      return await handleGetDeckStats(arguments_);
    
    // Model operations
    case "modelNames":
      return await handleModelNames();
    case "modelNamesAndIds":
      return await handleModelNamesAndIds();
    case "findModelsById":
      return await handleFindModelsById(arguments_);
    case "findModelsByName":
      return await handleFindModelsByName(arguments_);
    case "modelFieldNames":
      return await handleModelFieldNames(arguments_);
    case "modelFieldDescriptions":
      return await handleModelFieldDescriptions(arguments_);
    case "modelFieldFonts":
      return await handleModelFieldFonts(arguments_);
    case "modelFieldsOnTemplates":
      return await handleModelFieldsOnTemplates(arguments_);
    case "modelTemplates":
      return await handleModelTemplates(arguments_);
    case "modelStyling":
      return await handleModelStyling(arguments_);
    case "updateModelTemplates":
      return await handleUpdateModelTemplates(arguments_);
    case "updateModelStyling":
      return await handleUpdateModelStyling(arguments_);
    case "findAndReplaceInModels":
      return await handleFindAndReplaceInModels(arguments_);
    case "modelTemplateRename":
      return await handleModelTemplateRename(arguments_);
    case "modelTemplateReposition":
      return await handleModelTemplateReposition(arguments_);
    case "modelTemplateAdd":
      return await handleModelTemplateAdd(arguments_);
    case "modelTemplateRemove":
      return await handleModelTemplateRemove(arguments_);
    case "modelFieldRename":
      return await handleModelFieldRename(arguments_);
    case "modelFieldReposition":
      return await handleModelFieldReposition(arguments_);
    case "modelFieldAdd":
      return await handleModelFieldAdd(arguments_);
    case "modelFieldRemove":
      return await handleModelFieldRemove(arguments_);
    case "modelFieldSetFont":
      return await handleModelFieldSetFont(arguments_);
    case "modelFieldSetFontSize":
      return await handleModelFieldSetFontSize(arguments_);
    case "modelFieldSetDescription":
      return await handleModelFieldSetDescription(arguments_);
    case "createModel":
      return await handleCreateModel(arguments_);
    
    // Note operations
    case "addNote":
      return await handleAddNote(arguments_);
    case "addNotes":
      return await handleAddNotes(arguments_);
    case "canAddNotes":
      return await handleCanAddNotes(arguments_);
    case "canAddNotesWithErrorDetail":
      return await handleCanAddNotesWithErrorDetail(arguments_);
    case "findNotes":
      return await handleFindNotes(arguments_);
    case "notesInfo":
      return await handleNotesInfo(arguments_);
    case "notesModTime":
      return await handleNotesModTime(arguments_);
    case "updateNoteFields":
      return await handleUpdateNoteFields(arguments_);
    case "updateNote":
      return await handleUpdateNote(arguments_);
    case "updateNoteModel":
      return await handleUpdateNoteModel(arguments_);
    case "deleteNotes":
      return await handleDeleteNotes(arguments_);
    case "removeEmptyNotes":
      return await handleRemoveEmptyNotes();
    
    // Tag operations
    case "getTags":
      return await handleGetTags();
    case "updateNoteTags":
      return await handleUpdateNoteTags(arguments_);
    case "getNoteTags":
      return await handleGetNoteTags(arguments_);
    case "addTags":
      return await handleAddTags(arguments_);
    case "removeTags":
      return await handleRemoveTags(arguments_);
    case "clearUnusedTags":
      return await handleClearUnusedTags();
    case "replaceTags":
      return await handleReplaceTags(arguments_);
    case "replaceTagsInAllNotes":
      return await handleReplaceTagsInAllNotes(arguments_);
      
    // Media operations
    case "storeMediaFile":
      return await handleStoreMediaFile(arguments_);
    case "retrieveMediaFile":
      return await handleRetrieveMediaFile(arguments_);
    case "getMediaFilesNames":
      return await handleGetMediaFilesNames(arguments_);
    case "getMediaDirPath":
      return await handleGetMediaDirPath();
    case "deleteMediaFile":
      return await handleDeleteMediaFile(arguments_);
      
    // GUI operations
    case "guiBrowse":
      return await handleGuiBrowse(arguments_);
    case "guiSelectCard":
      return await handleGuiSelectCard(arguments_);
    case "guiSelectedNotes":
      return await handleGuiSelectedNotes();
    case "guiAddCards":
      return await handleGuiAddCards(arguments_);
    case "guiEditNote":
      return await handleGuiEditNote(arguments_);
    case "guiCurrentCard":
      return await handleGuiCurrentCard();
    case "guiStartCardTimer":
      return await handleGuiStartCardTimer();
    case "guiShowQuestion":
      return await handleGuiShowQuestion();
    case "guiShowAnswer":
      return await handleGuiShowAnswer();
    case "guiAnswerCard":
      return await handleGuiAnswerCard(arguments_);
    case "guiUndo":
      return await handleGuiUndo();
    case "guiDeckBrowser":
      return await handleGuiDeckBrowser();
    case "guiDeckOverview":
      return await handleGuiDeckOverview(arguments_);
    case "guiDeckReview":
      return await handleGuiDeckReview(arguments_);
    case "guiImportFile":
      return await handleGuiImportFile(arguments_);
    case "guiExitAnki":
      return await handleGuiExitAnki();
    case "guiCheckDatabase":
      return await handleGuiCheckDatabase();
    
    // Stats operations
    case "getNumCardsReviewedToday":
      return await handleGetNumCardsReviewedToday();
    case "getNumCardsReviewedByDay":
      return await handleGetNumCardsReviewedByDay();
    case "getCollectionStatsHTML":
      return await handleGetCollectionStatsHTML(arguments_);
    case "cardReviews":
      return await handleCardReviews(arguments_);
    case "getReviewsOfCards":
      return await handleGetReviewsOfCards(arguments_);
    case "getLatestReviewID":
      return await handleGetLatestReviewID(arguments_);
    case "insertReviews":
      return await handleInsertReviews(arguments_);
    
    // System operations
    case "requestPermission":
      return await handleRequestPermission();
    case "version":
      return await handleVersion();
    case "apiReflect":
      return await handleApiReflect(arguments_);
    case "sync":
      return await handleSync();
    case "getProfiles":
      return await handleGetProfiles();
    case "getActiveProfile":
      return await handleGetActiveProfile();
    case "loadProfile":
      return await handleLoadProfile(arguments_);
    case "multi":
      return await handleMulti(arguments_);
    case "exportPackage":
      return await handleExportPackage(arguments_);
    case "importPackage":
      return await handleImportPackage(arguments_);
    case "reloadCollection":
      return await handleReloadCollection();
    
    default:
      throw new McpError(ErrorCode.ToolNotFound, `Tool not found: ${toolName}`);
  }
}
