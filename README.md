# Discord Self MCP

An MCP (Model Context Protocol) server that allows AIs to access Discord using selfbot to read messages from channels.

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

# Build
npm run build

# Configure in your MCP client with the local path
```

## Discord Token Configuration

The Discord token is passed as an environment variable from your MCP client. **DO NOT** use local .env files.

To get your Discord token:
1. Open Discord in your browser
2. Press F12 to open developer tools
3. Go to the "Network" tab
4. Look for any request to Discord's API
5. In the headers, look for "Authorization"

## Available Tools

### `read_channel`
Reads messages from a specific channel.

**Parameters:**
- `channelId` (string, required): Discord channel ID
- `limit` (number, optional): Number of messages to fetch (maximum 100, default 50)

### `list_channels`
Lists all accessible text channels.

**Parameters:**
- `guildId` (string, optional): Filter channels by server ID

### `list_guilds`
Lists all servers where the user is a member.

### `get_user_info`
Gets information about the logged-in user.

## Usage Example in Claude

Once configured, you can use commands like:

```
- "List my Discord servers"
- "Read the last 20 messages from channel [ID]"
- "Show all channels from server [ID]"
```

## Warning

This project uses selfbot, which goes against Discord's terms of service. Use it at your own risk and only for educational or personal purposes.