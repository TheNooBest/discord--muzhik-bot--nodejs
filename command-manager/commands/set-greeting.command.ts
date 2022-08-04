import { DBService, GuildSettingsEntity } from '@database';
import { ApplicationCommandData, CacheType, CommandInteraction } from 'discord.js';
import { PossibleGreetings } from 'index';
import { Command, CommandScope, CommandType } from '../command.interface';

export class SetGreetingFlagCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-greet-flag';
    readonly description: string = 'Set greeting flag (greet or not)';

    async handler(interaction: CommandInteraction, dbService: DBService): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'This is guild command, wtf?!',
            });
            return;
        }

        await interaction.deferReply();

        const options = interaction.options;
        const settings = await dbService.find(interaction.guild) ?? GuildSettingsEntity.create({ id: interaction.guild.id });

        if (!settings.voiceChannelGreetingsSettings) {
            settings.voiceChannelGreetingsSettings = { enabled: false, greetings: [] };
        }

        settings.voiceChannelGreetingsSettings.enabled = options.getBoolean('flag', true);
        await dbService.save(settings);

        await interaction.editReply({
            content: 'Done!',
        });
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'flag',
                    type: 'BOOLEAN',
                    description: 'True if you want to get greeting on joining voice channels',
                    required: true,
                },
            ],
        };
    };
}

export class SetGreetingTypeCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-greet-type';
    readonly description: string = 'Set greeting for you';

    async handler(interaction: CommandInteraction, dbService: DBService): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'This is guild command, wtf?!',
            });
            return;
        }

        const newGreeting = interaction.options.getString('greeting-type', true);
        if (!Object.values(PossibleGreetings).find(g => g === newGreeting)) {
            await interaction.reply({
                content: 'Invalid greeting-type',
            });
            return;
        }

        await interaction.deferReply();

        const settings = await dbService.find(interaction.guild) ?? GuildSettingsEntity.create({ id: interaction.guild.id });

        if (!settings.voiceChannelGreetingsSettings) {
            settings.voiceChannelGreetingsSettings = { enabled: false, greetings: [] };
        }

        const currentGreeting = settings.voiceChannelGreetingsSettings.greetings.find(g => interaction.user.id);
        if (!currentGreeting) {
            settings.voiceChannelGreetingsSettings.greetings.push({
                userId: interaction.user.id,
                type: newGreeting as PossibleGreetings,
            });
        } else {
            currentGreeting.type = newGreeting as PossibleGreetings;
        }

        await dbService.save(settings);

        await interaction.editReply({
            content: 'Done!',
        });
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'greeting-type',
                    type: 'STRING',
                    description: `One of sounds. Available: ${Object.values(PossibleGreetings).join(', ')}`,
                    required: true,
                },
            ],
        };
    };
}
