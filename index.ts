import { Client } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';

import { CommandManager } from '@command-manager';
import { DBService } from '@database';
import { tagRole } from './utils';

import { createAudioPlayer, createAudioResource, joinVoiceChannel, DiscordGatewayAdapterCreator, AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice';

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


export enum PossibleGreetings {
    Flashbang = 'flashbang',
    ZachemMenyaPrizvali = 'zachemMenyaPrizvali',
};
const greetingsMap: Record<PossibleGreetings, string> = {
    [PossibleGreetings.Flashbang]: 'mp3/flashbangSound.mp3',
    [PossibleGreetings.ZachemMenyaPrizvali]: 'mp3/zachemMenyaPrizvaliSound.mp3',
};


const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES',
    ],
});
let commandManager: CommandManager;
const dbService = new DBService();

const player = createAudioPlayer();

client.on('ready', async () => {
    const testRun = process.env.TEST_RUN === 'true';
    await dbService.init();

    if (!testRun) {
        const task = cron.schedule('0 10 * * *', async (now) => {
            for (const [snowflake, guild] of client.guilds.cache) {
                const settings = await dbService.find(guild);
                if (!settings?.dailyDayNotify)
                    continue;

                const { enabled, channelToNotify, roleTag } = settings.dailyDayNotify;
                if (enabled) {
                    const today = `${now.getDay()}_${now.getMonth()}`;
                    const holydayPath = `img/holydays/${today}`;
                    const defaultDayPath = days_imgs[now.getDay()];
                    const isHolyday = fs.existsSync(holydayPath);

                    const content = (
                        roleTag ? `${tagRole(roleTag, guild.roles.everyone.id)}\n` : ''
                    ) + (
                        isHolyday ? 'СЕГОДНЯ ПРАЗДНИК' : `СЕГОДНЯ ${days[now.getDay()]}`
                    );
                    const files = [isHolyday ? holydayPath : defaultDayPath];

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

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!newState.channelId) {
        return;
    }

    const guild = oldState.guild;
    const userId = oldState.id;
    const guildSettings = await dbService.find(guild);
    const settings = guildSettings?.voiceChannelGreetingsSettings;

    if (!settings?.enabled) {
        return;
    }

    const greetingType = settings.greetings.find(g => g.userId === userId)?.type;

    if (!greetingType) {
        return;
    }

    const connection = joinVoiceChannel({
        channelId: newState.channelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    connection.subscribe(player);
    const disconnectOnEnded = () => connection.disconnect();

    player.once(AudioPlayerStatus.Idle, disconnectOnEnded);
    connection.once(VoiceConnectionStatus.Disconnected, () => {
        player.removeListener(AudioPlayerStatus.Idle, disconnectOnEnded);
    });

    const greetingSound = createAudioResource(greetingsMap[greetingType]);
    player.play(greetingSound);
});


client.login(process.env.TOKEN)
