import type { Client } from 'discord.js-selfbot-v13';

export interface DiscordClient extends Client {}

export interface MessageData {
  id: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
  };
  content: string;
  timestamp: number;
  relativeTime: string;
  attachments: AttachmentData[];
  embeds: EmbedData[];
}

export interface AttachmentData {
  name: string;
  url: string;
  size: number;
}

export interface EmbedData {
  title?: string;
  description?: string;
  url?: string;
  fields?: EmbedField[];
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface ChannelData {
  id: string;
  name: string;
  type: number | string;
  typeDescription: string;
  guildName?: string;
  guildId?: string;
  position?: number;
}

export interface GuildData {
  id: string;
  name: string;
  memberCount: number;
  owner: boolean;
  joinedAt: number;
}

export interface MemberData {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
  displayName: string;
  nickname?: string;
  bot: boolean;
  joinedAt: number;
  joinedAtRelative: string;
  roles?: RoleData[];
  status: string;
}

export interface RoleData {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface UserData {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
  bot: boolean;
  verified?: boolean;
  createdAt: number;
}

export interface MCPResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface ReadChannelArgs {
  channelId: string;
  limit?: number;
}

export interface SearchMessagesArgs {
  channelId: string;
  query?: string;
  authorId?: string;
  limit?: number;
  before?: string;
  after?: string;
}

export interface SendMessageArgs {
  channelId: string;
  content: string;
  replyToMessageId?: string;
}

export interface ListChannelsArgs {
  guildId?: string;
}

export interface ListGuildMembersArgs {
  guildId: string;
  limit?: number;
  includeRoles?: boolean;
}

export interface FetchMessagesOptions {
  limit?: number;
  before?: string;
  after?: string;
}

export interface FetchMembersOptions {
  limit?: number;
}

export interface MessageReference {
  messageId?: string;
  channelId?: string;
  guildId?: string;
  failIfNotExists?: boolean;
}

export interface SendMessageOptions {
  content: string;
  reply?: {
    messageReference: MessageReference;
  };
}

export interface ExtendedUser {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
  bot: boolean;
  verified?: boolean;
  createdTimestamp: number;
}

export interface ExtendedChannel {
  id: string;
  type: number | string;
  name?: string;
  position?: number;
  guild?: {
    id: string;
    name: string;
  };
}

export interface DiscordAttachment {
  name: string;
  url: string;
  size: number;
} 