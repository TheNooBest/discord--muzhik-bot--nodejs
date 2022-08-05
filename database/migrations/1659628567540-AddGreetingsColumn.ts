import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGreetingsColumn1659628567540 implements MigrationInterface {
    private readonly tableName = 'guild_settings_entity';
    private readonly columnName = 'voice_channel_greetings_settings';
    readonly name = 'AddGreetingsColumn1659628567540';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(this.tableName, new TableColumn({
            name: this.columnName,
            type: 'jsonb',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(this.tableName, this.columnName);
    }
}
