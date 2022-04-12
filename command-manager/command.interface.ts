import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { DBService } from '@database';

export type CommandScope = 'test' | 'prod';
export type CommandType = 'guild' | 'global';

export interface Command {
    scope: CommandScope;
    type: CommandType;
    handler: (interaction: CommandInteraction, dbService: DBService) => Promise<void>;
    commandData: ApplicationCommandData;
}
