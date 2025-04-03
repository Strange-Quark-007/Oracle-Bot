import { ApplicationCommandOptionType } from 'discord.js';

export const COMMANDS = {
  ping: {
    name: 'ping',
    description: `Get the bot's latency`,
  },
  schedule: {
    name: 'schedule',
    description: `Schedule the reminder`,
  },
  'get-schedule-date': {
    name: 'get-schedule-date',
    description: 'Get schedule date',
  },
  'reset-schedule': {
    name: 'reset-schedule',
    description: 'Reset Schedule Time',
  },
  stop: {
    name: 'stop',
    description: 'Stop reminders',
  },
  'list-languages': {
    name: 'list-languages',
    description: 'Lists the languages supported for `/translate` command',
  },
  translate: {
    name: 'translate',
    description: 'Translates text to the language specified. Use `/list-languages` to get list of supported languages',
    options: [
      {
        name: 'to',
        description: 'The language you want to translate the text to. (Case Sensitive - please refer the list)',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'text',
        description: 'Text to translate',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
