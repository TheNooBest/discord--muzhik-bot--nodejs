import { Guild } from 'discord.js';
import { Connection, createConnection, Repository } from 'typeorm';
import { GuildSettingsEntity } from './entities';

export class DBService {
    private connection?: Connection;
    private guildSettingRepository?: Repository<GuildSettingsEntity>;

    constructor() {}

    public async init(): Promise<void> {
        this.connection = await createConnection();
        this.guildSettingRepository = this.connection.getRepository(GuildSettingsEntity);
    }

    public async find(guild: Guild): Promise<GuildSettingsEntity | undefined> {
        return this.guildSettingRepository?.findOne(guild.id);
    }

    public async save(settings: GuildSettingsEntity): Promise<GuildSettingsEntity | undefined> {
        return this.guildSettingRepository?.save(settings);
    }
}
