import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Command } from './command.interface';

export class PingCommand implements Command {
    readonly name = 'ping';
    readonly description = 'Ping-pong-command';

    async handler(interaction: CommandInteraction): Promise<void> {
        interaction.reply({
            content: 'Pong!',
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
