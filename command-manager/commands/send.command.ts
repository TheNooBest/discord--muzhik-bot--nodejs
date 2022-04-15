import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { DBService } from '@database';
import { Command, CommandScope, CommandType } from '../command.interface';
import { userMention } from '@discordjs/builders';

const mentions: string[] = [
    ', сходи ',
    ', метнись кабанчиком ',
    ', сбегай ',
];

export class SendCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'send';
    readonly description: string = 'Send someone for something';

    async handler(interaction: CommandInteraction, dbService: DBService): Promise<void> {
        const validate = this.validate(interaction);

        if (!validate.isCorrect) {
            await interaction.reply({
                content: validate.message,
                ephemeral: true,
            });
            return;
        }

        const options = interaction.options;
        const who = options.getUser('who', true);
        const where = options.getString('where', true);
        const channel = options.getChannel('channel');

        let content: string;

        if (who.bot) {
            content = 'Браток, ты на кого позарился?';
        } else {
            content = `${userMention(who.id)}${mentions[Math.floor(Math.random() * mentions.length)]}${where}`;
        }

        await interaction.reply({ content });

        if (channel) {
            const voice = interaction.guild!.members.cache.get(who.id)?.voice;
            if (voice && interaction.guild!.channels.cache.get(voice.channelId ?? '')) {
                await voice.setChannel(channel.id);
            }
        }
    }
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'who',
                    type: 'USER',
                    description: 'Who you want to send',
                    required: true,
                },
                {
                    name: 'where',
                    type: 'STRING',
                    description: 'Where you want to send him',
                    required: true,
                },
                {
                    name: 'channel',
                    type: 'CHANNEL',
                    description: 'Move him to specific channel',
                    required: false,
                },
            ],
        };
    }

    private validate(interaction: CommandInteraction): { isCorrect: boolean, message: string } {
        if (!interaction.guild) {
            return { isCorrect: false, message: 'This is guild command, wtf?!' };
        }

        const options = interaction.options;
        const who = options.getUser('who', true);
        const where = options.getString('where', true);
        const channel = options.getChannel('channel');

        if (channel && !interaction.guild!.channels.cache.get(channel.id)?.isVoice()) {
            return { isCorrect: false, message: 'Set voice channel, please' };
        }
        return { isCorrect: true, message: '' };
    }
}
