import path from 'path';
import dotenv from 'dotenv';

import { EnvConfig, ServerConfig } from './types/types';

dotenv.config();

export const envConfig: EnvConfig = {
  TOKEN: process.env.BOT_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
};

/**
 * Server configuration for registering command & sending the notification
 */
export const serverConfig: ServerConfig = {
  GUILD_ID: process.env.GUILD_ID || '',
  NOTIFICATION_CHANNEL_ID: process.env.NOTIFICATION_CHANNEL_ID || '',
};

export const STATS_DIR = './statistics';
export const TOTAL_STATS_FILE = path.join(STATS_DIR, 'total-stats.json');
