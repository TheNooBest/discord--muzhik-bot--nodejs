import { Client, CommandInteraction, Snowflake } from 'discord.js';
import { Command } from './command.interface';

import { PingCommand } from './ping.command';
import { DayCommand, DayImgCommand } from './day.command';
import { TestCommand } from './test.command';
import {
    SetDailyDayNotificationFlagCommand,
    SetDailyDayNotificationChannelCommand,
    SetDailyDayNotificationRoleCommand,
} from './set-ddn.command';
import { DBService } from '../database';

const commands: Command[] = [
    PingCommand,
    DayCommand,
    DayImgCommand,
    SetDailyDayNotificationFlagCommand,
    SetDailyDayNotificationChannelCommand,
    SetDailyDayNotificationRoleCommand,
].map(cl => new cl());

const testCommands: Command[] = [
    TestCommand,
].map(cl => new cl());

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

        // TODO: Promise.all()
        await this.client.application.commands.fetch();
        for (const [snowflake, cmd] of this.client.application.commands.cache) {
            await cmd.delete();
        }

        // TODO: Promise.all()
        for (const cmd of commands.filter(cmd => cmd.type === 'global')) {
            const _cmd = await this.client.application.commands.create(cmd.commandData);
            this.commandsMap.set(_cmd.id, cmd);
        }

        // TODO: Promise.all()
        await this.client.guilds.fetch();
        for (const [snowflake, guild] of this.client.guilds.cache) {
            await guild.commands.fetch();
            for (const [snowflake, cmd] of guild.commands.cache) {
                cmd.delete();
            }
            for (const cmd of commands.filter(cmd => cmd.type === 'guild')) {
                const _cmd = await this.client.application.commands.create(cmd.commandData);
                this.commandsMap.set(_cmd.id, cmd);
            }
        }
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

        await this.client.guilds.fetch();
        const guild = this.client.guilds.cache.get(testGuildId);
        if (!guild) {
            console.warn('Guild not found');
            return;
        }

        // TODO: Promise.all()
        await guild.commands.fetch();
        for (const [snowflake, cmd] of guild.commands.cache) {
            cmd.delete();
        }

        for (const cmd of testCommands) {
            const _cmd = await guild.commands.create(cmd.commandData);
            this.commandsMap.set(_cmd.id, cmd);
        }
    }
}
