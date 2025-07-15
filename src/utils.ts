export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }
}

export function getChannelTypeDescription(type: number | string): string {
  const types: { [key: string]: string } = {
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
    GUILD_TEXT: 'Text Channel',
    DM: 'DM',
    GUILD_VOICE: 'Voice Channel',
    GROUP_DM: 'Group DM',
    GUILD_CATEGORY: 'Category',
    GUILD_NEWS: 'News Channel',
    GUILD_NEWS_THREAD: 'News Thread',
    GUILD_PUBLIC_THREAD: 'Public Thread',
    GUILD_PRIVATE_THREAD: 'Private Thread',
    GUILD_STAGE_VOICE: 'Stage Voice',
    GUILD_FORUM: 'Forum Channel',
  }
  return types[String(type)] || `Unknown (${type})`
}

export function createMCPResponse(data: Record<string, any>) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}
