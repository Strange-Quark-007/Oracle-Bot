export interface EnvConfig {
  TOKEN: string
  CLIENT_ID: string
}

export interface UNNConfig {
  GUILD_ID: string
  NOTIFICATION_CHANNEL_ID: string
}

export interface CountryInfo {
  code: string
  name: string
  langs: string[]
}

export interface EmojiMap {
  [key: string]: CountryInfo
}

import { Client, Embed } from 'discord.js'

export type ScheduleData = {
  [guildId: string]: {
    [channelId: string]: string
  }
}

export interface ScheduleFunctions {
  getFormattedScheduleDate(guildId: string, notificationChannelId: string): Embed
  sendScheduledDate(client: Client, guildId: string, channelId: string, notificationChannelId: string): Promise<void>
  scheduleNextMessage(client: Client, guildId: string, notificationChannelId: string): void
  resetSchedule(client: Client, guildId: string, notificationChannelId: string): void
  stopSchedule(guildId: string): void
  deleteScheduledData(guildId: string): void
}
