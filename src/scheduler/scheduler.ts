import fs from 'fs'
import cron from 'node-cron'
import { logger } from '../logger/logger'
import { Client, EmbedBuilder, TextChannel } from 'discord.js'

const SCHEDULE_FILE = './src/scheduler/schedule.json'
let scheduledTask: cron.ScheduledTask

export const getFormattedScheduleDate = (guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  const nextScheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID)

  if (nextScheduledDate) {
    const istDate = nextScheduledDate.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const usDate = nextScheduledDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const embed = new EmbedBuilder()
      .setTitle('Scheduled Message')
      .setDescription(`The next scheduled message is as follows:`)
      .addFields({ name: 'IST', value: istDate, inline: false })
      .addFields({ name: 'US ET', value: usDate, inline: false })
      .setColor('#3498DB')
      .setTimestamp()
      .setFooter({ text: 'Bot Scheduler' })
    return embed
  } else {
    return new EmbedBuilder()
      .setTitle('No Schedule Set')
      .setDescription('No schedule is set.')
      .setColor('#3498DB')
      .setTimestamp()
      .setFooter({ text: 'Bot Scheduler' })
  }
}

export const sendScheduledDate = async (
  client: Client,
  guildId: string,
  channelId: string,
  NOTIFICATION_CHANNEL_ID: string
) => {
  const channel = client.channels.cache.get(channelId)
  if (channel) {
    const messageEmbed = getFormattedScheduleDate(guildId, NOTIFICATION_CHANNEL_ID)
    await (channel as TextChannel).send({ embeds: [messageEmbed] })
  } else {
    console.error('Channel not found!')
  }
}

const loadScheduleState = (guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  try {
    if (fs.existsSync(SCHEDULE_FILE)) {
      const data = fs.readFileSync(SCHEDULE_FILE, 'utf-8')
      const json = JSON.parse(data)
      const scheduledDate = json?.[guildId]?.[NOTIFICATION_CHANNEL_ID]
      return scheduledDate ? new Date(scheduledDate) : null
    } else {
      const data = JSON.stringify({})
      fs.writeFileSync(SCHEDULE_FILE, data, 'utf-8')
      return null
    }
  } catch (error) {
    console.error('Error loading schedule state:', error)
    logger(error)
    return null
  }
}

const saveScheduleState = (guildId: string, NOTIFICATION_CHANNEL_ID: string, nextScheduledDate: Date) => {
  let data: any = {}
  let dateObj: any = {}

  if (fs.existsSync(SCHEDULE_FILE)) {
    const fileContent = fs.readFileSync(SCHEDULE_FILE, 'utf-8')
    data = JSON.parse(fileContent)
  }

  dateObj[NOTIFICATION_CHANNEL_ID] = nextScheduledDate.toISOString()

  data[guildId] = dateObj
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export const scheduleNextMessage = (client: Client, guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  const lastScheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID)
  const now = new Date()

  if (scheduledTask) {
    scheduledTask.stop()
  }

  let nextScheduledDate = lastScheduledDate ? new Date(lastScheduledDate) : now
  nextScheduledDate.setHours(21, 25, 0, 0) // 9:25 PM

  if (now >= nextScheduledDate) {
    nextScheduledDate.setDate(nextScheduledDate.getDate() + 1)
  }
  saveScheduleState(guildId, NOTIFICATION_CHANNEL_ID, nextScheduledDate)

  scheduledTask = cron.schedule(
    '25 21 * * *',
    async () => {
      const nowTime = new Date()
      const scheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID)
      if (nowTime.getDate() === scheduledDate?.getDate() && nowTime.getMonth() === scheduledDate?.getMonth()) {
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID)
        if (channel) {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 2)
          saveScheduleState(guildId, NOTIFICATION_CHANNEL_ID, nextScheduledDate)
          await (channel as TextChannel).send(`@everyone Trap in 5 mins`)
        } else {
          console.error('Channel not found!')
          deleteScheduledData(guildId)
        }
      } else {
        console.info('Skipping today', nowTime.toDateString())
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    }
  )
}

export const resetSchedule = (client: Client, guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  if (scheduledTask) {
    scheduledTask.stop()
  }
  scheduleNextMessage(client, guildId, NOTIFICATION_CHANNEL_ID)
}

export const stopSchedule = (guildId: string) => {
  if (scheduledTask) {
    scheduledTask.stop()
  }
  deleteScheduledData(guildId)
}

export const deleteScheduledData = (guildId: string) => {
  if (fs.existsSync(SCHEDULE_FILE)) {
    const data = fs.readFileSync(SCHEDULE_FILE, 'utf-8')
    const dateObj = JSON.parse(data)
    delete dateObj[guildId]
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(dateObj, null, 2), 'utf-8')
  }
}
