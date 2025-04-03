import express from 'express';
import cors from 'cors';
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
  Partials,
  EmbedBuilder,
  TextChannel,
  PresenceUpdateStatus,
} from 'discord.js';

import { envConfig, serverConfig, TOTAL_STATS_FILE } from './config';
import { COMMANDS } from './constants/commands';
import { EMOJI_MAP, LANGUAGE_CHOICES } from './constants/constants';
import { GET_LANGUAGE_LIST_DESC, translateText } from './translate/translate';
import { logger } from './logger/logger';
import statsRoute from './apis/statsRoute';
import { readStats } from './stats/stats';
import {
  getFormattedScheduleDate,
  sendScheduledDate,
  scheduleNextMessage,
  resetSchedule,
  stopSchedule,
} from './scheduler/scheduler';

const { TOKEN, CLIENT_ID } = envConfig;
const { GUILD_ID, NOTIFICATION_CHANNEL_ID } = serverConfig;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [
        COMMANDS.schedule,
        COMMANDS.stop,
        COMMANDS.stats,
        COMMANDS['reset-schedule'],
        COMMANDS['get-schedule-date'],
      ],
    });
  } catch (error) {
    console.error(error);
  }
})();

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [COMMANDS.ping, COMMANDS.stats, COMMANDS['list-languages'], COMMANDS.translate],
    });
  } catch (error) {
    console.error(error);
    logger(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  scheduleNextMessage(client, GUILD_ID, NOTIFICATION_CHANNEL_ID);
  client.user?.setPresence({
    activities: [
      {
        name: 'Oracle',
        type: ActivityType.Watching,
        state: '🔮 Translating your messages',
      },
    ],
    status: PresenceUpdateStatus.Online,
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, guild, channel } = interaction;

  if (!guild || !channel) {
    await interaction.reply('Guild or channel information is missing.');
    return;
  }

  switch (commandName) {
    case COMMANDS.ping.name:
      const latency = Date.now() - interaction.createdTimestamp;
      await interaction.reply(`Pong! Latency is ${latency}ms.`);
      break;

    case COMMANDS.schedule.name:
      scheduleNextMessage(client, guild?.id, NOTIFICATION_CHANNEL_ID);
      await interaction.reply('Event Scheduled');
      sendScheduledDate(client, guild?.id, channel?.id, NOTIFICATION_CHANNEL_ID);
      break;

    case COMMANDS['get-schedule-date'].name:
      const messageEmbed = getFormattedScheduleDate(guild?.id, NOTIFICATION_CHANNEL_ID);
      await interaction.reply({ embeds: [messageEmbed] });
      break;

    case COMMANDS['reset-schedule'].name:
      resetSchedule(client, guild?.id, NOTIFICATION_CHANNEL_ID);
      await interaction.reply('The schedule has been reset.');
      sendScheduledDate(client, guild?.id, channel?.id, NOTIFICATION_CHANNEL_ID);
      break;

    case COMMANDS.stop.name:
      stopSchedule(guild?.id);
      await interaction.reply('The schedule has been stopped.');
      break;

    case COMMANDS.stats.name:
      await interaction.deferReply();
      const totalStats = readStats(TOTAL_STATS_FILE);

      const statsEmbed = new EmbedBuilder()
        .setAuthor({
          name: client.user?.username || '',
          iconURL: client.user?.displayAvatarURL(),
        })
        .setTitle('**🔮 Oracle Translation Stats**')
        .setColor('#ff00ff')
        .addFields(
          { name: '', value: '' },
          { name: '🔠 Characters', value: `**${totalStats.totalCharacters.toLocaleString()}**` },
          { name: '', value: '' },
          { name: '📝 Words', value: `**${totalStats.totalWords.toLocaleString()}**` },
          { name: '', value: '' },
          { name: '🌐 Translations', value: `**${totalStats.totalTranslations.toLocaleString()}**` },
          { name: '', value: '' },
        )
        .setFooter({
          text: `Requested by ${interaction.user.globalName}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [statsEmbed] });
      break;

    case COMMANDS['list-languages'].name:
      await interaction.deferReply();
      const listEmbed = new EmbedBuilder()
        .setAuthor({
          name: client.user?.username || '',
          iconURL: client.user?.displayAvatarURL(),
        })
        .setTitle('Languages supported')
        .setDescription(GET_LANGUAGE_LIST_DESC())
        .setColor('#ff00ff');
      await interaction.editReply({ embeds: [listEmbed] });
      break;

    case COMMANDS.translate.name:
      await interaction.deferReply();
      const toOption = interaction.options.get('to')?.value?.toString() ?? '';
      const toLang = LANGUAGE_CHOICES[toOption];
      if (!toLang) {
        await interaction.editReply(
          'No such Language exists or language is not supported.\n Please verify complete language name or try other language',
        );
        return;
      }
      const message = interaction.options.get('text')?.value?.toString() ?? '';
      const translatedText = await translateText(message, 'auto', toLang);
      const translation = translatedText?.translation ?? 'error';
      const translateMessageEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.client.user.username || 'Author',
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setDescription(translation)
        .setColor('#ff00ff')
        .setFooter({
          text: `Requested by ${interaction.user.globalName}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [translateMessageEmbed] });
      break;
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    const emojiName = reaction?.emoji?.name;
    const language = emojiName && EMOJI_MAP?.[emojiName]?.langs[0];
    const channel = reaction?.message?.channel;

    if (user?.bot) return;
    if (!language) return;

    await reaction.fetch();

    const isEmbedMessage = reaction.message.embeds.length > 0;
    if (isEmbedMessage) {
      await (channel as TextChannel).send('Cannot Translate Embeds');
      return;
    }
    const message = reaction?.message?.content || '';
    const author = reaction?.message?.author;
    const name = author?.bot ? author.username : author?.globalName || author?.username;
    const translatedText = await translateText(message, 'auto', language);
    const translation = translatedText?.translation ?? 'error';
    const translatedTextEmbed = new EmbedBuilder()
      .setAuthor({ name: name || 'Author', iconURL: author?.displayAvatarURL() })
      .setDescription(translation)
      .setFooter({ text: `Requested by ${user?.globalName || user?.username}`, iconURL: user?.displayAvatarURL() })
      .setColor('#ff00ff')
      .setTimestamp();
    (channel as TextChannel).send({ embeds: [translatedTextEmbed] });
  } catch (error) {
    logger(error);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content.includes('@here')) return;
  if (message.mentions.has(client?.user || '', { ignoreRoles: true, ignoreEveryone: true })) {
    message.reply(
      `Hello! 🔮 I’m Oracle, mystical translator & keeper of languages.\nReact with a country's flag on any message, and I’ll unveil its translation.`,
    );
  }
});

client.login(TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/stats', statsRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
