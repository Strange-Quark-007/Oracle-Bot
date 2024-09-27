export interface EnvConfig {
  TOKEN: string
  CLIENT_ID: string
}

export interface ServerConfig {
  GUILD_ID: string
  NOTIFICATION_CHANNEL_ID: string
}

export interface CountryInfo {
  code: string
  name: string
  langs: string[]
}

export interface LanguageChoice {
  [key: string]: string
}

export interface EmojiMap {
  [key: string]: CountryInfo
}
