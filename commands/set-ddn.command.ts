import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { DBService, GuildSettingsEntity } from '../database';
import { Command, CommandType } from './command.interface';

export class SetDailyDayNotificationFlagCommand implements Command {
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
        if (!settings.dailyDayNotify) {
            settings.dailyDayNotify = { enabled: false };
        }
        settings.dailyDayNotify.enabled = options.getBoolean('flag', true);
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
                    description: 'True if you want receive notification',
                    required: true,
                },
            ],
        };
    };
}


export class SetDailyDayNotificationChannelCommand implements Command {
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-ddn-channel';
    readonly description: string = 'Set "Daily Day Notification" channel (where to post notifications)';

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
        if (!settings.dailyDayNotify) {
            settings.dailyDayNotify = { enabled: false };
        }
        settings.dailyDayNotify.channelToNotify = options.getChannel('channel')?.id;
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
                    name: 'channel',
                    type: 'CHANNEL',
                    description: 'Channel where you want to receive notifications',
                },
            ],
        };
    };
}


export class SetDailyDayNotificationRoleCommand implements Command {
    readonly type: CommandType = 'guild';
    readonly name: string = 'set-ddn-role';
    readonly description: string = 'Set "Daily Day Notification" role (role to tag)';

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
        if (!settings.dailyDayNotify) {
            settings.dailyDayNotify = { enabled: false };
        }
        settings.dailyDayNotify.roleTag = options.getRole('role')?.id;
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
                    name: 'role',
                    type: 'ROLE',
                    description: 'Role you want to be tagged on notify',
                },
            ],
        };
    };
}
