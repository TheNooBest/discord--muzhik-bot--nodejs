import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { DBService } from '../database';

export type CommandType = 'guild' | 'global';
export interface Command {
    type: CommandType;
    handler: (interaction: CommandInteraction, dbService: DBService) => Promise<void>;
    commandData: ApplicationCommandData;
}
