#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'discord.js-selfbot-v13';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN not found in environment variables');
  console.error('Please configure DISCORD_TOKEN in your MCP client settings');
  console.error('Example configuration:');
  console.error(JSON.stringify({
    "mcpServers": {
      "discord": {
        "command": "npx",
        "args": ["-y", "discord-self-mcp"],
        "env": {
          "DISCORD_TOKEN": "your_discord_token_here"
        }
      }
    }
  }, null, 2));
  process.exit(1);
}

class DiscordMCPServer {
  private server: Server;
  private client: Client;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.server = new Server(
      {
        name: 'discord-self-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = new Client();
    this.readyPromise = this.connectDiscord();

    this.setupHandlers();
  }

  private async connectDiscord(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        console.error(`Discord connected as ${this.client.user?.tag}`);
        this.isReady = true;
        resolve();
      });

      this.client.login(DISCORD_TOKEN).catch((error) => {
        console.error('Failed to connect to Discord:', error);
        reject(error);
      });

      // Timeout después de 30 segundos
      setTimeout(() => {
        if (!this.isReady) {
          reject(new Error('Discord connection timeout'));
        }
      }, 30000);
    });
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Esperar a que Discord esté listo antes de procesar cualquier solicitud
      if (!this.isReady) {
        try {
          await this.readyPromise;
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Discord connection failed: ${error}`
          );
        }
      }

      switch (request.params.name) {
        case 'read_channel':
          return await this.readChannel(request.params.arguments);
        case 'list_channels':
          return await this.listChannels(request.params.arguments);
        case 'list_guilds':
          return await this.listGuilds();
        case 'get_user_info':
          return await this.getUserInfo();
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async readChannel(args: any) {
    const { channelId, limit = 50 } = args;
    const maxLimit = Math.min(limit, 100);

    try {
      const channel = await this.client.channels.fetch(channelId);
      
      if (!channel || !('messages' in channel)) {
        throw new Error('Channel not found or not a text channel');
      }

      const messages = await (channel as any).messages.fetch({ limit: maxLimit });
      
      const messageData = messages
        .map((msg: any) => ({
          id: msg.id,
          author: {
            id: msg.author.id,
            username: msg.author.username,
            discriminator: msg.author.discriminator,
          },
          content: msg.content,
          timestamp: msg.createdTimestamp,
          relativeTime: getRelativeTime(msg.createdTimestamp),
          attachments: msg.attachments.map((att: any) => ({
            name: att.name,
            url: att.url,
            size: att.size,
          })),
          embeds: msg.embeds.map((embed: any) => ({
            title: embed.title,
            description: embed.description,
            url: embed.url,
            fields: embed.fields,
          })),
        }))
        .reverse();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              channel: {
                id: channel.id,
                name: (channel as any).name || 'DM',
                type: channel.type,
              },
              messages: messageData,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read channel: ${error}`
      );
    }
  }

  private async listChannels(args: any) {
    const { guildId } = args;

    try {
      let channels: any[] = [];

      if (guildId) {
        const guild = await this.client.guilds.fetch(guildId);
        channels = Array.from(guild.channels.cache.values());
      } else {
        this.client.guilds.cache.forEach((guild) => {
          guild.channels.cache.forEach((channel) => {
            channels.push({
              ...channel,
              guildName: guild.name,
              guildId: guild.id,
            });
          });
        });
      }

      const channelData = channels
        .map((ch) => ({
          id: ch.id,
          name: ch.name,
          type: ch.type,
          typeDescription: this.getChannelTypeDescription(ch.type),
          guildName: ch.guildName || ch.guild?.name,
          guildId: ch.guildId || ch.guild?.id,
          position: ch.position,
        }))
        .sort((a, b) => a.position - b.position);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(channelData, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list channels: ${error}`
      );
    }
  }

  private getChannelTypeDescription(type: number | string): string {
    const types: { [key: string]: string } = {
      // Números (versiones anteriores)
      '0': 'Text Channel',
      '1': 'DM',
      '2': 'Voice Channel',
      '3': 'Group DM',
      '4': 'Category',
      '5': 'News Channel',
      '10': 'News Thread',
      '11': 'Public Thread',
      '12': 'Private Thread',
      '13': 'Stage Voice',
      '15': 'Forum Channel',
      // Strings (versión actual)
      'GUILD_TEXT': 'Text Channel',
      'DM': 'DM',
      'GUILD_VOICE': 'Voice Channel',
      'GROUP_DM': 'Group DM',
      'GUILD_CATEGORY': 'Category',
      'GUILD_NEWS': 'News Channel',
      'GUILD_NEWS_THREAD': 'News Thread',
      'GUILD_PUBLIC_THREAD': 'Public Thread',
      'GUILD_PRIVATE_THREAD': 'Private Thread',
      'GUILD_STAGE_VOICE': 'Stage Voice',
      'GUILD_FORUM': 'Forum Channel'
    };
    return types[String(type)] || `Unknown (${type})`;
  }

  private async listGuilds() {
    try {
      const guilds = this.client.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        owner: guild.ownerId === this.client.user?.id,
        joinedAt: guild.joinedTimestamp,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(guilds, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list guilds: ${error}`
      );
    }
  }

  private async getUserInfo() {
    try {
      const user = this.client.user;
      if (!user) {
        throw new Error('User not available');
      }

      const userInfo = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        bot: user.bot,
        verified: user.verified,
        createdAt: user.createdTimestamp,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(userInfo, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get user info: ${error}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Discord MCP server running on stdio');
  }
}

const server = new DiscordMCPServer();
server.run().catch(console.error);

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

console.log("Discord MCP Server iniciado");