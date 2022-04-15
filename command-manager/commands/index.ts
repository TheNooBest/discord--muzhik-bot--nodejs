import { Command } from '../command.interface';

import { DayImgCommand } from './day.command';
import { PingCommand } from './ping.command';
import { SendCommand } from './send.command';
import { SetDailyDayNotificationChannelCommand, SetDailyDayNotificationFlagCommand, SetDailyDayNotificationRoleCommand } from './set-ddn.command';
import { TestCommand } from './test.command';
import { ThinkCommand } from './think.command';

export default [
    PingCommand,
    DayImgCommand,
    ThinkCommand,
    SetDailyDayNotificationFlagCommand,
    SetDailyDayNotificationChannelCommand,
    SetDailyDayNotificationRoleCommand,
    TestCommand,
    SendCommand,
] as { new(): Command }[];
