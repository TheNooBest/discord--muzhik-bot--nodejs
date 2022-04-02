import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()


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
    }
});

client.on('messageCreate', (message) => {
    console.log({ message: message.content });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        interaction.reply({
            content: 'pong',
            ephemeral: true,
        });
    }
});


client.login(process.env.TOKEN)
