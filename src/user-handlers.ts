import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Guild, GuildMember, User } from 'discord.js-selfbot-v13';
import type { 
  DiscordClient, 
  UserData, 
  MemberData, 
  ListGuildMembersArgs,
  ExtendedUser
} from './types.js';
import { getRelativeTime, createMCPResponse } from './utils.js';

export async function getUserInfo(client: DiscordClient) {
  try {
    if (!client.user) {
      throw new Error('Client user not available');
    }

    const user = client.user as ExtendedUser;
    const userData: UserData = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      tag: user.tag,
      bot: user.bot,
      verified: user.verified,
      createdAt: user.createdTimestamp,
    };

    return createMCPResponse({
      user: userData,
      status: client.user.presence?.status || 'unknown',
      guildCount: client.guilds.cache.size,
      channelCount: client.channels.cache.size,
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get user info: ${error}`
    );
  }
}

export async function listGuildMembers(client: DiscordClient, args: ListGuildMembersArgs) {
  const { guildId, limit = 100, includeRoles = false } = args;
  const maxLimit = Math.min(limit, 1000);

  try {
    const guild = client.guilds.cache.get(guildId) as Guild;
    if (!guild) {
      throw new Error('Guild not found');
    }

    const members = await guild.members.fetch({ limit: maxLimit });
    
    const memberData: MemberData[] = Array.from(members.values())
      .map((member: GuildMember) => {
        const memberInfo: MemberData = {
          id: member.user.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          tag: member.user.tag,
          displayName: member.displayName,
          nickname: member.nickname || undefined,
          bot: member.user.bot,
          joinedAt: member.joinedTimestamp || 0,
          joinedAtRelative: getRelativeTime(member.joinedTimestamp || 0),
          status: member.presence?.status || 'offline',
        };

        if (includeRoles) {
          memberInfo.roles = Array.from(member.roles.cache.values())
            .filter(role => role.id !== guild.id)
            .map(role => ({
              id: role.id,
              name: role.name,
              color: role.hexColor,
              position: role.position,
            }))
            .sort((a, b) => b.position - a.position);
        }

        return memberInfo;
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return createMCPResponse({
      guild: {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
      },
      totalMembers: memberData.length,
      includeRoles: includeRoles,
      members: memberData,
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to list guild members: ${error}`
    );
  }
} 