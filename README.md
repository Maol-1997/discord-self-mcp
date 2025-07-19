# Discord Self MCP

An MCP (Model Context Protocol) server that allows AIs to access Discord using selfbot to read messages, manage channels, get user information, and more.

## Installation and Usage

### Option 1: Direct use with npx (no installation)

You don't need to install anything. Simply configure your MCP client with:

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-self-mcp"],
      "env": {
        "DISCORD_TOKEN": "your_discord_token_here"
      }
    }
  }
}
```

### Option 2: Global installation

```bash
npm install -g discord-self-mcp
```

Then configure your MCP client:

```json
{
  "mcpServers": {
    "discord": {
      "command": "discord-self-mcp",
      "env": {
        "DISCORD_TOKEN": "your_discord_token_here"
      }
    }
  }
}
```

### Option 3: Local development

```bash
# Clone the repository
git clone [repo-url]
cd discord-self-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Configure in your MCP client with the local path
```

## Discord Token Configuration

The Discord token is passed as an environment variable from your MCP client. **DO NOT** use local .env files.

### How to get your Discord token:

#### Method 1: Using Console Script (Recommended)

1. Open Discord in your browser
2. Press F12 to open developer tools
3. Go to the "Console" tab
4. Paste the following code and press Enter:

```javascript
window.webpackChunkdiscord_app.push([
  [Symbol()],
  {},
  (req) => {
    if (!req.c) return
    for (let m of Object.values(req.c)) {
      try {
        if (!m.exports || m.exports === window) continue
        if (m.exports?.getToken) return copy(m.exports.getToken())
        for (let ex in m.exports) {
          if (
            m.exports?.[ex]?.getToken &&
            m.exports[ex][Symbol.toStringTag] !== 'IntlMessagesProxy'
          )
            return copy(m.exports[ex].getToken())
        }
      } catch {}
    }
  },
])

window.webpackChunkdiscord_app.pop()
console.log('%cWorked!', 'font-size: 50px')
console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px')
```

5. Your token will be automatically copied to the clipboard

#### Method 2: Manual Network Inspection

1. Open Discord in your browser
2. Press F12 to open developer tools
3. Go to the "Network" tab
4. Look for any request to Discord's API
5. In the headers, look for "Authorization"

## Available Tools

### 📧 Message Management

#### `mcp_discord_read_channel`

Read messages from a Discord channel.

**Parameters:**

- `channelId` (string, required): The Discord channel ID to read messages from
- `limit` (number, optional): Number of messages to fetch (default: 50, max: 100)

#### `mcp_discord_search_messages`

Search for messages in a Discord channel or guild by content, author, or date range.

**Parameters:**

- `channelId` (string, optional): The Discord channel ID to search messages in (required if guildId not provided)
- `guildId` (string, optional): The Discord guild ID to search messages across all channels (required if channelId not provided)
- `query` (string, optional): Text to search for in message content
- `authorId` (string, optional): Optional: Filter by author ID
- `limit` (number, optional): Number of messages to search through (default: 100, max: 500)
- `before` (string, optional): Optional: Search messages before this message ID
- `after` (string, optional): Optional: Search messages after this message ID

**Note:** Either `channelId` or `guildId` must be provided. When using `guildId`, the search will be performed across all text channels in the guild.

#### `mcp_discord_send_message`

Send a message to a specific Discord channel.

**Parameters:**

- `channelId` (string, required): The Discord channel ID to send the message to
- `content` (string, required): The message content to send
- `replyToMessageId` (string, optional): Optional: Message ID to reply to

### 🏰 Guild and Channel Management

#### `mcp_discord_list_channels`

List all accessible channels for the current user.

**Parameters:**

- `guildId` (string, optional): Optional: Filter channels by guild ID

#### `mcp_discord_list_guilds`

List all guilds (servers) the user is in.

**Parameters:**

- None required

### 👥 User Management

#### `mcp_discord_get_user_info`

Get information about the logged-in user.

**Parameters:**

- None required

#### `mcp_discord_list_guild_members`

List members of a specific Discord guild/server.

**Parameters:**

- `guildId` (string, required): The Discord guild ID to list members from
- `limit` (number, optional): Number of members to fetch (default: 100, max: 1000)
- `includeRoles` (boolean, optional): Whether to include role information for each member

## Usage Examples in Claude

Once configured, you can use commands like:

### Server Management

```
- "List my Discord servers"
- "Show all channels from server [ID]"
- "How many members does server [ID] have?"
```

### Message Reading

```
- "Read the last 20 messages from channel [ID]"
- "Search for messages containing 'meeting' in channel [ID]"
- "Show messages from user [ID] in channel [ID]"
```

### Interaction

```
- "Send a message to channel [ID] saying 'Hello world'"
- "Reply to message [ID] with 'Thanks for the information'"
```

### User Information

```
- "Show my Discord information"
- "List members of server [ID] with their roles"
```

## Features

- ✅ **Message reading** with advanced filters
- ✅ **Message searching** by content, author, and date
- ✅ **Message sending** with reply support
- ✅ **Server management** and channel listing
- ✅ **User information** and member management
- ✅ **Robust error handling**
- ✅ **Complete parameter validation**
- ✅ **Relative time formatting** (e.g., "2 hours ago")
- ✅ **Support for attachments and embeds**

## Project Structure

```
src/
├── index.ts              # Main MCP server
├── types.ts              # TypeScript type definitions
├── tool-definitions.ts   # MCP tool schemas
├── message-handlers.ts   # Message handling functions
├── guild-handlers.ts     # Guild/server handling functions
├── user-handlers.ts      # User handling functions
└── utils.ts             # Common utilities
```

## Warning

This project uses selfbot, which goes against Discord's terms of service. Use it at your own risk and only for educational or personal purposes.

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-functionality`)
3. Commit your changes (`git commit -am 'feat: add new functionality'`)
4. Push to the branch (`git push origin feature/new-functionality`)
5. Open a Pull Request
