import fs from 'fs';
import cron from 'node-cron';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

import { logger } from '../logger/logger';

const SCHEDULE_FILE = './src/scheduler/schedule.json';
let scheduledTask925PM: cron.ScheduledTask;
let scheduledTask9PM: cron.ScheduledTask;
const cronOptions = { scheduled: true, timezone: 'Asia/Kolkata' };

export const getFormattedScheduleDate = (guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  const nextScheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID);

  if (!nextScheduledDate) {
    return new EmbedBuilder()
      .setTitle('No Schedule Set')
      .setDescription('No schedule is set.')
      .setColor('#3498DB')
      .setTimestamp()
      .setFooter({ text: 'Bot Scheduler' });
  }

  const istDate = nextScheduledDate.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const usDate = nextScheduledDate.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return new EmbedBuilder()
    .setTitle('Scheduled Message')
    .setDescription(`The next scheduled message is as follows:`)
    .addFields({ name: 'IST', value: istDate, inline: false })
    .addFields({ name: 'US ET', value: usDate, inline: false })
    .setColor('#3498DB')
    .setTimestamp()
    .setFooter({ text: 'Bot Scheduler' });
};

export const sendScheduledDate = async (
  client: Client,
  guildId: string,
  channelId: string,
  NOTIFICATION_CHANNEL_ID: string,
) => {
  const channel = client.channels.cache.get(channelId);
  if (channel) {
    const messageEmbed = getFormattedScheduleDate(guildId, NOTIFICATION_CHANNEL_ID);
    await (channel as TextChannel).send({ embeds: [messageEmbed] });
  } else {
    console.error('Channel not found!');
  }
};

const loadScheduleState = (guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  try {
    if (!fs.existsSync(SCHEDULE_FILE)) {
      const data = JSON.stringify({});
      fs.writeFileSync(SCHEDULE_FILE, data, 'utf-8');
      return null;
    }
    const data = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    const json = JSON.parse(data);
    const scheduledDate = json?.[guildId]?.[NOTIFICATION_CHANNEL_ID];
    return scheduledDate ? new Date(scheduledDate) : null;
  } catch (error) {
    console.error('Error loading schedule state:', error);
    logger(error);
    return null;
  }
};

const saveScheduleState = (guildId: string, NOTIFICATION_CHANNEL_ID: string, nextScheduledDate: Date) => {
  let data: any = {};
  let dateObj: any = {};
  const fileContent = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
  data = JSON.parse(fileContent);
  dateObj[NOTIFICATION_CHANNEL_ID] = nextScheduledDate.toISOString();
  data[guildId] = dateObj;
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export const scheduleNextMessage = (client: Client, guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  const lastScheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID);
  const now = new Date();

  if (scheduledTask9PM) {
    scheduledTask9PM.stop();
  }
  if (scheduledTask925PM) {
    scheduledTask925PM.stop();
  }

  let nextScheduledDate = lastScheduledDate ? new Date(lastScheduledDate) : now;
  nextScheduledDate.setHours(21, 0, 0, 0); // 9:00 PM

  if (now >= nextScheduledDate) {
    nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
  }
  saveScheduleState(guildId, NOTIFICATION_CHANNEL_ID, nextScheduledDate);

  const handleSchedule = async (timeBeforeTrap: number) => {
    const nowTime = new Date();
    const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
    const scheduledDate = loadScheduleState(guildId, NOTIFICATION_CHANNEL_ID);

    if (nowTime.getDate() !== scheduledDate?.getDate() || nowTime.getMonth() !== scheduledDate?.getMonth()) {
      console.info('Skipping today', nowTime.toDateString());
      return;
    }

    if (!channel) {
      console.error('Channel not found!');
      logger(`Channel not found ID = ${NOTIFICATION_CHANNEL_ID}`);
      deleteScheduledData(guildId);
      return;
    }

    if (timeBeforeTrap == 5) {
      nextScheduledDate.setDate(nextScheduledDate.getDate() + 2);
      saveScheduleState(guildId, NOTIFICATION_CHANNEL_ID, nextScheduledDate);
      logger(`Next Scheduled Date ${nextScheduledDate.toISOString()}`);
    }

    await (channel as TextChannel).send(`@everyone Trap in ${timeBeforeTrap} mins`);
  };

  scheduledTask9PM = cron.schedule('0 21 * * *', () => handleSchedule(30), cronOptions);
  scheduledTask925PM = cron.schedule('25 21 * * *', () => handleSchedule(5), cronOptions);
};

export const resetSchedule = (client: Client, guildId: string, NOTIFICATION_CHANNEL_ID: string) => {
  if (scheduledTask9PM) {
    scheduledTask9PM.stop();
  }
  if (scheduledTask925PM) {
    scheduledTask925PM.stop();
  }
  scheduleNextMessage(client, guildId, NOTIFICATION_CHANNEL_ID);
};

export const stopSchedule = (guildId: string) => {
  if (scheduledTask925PM) {
    scheduledTask925PM.stop();
  }
  if (scheduledTask9PM) {
    scheduledTask9PM.stop();
  }
  deleteScheduledData(guildId);
};

export const deleteScheduledData = (guildId: string) => {
  if (fs.existsSync(SCHEDULE_FILE)) {
    const data = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    const dateObj = JSON.parse(data);
    delete dateObj[guildId];
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(dateObj, null, 2), 'utf-8');
  }
};
