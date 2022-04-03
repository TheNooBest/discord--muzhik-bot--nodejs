import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { Command } from './command.interface';

export class TestCommand implements Command {
    readonly name = 'test';
    readonly description = 'Test command';

    async handler(interaction: CommandInteraction): Promise<void> {
        interaction.reply({
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