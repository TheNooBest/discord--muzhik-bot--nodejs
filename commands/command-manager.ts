import { Command } from './command.interface';
import { PingCommand } from './ping.command';
import { DayCommand, DayImgCommand } from './day.command';
import { TestCommand } from './test.command';
import { ApplicationCommand, Client, CommandInteraction, GuildResolvable, Snowflake } from 'discord.js';

const commands = [
    PingCommand,
    DayCommand,
    DayImgCommand,
    // TestCommand,
];

export class CommandManager {
    private readonly commandsMap: Map<Snowflake, Command> = new Map();

    constructor(private readonly client: Client) {}

    async syncCommands(): Promise<void> {
        if (!this.client.application) {
            console.warn('Client is not initialized fully');
            return;
        }

        await this.client.application.commands.fetch();
        // TODO: Promise.all()
        for (const [snowflake, cmd] of this.client.application.commands.cache) {
            await cmd.delete();
        }

        // TODO: Promise.all()
        for (const cmdClass of commands) {
            const cmd = new cmdClass();
            const _cmd = await this.client.application.commands.create(cmd.commandData);
            this.commandsMap.set(_cmd.id, cmd);
        }

        await this.client.guilds.fetch();
        // TODO: Promise.all()
        for (const [snowflake, guild] of this.client.guilds.cache) {
            await guild.commands.fetch();
            for (const [snowflake, cmd] of guild.commands.cache) {
                cmd.delete();
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
            await command.handler(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}
