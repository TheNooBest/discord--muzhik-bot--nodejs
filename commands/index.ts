import { PingCommand } from './ping.command';
import { DayCommand, DayImgCommand } from './day.command';
import { Command } from './command.interface';
import { CommandInteraction } from 'discord.js';

const commands = [
    PingCommand,
    DayCommand,
    DayImgCommand,
];

export class CommandManager {
    readonly commandsMap: Map<string, Command> = new Map(commands.map(cl => {
        const obj = new cl();
        return [obj.commandData.name, obj];
    }));

    async handle(interaction: CommandInteraction): Promise<void> {
        const command = this.commandsMap.get(interaction.commandName);
        await command?.handler(interaction);
    }
}
