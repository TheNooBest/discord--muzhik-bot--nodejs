import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { Command, CommandType } from './command.interface';

export class ThinkCommand implements Command {
    readonly type: CommandType = 'global';
    readonly name: string = 'think';
    readonly description: string = 'Make "muzhik" start thinking...';

    async handler(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
        };
    };
}
