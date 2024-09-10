import { envConfig, unnConfig } from './config'
import { COMMANDS } from './constants/commands'
import { EMOJI_MAP } from './constants/constants'
import { translateText } from './translate/translate'
import { logger } from './logger/logger'
import { Client, GatewayIntentBits, REST, Routes, Partials, EmbedBuilder, TextChannel } from 'discord.js'
import {
  getFormattedScheduleDate,
  sendScheduledDate,
  scheduleNextMessage,
  resetSchedule,
  stopSchedule,
} from './scheduler/scheduler'

const { TOKEN, CLIENT_ID } = envConfig
const { GUILD_ID, NOTIFICATION_CHANNEL_ID } = unnConfig

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})
const rest = new REST({ version: '10' }).setToken(TOKEN)

;(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: COMMANDS,
    })
  } catch (error) {
    console.error(error)
  }
})()
;(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [COMMANDS[0]],
    })
  } catch (error) {
    console.error(error)
  }
})()

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`)
  scheduleNextMessage(client, GUILD_ID, NOTIFICATION_CHANNEL_ID)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName, guild, channel } = interaction
  const COMMANDS_NAME_LIST = COMMANDS.map((command) => command.name)

  if (!guild || !channel) {
    await interaction.reply('Guild or channel information is missing.')
    return
  }

  switch (commandName) {
    case COMMANDS_NAME_LIST[0]:
      const latency = Date.now() - interaction.createdTimestamp
      await interaction.reply(`Pong! Latency is ${latency}ms.`)
      break
    case COMMANDS_NAME_LIST[1]:
      scheduleNextMessage(client, guild?.id, NOTIFICATION_CHANNEL_ID)
      await interaction.reply('Event Scheduled')
      sendScheduledDate(client, guild?.id, channel?.id, NOTIFICATION_CHANNEL_ID)
      break
    case COMMANDS_NAME_LIST[2]:
      const messageEmbed = getFormattedScheduleDate(guild?.id, NOTIFICATION_CHANNEL_ID)
      await interaction.reply({ embeds: [messageEmbed] })
      break
    case COMMANDS_NAME_LIST[3]:
      resetSchedule(client, guild?.id, NOTIFICATION_CHANNEL_ID)
      await interaction.reply('The schedule has been reset.')
      sendScheduledDate(client, guild?.id, channel?.id, NOTIFICATION_CHANNEL_ID)
      break
    case COMMANDS_NAME_LIST[4]:
      stopSchedule(guild?.id)
      await interaction.reply('The schedule has been stopped.')
      break
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    const emojiName = reaction?.emoji?.name
    const language = emojiName && EMOJI_MAP?.[emojiName]?.langs[0]
    const channel = reaction?.message?.channel
    if (user?.bot) return
    if (!language) return
    await reaction.fetch()
    const isEmbedMessage = reaction.message.embeds.length > 0
    if (isEmbedMessage) {
      await (channel as TextChannel).send('Cannot Translate Embeds')
      return
    }
    const message = reaction?.message?.content || ''
    const author = reaction?.message?.author
    const name = author?.bot ? author.username : author?.globalName || author?.username
    const translatedText = await translateText(message, 'auto', language)
    const translation = translatedText?.translation ?? 'error'
    const translatedTextEmbed = new EmbedBuilder()
      .setAuthor({ name: name || 'Author', iconURL: author?.displayAvatarURL() })
      .setDescription(translation)
      .setFooter({ text: `Requested by ${user?.globalName || user?.username}`, iconURL: user?.displayAvatarURL() })
      .setColor('#ff00ff')
      .setTimestamp()
    ;(channel as TextChannel).send({ embeds: [translatedTextEmbed] })
  } catch (error) {
    logger(error)
  }
})

client.login(TOKEN)
