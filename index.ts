import { Client } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { CommandManager } from './commands';
import { DBService } from './database';
import { tagRole } from './utils';

dotenv.config()


const days = [
    'ВОСКРЕСЕНЬЕ',
    'ПОНЕДЕЛЬНИК',
    'ВТОРНИК',
    'СРЕДА',
    'ЧЕТВЕРГ',
    'ПЯТНИЦА',
    'СУББОТА',
];
const days_imgs = [
    'img/6.jpg',
    'img/0.jpg',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
];


const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
    ],
});
let commandManager: CommandManager;
const dbService = new DBService();

client.on('ready', async () => {
    const testRun = process.env.TEST_RUN === 'true';
    await dbService.init();

    if (!testRun) {
        const task = cron.schedule('0 10 * * *', async (now) => {
            console.log('Job');
            for (const [snowflake, guild] of client.guilds.cache) {
                const settings = await dbService.find(guild);
                if (!settings?.dailyDayNotify)
                    continue;

                const { enabled, channelToNotify, roleTag } = settings.dailyDayNotify;
                if (enabled) {
                    const content = roleTag
                        ? `${tagRole(roleTag, guild.roles.everyone.id)}\n` +
                          `СЕГОДНЯ ${days[now.getDay()]}`
                        : `СЕГОДНЯ ${days[now.getDay()]}`;
                    const files = [days_imgs[now.getDay()]];

                    const channel = channelToNotify
                        ? guild.channels.cache.get(channelToNotify)
                        : guild.systemChannel;
                    if (channel?.isText()) {
                        await channel.send({ content, files });
                    }
                }
            }
        }, {
            timezone: 'Europe/Moscow',
        });
    } else {
        await client.guilds.fetch();
        const guild = client.guilds.cache.get(process.env.TEST_GUILD!);
        console.log(guild ? await dbService.find(guild) : undefined);

        if (guild) {
            const task = cron.schedule('* * * * *', async (now) => {
                console.log('Job');
                const settings = await dbService.find(guild);
                if (!settings?.dailyDayNotify)
                    return;

                const { enabled, channelToNotify, roleTag } = settings.dailyDayNotify;
                if (enabled) {
                    const content = roleTag
                        ? `${tagRole(roleTag, guild.roles.everyone.id)}\n` +
                          `СЕГОДНЯ ${days[now.getDay()]}`
                        : `СЕГОДНЯ ${days[now.getDay()]}`;
                    const files = [days_imgs[now.getDay()]];

                    const channel = channelToNotify
                        ? guild.channels.cache.get(channelToNotify)
                        : guild.systemChannel;
                    if (channel?.isText()) {
                        await channel.send({ content, files });
                    }
                }
            }, {
                timezone: 'Europe/Moscow',
            });
        }
    }

    commandManager = new CommandManager(client, dbService, testRun);
    await commandManager.syncCommands();

    console.log('Bot is ready');
});

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }

    console.log({ message: message.content });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    commandManager.handle(interaction);
});


client.login(process.env.TOKEN)
