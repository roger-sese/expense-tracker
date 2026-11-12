import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // DB_PATH=":memory:" keeps everything in memory (used by e2e tests).
        const dbPath = config.get<string>('DB_PATH', 'data/expense-tracker.sqlite');
        const inMemory = dbPath === ':memory:';
        if (!inMemory) mkdirSync(dirname(dbPath), { recursive: true });
        return {
          type: 'sqljs' as const,
          location: inMemory ? undefined : dbPath,
          autoSave: !inMemory,
          entities: [User, Category, Expense],
          // Schema sync keeps the project zero-config; use migrations in production.
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Category, Expense]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
