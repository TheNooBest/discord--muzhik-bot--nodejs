import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { Snowflake } from 'discord.js';
import { PossibleGreetings } from 'index';

export interface DailyDayNotifySettings {
    enabled: boolean;               // if needed to notify this guild
    channelToNotify?: Snowflake;    // undefined - bot will pick system channel, else will notify in current channel (if exist)
    roleTag?: Snowflake;            // undefined - bot will not notify any role, else will tag current role
}

export interface UserGreeting {
    userId: Snowflake;
    type: PossibleGreetings;
}
export interface VoiceChannelGreetingsSettings {
    enabled: boolean;               // if needed to watch for 'voiceStateUpdate' event for this guild
    greetings: UserGreeting[];      // Array of pairs (user id) + (greeting type for this user). Can be empty
}

@Entity({ name: 'guild_settings_entity' })
export class GuildSettingsEntity extends BaseEntity {
    @PrimaryColumn({ name: 'id', type: 'varchar', nullable: false, unique: true })
    id!: Snowflake;

    @Column({ name: 'daily_day_notify', type: 'jsonb', nullable: true })
    dailyDayNotify?: DailyDayNotifySettings;

    @Column({ name: 'voice_channel_greetings_settings', type: 'jsonb', nullable: true })
    voiceChannelGreetingsSettings?: VoiceChannelGreetingsSettings;
}
