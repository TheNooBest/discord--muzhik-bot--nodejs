import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { CommandManager } from './commands';
import { DBService } from './database';

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
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
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
                if (settings?.dailyDayNotify?.enabled) {
                    let content = `СЕГОДНЯ ${days[now.getDay()]}`;
                    const files = [days_imgs[now.getDay()]];

                    if (settings.dailyDayNotify.roleTag) {
                        const roleString = settings.dailyDayNotify.roleTag === guild.roles.everyone.id ? '@everyone' : `<@&${settings.dailyDayNotify.roleTag}>`;
                        content = `${roleString}\n` + content;
                    }

                    if (settings.dailyDayNotify.channelToNotify) {
                        const channel = guild.channels.cache.get(settings.dailyDayNotify.channelToNotify);
                        if (channel?.isText()) {
                            await channel.send({ content, files });
                        }
                    } else {
                        await guild.systemChannel?.send({ content, files });
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
                if (settings?.dailyDayNotify?.enabled) {
                    let content = `СЕГОДНЯ ${days[now.getDay()]}`;
                    const files = [days_imgs[now.getDay()]];

                    if (settings.dailyDayNotify.roleTag) {
                        const roleString = settings.dailyDayNotify.roleTag === guild.roles.everyone.id ? '@everyone' : `<@&${settings.dailyDayNotify.roleTag}>`;
                        content = `${roleString}\n` + content;
                    }

                    if (settings.dailyDayNotify.channelToNotify) {
                        const channel = guild.channels.cache.get(settings.dailyDayNotify.channelToNotify);
                        if (channel?.isText()) {
                            await channel.send({ content, files });
                        }
                    } else {
                        await guild.systemChannel?.send({ content, files });
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
