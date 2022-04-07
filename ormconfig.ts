export default {
    type: 'postgres',
    extra: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
    },
    entities: ['database/entities/*.entity.ts'],
    migrations: ['database/migrations/*.ts'],
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
    cli: {
        entitiesDir: 'database/entities',
        migrationsDir: 'database/migrations',
    },
}
