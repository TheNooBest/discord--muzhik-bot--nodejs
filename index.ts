import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { CommandManager } from './commands';

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
const commandManager = new CommandManager();


client.on('ready', () => {
    const task = cron.schedule('0 10 * * *', async (now) => {
        for (const [snowflake, guild] of client.guilds.cache) {
            await guild.systemChannel?.send({
                content: `СЕГОДНЯ ${days[now.getDay()]}`,
                files: [days_imgs[now.getDay()]],
            });
        }
    }, {
        timezone: 'Europe/Moscow',
    });
    
    for (const [snowflake, cmd] of client.application?.commands.cache ?? []) {
        cmd.delete();
    }

    for (const [cmdName, cmd] of commandManager.commandsMap) {
        client.application?.commands.create(cmd.commandData);
    }

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
