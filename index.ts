import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
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


client.on('ready', () => {
    console.log('Bot is ready');

    for (const [snowflake, guild] of client.guilds.cache) {
        const commands = guild.commands;

        commands.create({
            name: 'ping',
            description: 'Reply "pong"',
        });
        commands.create({
            name: 'day',
            description: 'Get current day of week',
        });
    }
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

    const { commandName, options } = interaction;

    switch (commandName) {
        case 'ping':
            {
                try {
                    interaction.reply({
                        content: 'pong',
                        ephemeral: true,
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            break;

        case 'day':
            {
                const now = new Date();
                interaction.reply({
                    content: `СЕГОДНЯ ${days[now.getDay()]}`,
                });
            }
            break;
        
        case 'day_img':
            {
                const now = new Date();
                interaction.reply({
                    content: `СЕГОДНЯ ${days[now.getDay()]}`,
                    files: [days_imgs[now.getDay()]],
                });
            }
            break;
    }
});


client.login(process.env.TOKEN)
