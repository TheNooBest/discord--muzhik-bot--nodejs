import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class SetSettingsNotNullable1659710255134 implements MigrationInterface {
    private readonly tableName = 'guild_settings_entity';
    readonly name = 'SetSettingsNotNullable1659710255134';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.setColumnNullable(queryRunner, 'daily_day_notify', false, { enabled: false });
        await this.setColumnNullable(queryRunner, 'voice_channel_greetings_settings', false, { enabled: false, greetings: [] });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.setColumnNullable(queryRunner, 'daily_day_notify', true);
        await this.setColumnNullable(queryRunner, 'voice_channel_greetings_settings', true);
    }

    private async setColumnNullable(queryRunner: QueryRunner, column: string, isNullable: boolean, defaultValue?: any): Promise<void> {
        if (isNullable && !defaultValue) {
            throw new Error('Cannot set column not nullable without default value');
        }

        const toPostgresJSONB = (obj: any) => `'${JSON.stringify(obj)}'`;

        await queryRunner.changeColumn(this.tableName, column, new TableColumn({
            name: column,
            type: 'jsonb',
            isNullable: isNullable,
            default: toPostgresJSONB(defaultValue),
        }));
    }
}
