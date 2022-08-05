import { DBService } from '@database';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, VoiceState } from 'discord.js';

export enum PossibleGreetings {
    None = 'none',
    Flashbang = 'flashbang',
    DemonBezdny = 'demonBezdny',
};
const greetingsMap: Record<PossibleGreetings, string | undefined> = {
    [PossibleGreetings.None]: undefined,
    [PossibleGreetings.Flashbang]: 'mp3/flashbang.mp3',
    [PossibleGreetings.DemonBezdny]: 'mp3/demonBezdny.mp3',
};

// TODO: More events
export enum VoiceStateAction {
    None = '',

    JoinChannel = 'joinChannel',
    LeaveChannel = 'leaveChannel',
    ChangeChannel = 'changeChannel',

    MuteMicro = 'muteMicro',
    UnmuteMicro = 'unmuteMicro',
};

type PartialRecord<T extends string | number | symbol, V> = Partial<Record<T, V>>;

export class VoiceStateManager {
    private readonly player = createAudioPlayer();
    private readonly actionMap: PartialRecord<VoiceStateAction, (oldState: VoiceState, newState: VoiceState) => Promise<void>> = {
        [VoiceStateAction.JoinChannel]: this.handleJoinOrChangeChannel.bind(this),
        [VoiceStateAction.ChangeChannel]: this.handleJoinOrChangeChannel.bind(this),
    };

    constructor(
        private readonly dbService: DBService,
        private readonly testRun: boolean = false,
    ) {}

    async handle(oldState: VoiceState, newState: VoiceState): Promise<void> {
        if (!this.testRun && oldState.guild.id === process.env.TEST_GUILD) {
            return;
        }

        const type = this.getVoiceStateActionType(oldState, newState);
        const handler = this.actionMap[type];
        return handler && handler(oldState, newState);
    }

    private getVoiceStateActionType(oldState: VoiceState, newState: VoiceState): VoiceStateAction {
        if (!oldState.channelId && newState.channelId) { return VoiceStateAction.JoinChannel; }
        if (oldState.channelId && !newState.channelId) { return VoiceStateAction.LeaveChannel; }
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) { return VoiceStateAction.ChangeChannel; }

        // TODO: Recognize mute/unmute micro events

        return VoiceStateAction.None;
    }

    private async handleJoinOrChangeChannel(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const guild = oldState.guild;
        const userId = oldState.id;
        const guildSettings = await this.dbService.find(guild);
        const settings = guildSettings?.voiceChannelGreetingsSettings;

        if (!settings?.enabled) {
            return;
        }

        const greetingType = settings.greetings.find(g => g.userId === userId)?.type;
        if (!greetingType) {
            return;
        }

        const soundPath = greetingsMap[greetingType];
        if (!soundPath) {
            return;
        }

        const connection = joinVoiceChannel({
            channelId: newState.channelId!,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        connection.subscribe(this.player);
        const disconnectOnEnded = () => connection.disconnect();

        // Wtf? Cleanup magic :D
        this.player.once(AudioPlayerStatus.Idle, disconnectOnEnded);
        connection.once(VoiceConnectionStatus.Disconnected, () => {
            this.player.removeListener(AudioPlayerStatus.Idle, disconnectOnEnded);
        });

        const greetingSound = createAudioResource(soundPath);
        this.player.play(greetingSound);
    }
}
