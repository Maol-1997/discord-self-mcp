import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'
import type { Channel, TextChannel, Message } from 'discord.js-selfbot-v13'
import type {
  DiscordClient,
  MessageData,
  ReadChannelArgs,
  SearchMessagesArgs,
  SendMessageArgs,
  FetchMessagesOptions,
  SendMessageOptions,
} from './types.js'
import { getRelativeTime, createMCPResponse } from './utils.js'

export async function readChannel(
  client: DiscordClient,
  args: ReadChannelArgs,
) {
  const { channelId, limit = 50 } = args
  const maxLimit = Math.min(limit, 100)

  try {
    const channel = (await client.channels.fetch(channelId)) as Channel

    if (!channel || !channel.isText()) {
      throw new Error('Channel not found or not a text channel')
    }

    const textChannel = channel as TextChannel
    const messages = await textChannel.messages.fetch({ limit: maxLimit })

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
      .reverse()

    return createMCPResponse({
      channel: {
        id: channel.id,
        name: textChannel.name || 'DM',
        type: channel.type,
      },
      messages: messageData,
    })
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to read channel: ${error}`,
    )
  }
}

export async function searchMessages(
  client: DiscordClient,
  args: SearchMessagesArgs,
) {
  const { channelId, guildId, query, authorId, limit = 100, before, after } = args
  const maxLimit = Math.min(limit, 500)

  try {
    // Validar que se proporcione channelId o guildId
    if (!channelId && !guildId) {
      throw new Error('Either channelId or guildId must be provided')
    }

    // Si se proporciona channelId, buscar en ese canal específico
    if (channelId) {
      const channel = (await client.channels.fetch(channelId)) as Channel

      if (!channel || !channel.isText()) {
        throw new Error('Channel not found or not a text channel')
      }

      const textChannel = channel as TextChannel
      const fetchOptions: FetchMessagesOptions = { limit: maxLimit }
      if (before) fetchOptions.before = before
      if (after) fetchOptions.after = after

      let messages = await textChannel.messages.fetch(fetchOptions)

      if (authorId) {
        messages = messages.filter((msg) => msg.author.id === authorId)
      }

      if (query) {
        messages = messages.filter((msg) =>
          msg.content.toLowerCase().includes(query.toLowerCase()),
        )
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
        .reverse()

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
      })
    }

    // Si se proporciona guildId, buscar en todos los canales del servidor
    if (guildId) {
      const guild = await client.guilds.fetch(guildId)
      if (!guild) {
        throw new Error('Guild not found')
      }

      const allMessages: MessageData[] = []
      const channelResults: Array<{
        channelId: string
        channelName: string
        messageCount: number
      }> = []

      // Obtener todos los canales de texto del servidor
      const textChannels = guild.channels.cache.filter(
        (channel) => channel.isText()
      )

      // Buscar en cada canal
      for (const [_, channel] of textChannels) {
        try {
          const textChannel = channel as TextChannel
          const fetchOptions: FetchMessagesOptions = { 
            limit: Math.min(maxLimit / textChannels.size, 100) // Distribuir el límite entre canales
          }
          if (before) fetchOptions.before = before
          if (after) fetchOptions.after = after

          let messages = await textChannel.messages.fetch(fetchOptions)

          if (authorId) {
            messages = messages.filter((msg) => msg.author.id === authorId)
          }

          if (query) {
            messages = messages.filter((msg) =>
              msg.content.toLowerCase().includes(query.toLowerCase()),
            )
          }

          const channelMessages = Array.from(messages.values()).map((msg: Message) => ({
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
            channelId: channel.id,
            channelName: textChannel.name,
          }))

          if (channelMessages.length > 0) {
            allMessages.push(...channelMessages)
            channelResults.push({
              channelId: channel.id,
              channelName: textChannel.name,
              messageCount: channelMessages.length,
            })
          }
        } catch (error) {
          // Ignorar errores de canales sin permisos
          console.error(`Failed to fetch messages from channel ${channel.id}: ${error}`)
        }
      }

      // Ordenar todos los mensajes por timestamp
      allMessages.sort((a, b) => a.timestamp - b.timestamp)

      return createMCPResponse({
        guild: {
          id: guild.id,
          name: guild.name,
        },
        channelResults,
        searchQuery: query,
        authorFilter: authorId,
        totalResults: allMessages.length,
        messages: allMessages,
      })
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search messages: ${error}`,
    )
  }
}

export async function sendMessage(
  client: DiscordClient,
  args: SendMessageArgs,
) {
  const { channelId, content, replyToMessageId } = args

  try {
    const channel = (await client.channels.fetch(channelId)) as Channel

    if (!channel || !channel.isText()) {
      throw new Error(
        'Channel not found or cannot send messages to this channel',
      )
    }

    const textChannel = channel as TextChannel
    let sentMessage: Message

    if (replyToMessageId) {
      const replyMessage = await textChannel.messages.fetch(replyToMessageId)
      if (!replyMessage) {
        throw new Error('Reply message not found')
      }

      sentMessage = await replyMessage.reply(content)
    } else {
      sentMessage = await textChannel.send(content)
    }

    return createMCPResponse({
      success: true,
      messageId: sentMessage.id,
      channelId: channelId,
      content: content,
      timestamp: sentMessage.createdTimestamp,
      replyTo: replyToMessageId || null,
    })
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to send message: ${error}`,
    )
  }
}
