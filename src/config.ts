import dotenv from 'dotenv'
import { EnvConfig, UNNConfig } from './types/types'

dotenv.config()

export const envConfig: EnvConfig = {
  TOKEN: process.env.BOT_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
}

export const unnConfig: UNNConfig = {
  GUILD_ID: '945623506169774100',
  NOTIFICATION_CHANNEL_ID: '1279085558618001518',
}
