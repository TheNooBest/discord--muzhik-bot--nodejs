import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Command, CommandType } from './command.interface';

export class PingCommand implements Command {
    readonly type: CommandType = 'global';
    readonly name: string = 'ping';
    readonly description: string = 'Ping-pong command';

    async handler(interaction: CommandInteraction): Promise<void> {
        await interaction.reply({
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
