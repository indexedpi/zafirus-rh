import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'zafirus_rh'),
        ssl: config.get<string>('DATABASE_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        // IMPORTANT: synchronize MUST be false in production.
        // Use TypeORM migrations for schema changes.
        // Only set TYPEORM_SYNC=true in local development if you understand the risk.
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
