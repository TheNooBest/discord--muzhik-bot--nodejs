import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGuildSettingsTable1649279425885 implements MigrationInterface {
    private tableName = 'guild_settings_entity';
    readonly name = 'CreateGuildSettingsTable1649279425885';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: this.tableName,
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    isPrimary: true,
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'daily_day_notify',
                    type: 'jsonb',
                    isNullable: true,
                },
            ],
        }), true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.tableName, true, true, true);
    }
}
