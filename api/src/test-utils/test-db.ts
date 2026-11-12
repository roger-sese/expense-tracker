import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';

const entities = [User, Category, Expense];

/** Fresh in-memory SQLite database (sql.js) for service-level tests. */
export const testDbImports = () => [
  TypeOrmModule.forRoot({ type: 'sqljs', entities, synchronize: true }),
  TypeOrmModule.forFeature(entities),
];
