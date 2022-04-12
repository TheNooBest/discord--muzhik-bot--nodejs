import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { Command, CommandScope, CommandType } from '../command.interface';

export class TestCommand implements Command {
    readonly scope: CommandScope = 'test';
    readonly type: CommandType = 'global';
    readonly name: string = 'test';
    readonly description: string = 'Test command';

    async handler(interaction: CommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Test!',
            ephemeral: true,
        });
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
        };
    };
}
