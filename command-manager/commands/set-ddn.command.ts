import { CommandInteraction, ApplicationCommandData } from 'discord.js';

import { DBService, GuildSettingsEntity } from '@database';

import { Command, CommandScope, CommandType } from '../command.interface';

export class SetDailyDayNotificationFlagCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-ddn-flag';
    readonly description: string = 'Set "Daily Day Notification" flag (notify or not)';

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
        settings.dailyDayNotify.enabled = options.getBoolean('flag', true);
        await dbService.save(settings);

        await interaction.editReply({
            content: 'Done!',
        });
    }
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'flag',
                    type: 'BOOLEAN',
                    description: 'True if you want receive notification',
                    required: true,
                },
            ],
        };
    }
}


export class SetDailyDayNotificationChannelCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-ddn-channel';
    readonly description: string = 'Set "Daily Day Notification" channel (where to post notifications). Keep empty to set system channel';

    async handler(interaction: CommandInteraction, dbService: DBService): Promise<void> {
        const validate = this.validate(interaction);
        if (!validate.isCorrect) {
            await interaction.reply({
                content: validate.message,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        const options = interaction.options;
        const settings = await dbService.find(interaction.guild!) ?? GuildSettingsEntity.create({ id: interaction.guild!.id });
        settings.dailyDayNotify.channelToNotify = options.getChannel('channel')?.id;

        await dbService.save(settings);

        await interaction.editReply({
            content: 'Done!',
        });
    }
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'channel',
                    type: 'CHANNEL',
                    description: 'Channel where you want to receive notifications',
                },
            ],
        };
    }

    private validate(interaction: CommandInteraction): { isCorrect: boolean, message: string } {
        if (!interaction.guild) {
            return { isCorrect: false, message: 'This is guild command, wtf?!' };
        }

        const options = interaction.options;
        const channelId = options.getChannel('channel')!.id;
        const channel = interaction.guild!.channels.cache.get(channelId);
        if (!channel?.isText()) {
            return { isCorrect: false, message: 'Set text channel, please' };
        }
        return { isCorrect: true, message: '' };
    }
}


export class SetDailyDayNotificationRoleCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-ddn-role';
    readonly description: string = 'Set "Daily Day Notification" role (role to tag). Keep it empty for no tag';

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
        settings.dailyDayNotify.roleTag = options.getRole('role')?.id;
        await dbService.save(settings);

        await interaction.editReply({
            content: 'Done!',
        });
    }
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'role',
                    type: 'ROLE',
                    description: 'Role you want to be tagged on notify',
                },
            ],
        };
    }
}
