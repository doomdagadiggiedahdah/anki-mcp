# Anki-MCP

An MCP (Model Control Protocol) server for interacting with the Anki flashcard application through the AnkiConnect API.

## Overview

Anki-MCP provides a bridge between your LLM's and Anki. This project implements the Anki-Connect API (https://git.sr.ht/~foosoft/anki-connect) as an MCP server.

## Prerequisites

- [Anki](https://apps.ankiweb.net/) installed on your system
- [AnkiConnect plugin](https://ankiweb.net/shared/info/2055492159) installed in Anki
- Node.js (v14 or later recommended)

## Installation

1. Clone this repository
2. Install dependencies with `npm install`
3. Configure your MCP settings (below) to include the Anki-MCP server

## Configuration

Depending your MCP host, add the following to your `mcp_settings.json` file:

```json
"anki-connect": {
  "command": "node",
  "args": [
    "/path/to/anki-mcp/index.js"
  ],
  "disabled": false,
  "autoApprove": []
}
```

Replace `/path/to/anki-mcp/index.js` with the actual path to your installation.

## Usage

**Important**: Anki must be running with the AnkiConnect plugin active for this MCP server to work.

Once configured, you can use the Anki-MCP server to:
- Create and update flashcards
- Manage decks
- Query card information
- Execute all Anki operations available from [AnkiConnect plugin](https://ankiweb.net/shared/info/2055492159) 

## Available Tools

The server provides tools for all operations supported by AnkiConnect, including:
- Card actions (getEaseFactors, suspend, unsuspend, etc.)
- Deck actions (deckNames, createDeck, changeDeck, etc.)
- Note actions (addNote, updateNote, findNotes, etc.)
- Media actions (storeMediaFile, retrieveMediaFile, etc.)
- And many more

## License

[GPL-3.0](LICENSE)

## Acknowledgments

- AnkiConnect (https://git.sr.ht/~foosoft/anki-connect) for providing the API that makes this possible
- The Anki team for their incredible flashcard application
