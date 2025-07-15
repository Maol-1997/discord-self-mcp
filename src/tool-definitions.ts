export const toolDefinitions = [
  {
    name: 'read_channel',
    description: 'Read messages from a Discord channel',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to read messages from',
        },
        limit: {
          type: 'number',
          description: 'Number of messages to fetch (default: 50, max: 100)',
          default: 50,
        },
      },
      required: ['channelId'],
    },
  },
  {
    name: 'list_channels',
    description: 'List all accessible channels for the current user',
    inputSchema: {
      type: 'object',
      properties: {
        guildId: {
          type: 'string',
          description: 'Optional: Filter channels by guild ID',
        },
      },
    },
  },
  {
    name: 'list_guilds',
    description: 'List all guilds (servers) the user is in',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_user_info',
    description: 'Get information about the logged-in user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_messages',
    description:
      'Search for messages in a Discord channel by content, author, or date range',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to search messages in',
        },
        query: {
          type: 'string',
          description: 'Text to search for in message content',
        },
        authorId: {
          type: 'string',
          description: 'Optional: Filter by author ID',
        },
        limit: {
          type: 'number',
          description:
            'Number of messages to search through (default: 100, max: 500)',
          default: 100,
        },
        before: {
          type: 'string',
          description: 'Optional: Search messages before this message ID',
        },
        after: {
          type: 'string',
          description: 'Optional: Search messages after this message ID',
        },
      },
      required: ['channelId'],
    },
  },
  {
    name: 'list_guild_members',
    description: 'List members of a specific Discord guild/server',
    inputSchema: {
      type: 'object',
      properties: {
        guildId: {
          type: 'string',
          description: 'The Discord guild ID to list members from',
        },
        limit: {
          type: 'number',
          description: 'Number of members to fetch (default: 100, max: 1000)',
          default: 100,
        },
        includeRoles: {
          type: 'boolean',
          description: 'Whether to include role information for each member',
          default: false,
        },
      },
      required: ['guildId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to a specific Discord channel',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to send the message to',
        },
        content: {
          type: 'string',
          description: 'The message content to send',
        },
        replyToMessageId: {
          type: 'string',
          description: 'Optional: Message ID to reply to',
        },
      },
      required: ['channelId', 'content'],
    },
  },
]
