import { Client, CommandInteraction, Snowflake } from 'discord.js';
import { DBService } from '../database';

import { Command } from './command.interface';

import { PingCommand } from './ping.command';
import { DayImgCommand } from './day.command';
import { TestCommand } from './test.command';
import { ThinkCommand } from './think.command';
import {
    SetDailyDayNotificationFlagCommand,
    SetDailyDayNotificationChannelCommand,
    SetDailyDayNotificationRoleCommand,
} from './set-ddn.command';

const commands: { new(): Command }[] = [
    PingCommand,
    DayImgCommand,
    SetDailyDayNotificationFlagCommand,
    SetDailyDayNotificationChannelCommand,
    SetDailyDayNotificationRoleCommand,
];

const testCommands: { new(): Command }[] = [
    TestCommand,
    ThinkCommand,
];

export class CommandManager {
    private readonly commandsMap: Map<Snowflake, Command> = new Map();

    constructor(
        private readonly client: Client,
        private readonly dbService: DBService,
        private readonly testRun: boolean = false,
    ) {}

    async syncCommands(): Promise<void> {
        if (this.testRun) {
            return this.runTest();
        }

        if (!this.client.application) {
            console.warn('Client is not initialized fully');
            return;
        }

        const commandsObjects = commands.map(c => new c());
        const globalCommands = commandsObjects.filter(c => c.type === 'global');
        const guildCommands = commandsObjects.filter(c => c.type === 'guild');

        await this.client.application.commands.fetch();
        await Promise.all(this.client.application.commands.cache.map(c => c.delete()));

        await Promise.all(globalCommands.map(async cmd => {
            const _cmd = await this.client.application!.commands.create(cmd.commandData);
            this.commandsMap.set(_cmd.id, cmd);
        }));

        await this.client.guilds.fetch();
        await Promise.all(this.client.guilds.cache.map(async guild => {
            await guild.commands.fetch();
            await Promise.all(guild.commands.cache.map(c => c.delete()));
            await Promise.all(guildCommands.map(async cmd => {
                const _cmd = await this.client.application!.commands.create(cmd.commandData);
                this.commandsMap.set(_cmd.id, cmd);
            }));
        }));
    }

    async handle(interaction: CommandInteraction): Promise<void> {
        const command = this.commandsMap.get(interaction.commandId);
        if (!command) {
            console.warn(`Unknown command: ${JSON.stringify({ commandId: interaction.commandId, commandName: interaction.commandName })}`);
            return;
        }

        try {
            await command.handler(interaction, this.dbService);
        } catch (error) {
            console.error(error);
        }
    }

    private async runTest(): Promise<void> {
        const testGuildId = process.env.TEST_GUILD;
        if (!testGuildId) {
            console.warn('Test guild id is missing');
            return;
        }
        
        const commandsObjects = testCommands.map(c => new c());

        await this.client.guilds.fetch();
        const guild = this.client.guilds.cache.get(testGuildId);
        if (!guild) {
            console.warn('Guild not found');
            return;
        }

        await guild.commands.fetch();
        await Promise.all(guild.commands.cache.map(c => c.delete()));

        for (const cmd of commandsObjects) {
            const _cmd = await guild.commands.create(cmd.commandData);
            this.commandsMap.set(_cmd.id, cmd);
        }
    }
}
