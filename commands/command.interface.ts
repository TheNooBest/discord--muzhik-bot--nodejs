import { ApplicationCommandData, CommandInteraction } from 'discord.js';

export interface Command {
    handler: (interaction: CommandInteraction) => Promise<void>;
    commandData: ApplicationCommandData;
}
