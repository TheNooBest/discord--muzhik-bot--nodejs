import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Command, CommandScope, CommandType } from '../command.interface';

const day_texts = [
    'СЕГОДНЯ ВОСКРЕСЕНЬЕ',
    'СЕГОДНЯ ПОНЕДЕЛЬНИК',
    'СЕГОДНЯ ВТОРНИК',
    'СЕГОДНЯ СРЕДА',
    'СЕГОДНЯ ЧЕТВЕРГ',
    'СЕГОДНЯ ПЯТНИЦА',
    'СЕГОДНЯ СУББОТА',
];
const days_imgs = [
    'img/6.jpg',
    'img/0.jpg',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
];

export class DayImgCommand implements Command {
    readonly scope: CommandScope = 'prod';
    readonly type: CommandType = 'global';
    readonly name: string = 'day';
    readonly description: string = 'Get current day of week';

    async handler(interaction: CommandInteraction): Promise<void> {
        const now = new Date();
        await interaction.reply({
            content: day_texts[now.getDay()],
            files: [days_imgs[now.getDay()]],
        });
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
        };
    };
}