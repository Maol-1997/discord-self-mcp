import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { Channel, TextChannel, Message } from 'discord.js-selfbot-v13';
import type { 
  DiscordClient, 
  MessageData, 
  ReadChannelArgs, 
  SearchMessagesArgs, 
  SendMessageArgs,
  FetchMessagesOptions,
  SendMessageOptions
} from './types.js';
import { getRelativeTime, createMCPResponse } from './utils.js';

export async function readChannel(client: DiscordClient, args: ReadChannelArgs) {
  const { channelId, limit = 50 } = args;
  const maxLimit = Math.min(limit, 100);

  try {
    const channel = await client.channels.fetch(channelId) as Channel;
    
    if (!channel || !channel.isText()) {
      throw new Error('Channel not found or not a text channel');
    }

    const textChannel = channel as TextChannel;
    const messages = await textChannel.messages.fetch({ limit: maxLimit });
    
    const messageData: MessageData[] = Array.from(messages.values())
      .map((msg: Message) => ({
        id: msg.id,
        author: {
          id: msg.author.id,
          username: msg.author.username,
          discriminator: msg.author.discriminator,
        },
        content: msg.content,
        timestamp: msg.createdTimestamp,
        relativeTime: getRelativeTime(msg.createdTimestamp),
        attachments: Array.from(msg.attachments.values()).map((att) => ({
          name: att.name || 'unknown',
          url: att.url,
          size: att.size,
        })),
        embeds: msg.embeds.map((embed) => ({
          title: embed.title || undefined,
          description: embed.description || undefined,
          url: embed.url || undefined,
          fields: embed.fields || [],
        })),
      }))
      .reverse();

    return createMCPResponse({
      channel: {
        id: channel.id,
        name: textChannel.name || 'DM',
        type: channel.type,
      },
      messages: messageData,
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to read channel: ${error}`
    );
  }
}

export async function searchMessages(client: DiscordClient, args: SearchMessagesArgs) {
  const { channelId, query, authorId, limit = 100, before, after } = args;
  const maxLimit = Math.min(limit, 500);

  try {
    const channel = await client.channels.fetch(channelId) as Channel;
    
    if (!channel || !channel.isText()) {
      throw new Error('Channel not found or not a text channel');
    }

    const textChannel = channel as TextChannel;
    const fetchOptions: FetchMessagesOptions = { limit: maxLimit };
    if (before) fetchOptions.before = before;
    if (after) fetchOptions.after = after;

    let messages = await textChannel.messages.fetch(fetchOptions);
    
    if (authorId) {
      messages = messages.filter((msg) => msg.author.id === authorId);
    }

    if (query) {
      messages = messages.filter((msg) => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    const messageData: MessageData[] = Array.from(messages.values())
      .map((msg: Message) => ({
        id: msg.id,
        author: {
          id: msg.author.id,
          username: msg.author.username,
          discriminator: msg.author.discriminator,
        },
        content: msg.content,
        timestamp: msg.createdTimestamp,
        relativeTime: getRelativeTime(msg.createdTimestamp),
        attachments: Array.from(msg.attachments.values()).map((att) => ({
          name: att.name || 'unknown',
          url: att.url,
          size: att.size,
        })),
        embeds: msg.embeds.map((embed) => ({
          title: embed.title || undefined,
          description: embed.description || undefined,
          url: embed.url || undefined,
          fields: embed.fields || [],
        })),
      }))
      .reverse();

    return createMCPResponse({
      channel: {
        id: channel.id,
        name: textChannel.name || 'DM',
        type: channel.type,
      },
      searchQuery: query,
      authorFilter: authorId,
      totalResults: messageData.length,
      messages: messageData,
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search messages: ${error}`
    );
  }
}

export async function sendMessage(client: DiscordClient, args: SendMessageArgs) {
  const { channelId, content, replyToMessageId } = args;

  try {
    const channel = await client.channels.fetch(channelId) as Channel;
    
    if (!channel || !channel.isText()) {
      throw new Error('Channel not found or cannot send messages to this channel');
    }

    const textChannel = channel as TextChannel;
    let sentMessage: Message;

    if (replyToMessageId) {
      const replyMessage = await textChannel.messages.fetch(replyToMessageId);
      if (!replyMessage) {
        throw new Error('Reply message not found');
      }
      
      sentMessage = await replyMessage.reply(content);
    } else {
      sentMessage = await textChannel.send(content);
    }

    return createMCPResponse({
      success: true,
      messageId: sentMessage.id,
      channelId: channelId,
      content: content,
      timestamp: sentMessage.createdTimestamp,
      replyTo: replyToMessageId || null
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to send message: ${error}`
    );
  }
} 