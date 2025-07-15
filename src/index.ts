#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { Client } from 'discord.js-selfbot-v13'

import { toolDefinitions } from './tool-definitions.js'
import { readChannel, searchMessages, sendMessage } from './message-handlers.js'
import { listChannels, listGuilds } from './guild-handlers.js'
import { getUserInfo, listGuildMembers } from './user-handlers.js'
import type {
  ReadChannelArgs,
  SearchMessagesArgs,
  SendMessageArgs,
  ListChannelsArgs,
  ListGuildMembersArgs,
} from './types.js'

const DISCORD_TOKEN = process.env.DISCORD_TOKEN

if (!DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN not found in environment variables')
  console.error('Please configure DISCORD_TOKEN in your MCP client settings')
  console.error('Example configuration:')
  console.error(
    JSON.stringify(
      {
        mcpServers: {
          discord: {
            command: 'npx',
            args: ['-y', 'discord-self-mcp'],
            env: {
              DISCORD_TOKEN: 'your_discord_token_here',
            },
          },
        },
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

function validateAndCastArgs<T>(
  args: Record<string, any> | null | undefined,
  expectedKeys: (keyof T)[],
): T {
  if (!args || typeof args !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments provided')
  }

  const hasRequiredKeys = expectedKeys.some((key) => key in args)
  if (!hasRequiredKeys && expectedKeys.length > 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Missing required parameters: ${expectedKeys.join(', ')}`,
    )
  }

  return args as T
}

class DiscordMCPServer {
  private server: Server
  private client: Client
  private isReady: boolean = false
  private readyPromise: Promise<void>

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
      },
    )

    this.client = new Client()
    this.readyPromise = this.connectDiscord()

    this.setupHandlers()
  }

  private async connectDiscord(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.once('ready', () => {
        console.error(`Discord client ready as ${this.client.user?.tag}`)
        this.isReady = true
        resolve()
      })

      this.client.once('error', (error) => {
        console.error('Discord client error:', error)
        reject(error)
      })

      this.client.login(DISCORD_TOKEN).catch(reject)
    })
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions,
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.isReady) {
        try {
          await this.readyPromise
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Discord connection failed: ${error}`,
          )
        }
      }

      switch (request.params.name) {
        case 'read_channel':
          return readChannel(
            this.client,
            validateAndCastArgs<ReadChannelArgs>(request.params.arguments, [
              'channelId',
            ]),
          )
        case 'search_messages':
          return searchMessages(
            this.client,
            validateAndCastArgs<SearchMessagesArgs>(request.params.arguments, [
              'channelId',
            ]),
          )
        case 'send_message':
          return sendMessage(
            this.client,
            validateAndCastArgs<SendMessageArgs>(request.params.arguments, [
              'channelId',
              'content',
            ]),
          )
        case 'list_channels':
          return listChannels(
            this.client,
            validateAndCastArgs<ListChannelsArgs>(request.params.arguments, []),
          )
        case 'list_guilds':
          return listGuilds(this.client)
        case 'get_user_info':
          return getUserInfo(this.client)
        case 'list_guild_members':
          return listGuildMembers(
            this.client,
            validateAndCastArgs<ListGuildMembersArgs>(
              request.params.arguments,
              ['guildId'],
            ),
          )
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`,
          )
      }
    })
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Discord MCP server running on stdio')
  }
}

const server = new DiscordMCPServer()
server.run().catch(console.error)

console.log('Discord MCP Server iniciado')
