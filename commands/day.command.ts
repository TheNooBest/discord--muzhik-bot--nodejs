import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Command } from './command.interface';

const days = [
    'ВОСКРЕСЕНЬЕ',
    'ПОНЕДЕЛЬНИК',
    'ВТОРНИК',
    'СРЕДА',
    'ЧЕТВЕРГ',
    'ПЯТНИЦА',
    'СУББОТА',
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

export class DayCommand implements Command {
    readonly name = 'day';
    readonly description = 'Get current day of week';

    async handler(interaction: CommandInteraction): Promise<void> {
        const now = new Date();
        interaction.reply({
            content: `СЕГОДНЯ ${days[now.getDay()]}`,
        });
    };
    get commandData(): ApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
        };
    };
}

export class DayImgCommand implements Command {
    readonly name = 'day_img';
    readonly description = 'Get current day of week (with picture)';

    async handler(interaction: CommandInteraction): Promise<void> {
        const now = new Date();
        interaction.reply({
            content: `СЕГОДНЯ ${days[now.getDay()]}`,
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