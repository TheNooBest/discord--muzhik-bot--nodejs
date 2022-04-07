import { Snowflake } from 'discord.js'
import { roleMention } from '@discordjs/builders';

export function tagRole(id: Snowflake, everyoneId?: Snowflake): string {
    if (id === everyoneId)
        return '@everyone';
    return roleMention(id);
}
