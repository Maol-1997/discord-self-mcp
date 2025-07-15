import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'
import type { Guild } from 'discord.js-selfbot-v13'
import type {
  DiscordClient,
  ChannelData,
  GuildData,
  ListChannelsArgs,
  ExtendedChannel,
} from './types.js'
import { getChannelTypeDescription, createMCPResponse } from './utils.js'

export async function listChannels(
  client: DiscordClient,
  args: ListChannelsArgs,
) {
  try {
    let channels: ChannelData[] = []

    if (args.guildId) {
      const guild = client.guilds.cache.get(args.guildId) as Guild
      if (!guild) {
        throw new Error('Guild not found')
      }

      channels = Array.from(guild.channels.cache.values())
        .map((channel) => {
          const extendedChannel = channel as ExtendedChannel
          return {
            id: extendedChannel.id,
            name: extendedChannel.name || 'Unknown',
            type: extendedChannel.type,
            typeDescription: getChannelTypeDescription(extendedChannel.type),
            guildName: guild.name,
            guildId: guild.id,
            position: extendedChannel.position || 0,
          }
        })
        .sort((a, b) => a.position - b.position)
    } else {
      channels = Array.from(client.channels.cache.values())
        .map((channel) => {
          const extendedChannel = channel as ExtendedChannel
          const guild = extendedChannel.guild
          return {
            id: extendedChannel.id,
            name: extendedChannel.name || 'DM',
            type: extendedChannel.type,
            typeDescription: getChannelTypeDescription(extendedChannel.type),
            guildName: guild?.name,
            guildId: guild?.id,
            position: extendedChannel.position || 0,
          }
        })
        .sort((a, b) => a.position - b.position)
    }

    return createMCPResponse({
      totalChannels: channels.length,
      guildFilter: args.guildId,
      channels: channels,
    })
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to list channels: ${error}`,
    )
  }
}

export async function listGuilds(client: DiscordClient) {
  try {
    const guilds: GuildData[] = Array.from(client.guilds.cache.values())
      .map((guild: Guild) => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        owner: guild.ownerId === client.user?.id,
        joinedAt: guild.joinedTimestamp || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return createMCPResponse({
      totalGuilds: guilds.length,
      guilds: guilds,
    })
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to list guilds: ${error}`,
    )
  }
}
