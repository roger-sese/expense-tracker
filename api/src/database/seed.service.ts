import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { DEFAULT_CATEGORIES } from '../categories/default-categories';

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'password123';

/** Seeds a demo account with sample data so the app is usable on first run. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get<string>('SEED_DEMO', 'true') !== 'true') return;
    if (await this.users.exist({ where: { email: DEMO_EMAIL } })) return;

    const user = await this.users.save(
      this.users.create({
        name: 'Demo User',
        email: DEMO_EMAIL,
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      }),
    );
    const cats = await this.categories.save(
      DEFAULT_CATEGORIES.map((c) => this.categories.create({ ...c, userId: user.id })),
    );
    const byName = Object.fromEntries(cats.map((c) => [c.name, c.id]));

    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const samples: Array<[string, number, string, number]> = [
      ['Groceries', 245000, 'Food', 1],
      ['Coffee with team', 38000, 'Food', 2],
      ['Monthly train pass', 150000, 'Transport', 3],
      ['Electricity bill', 325000, 'Bills', 5],
      ['Movie night', 65000, 'Entertainment', 6],
      ['Taxi to airport', 48000, 'Transport', 9],
      ['Internet', 169900, 'Bills', 12],
      ['Birthday gift', 120000, 'Other', 15],
      ['Lunch', 25000, 'Food', 35],
      ['Concert tickets', 450000, 'Entertainment', 40],
    ];
    await this.expenses.save(
      samples.map(([description, amountCents, cat, ago]) =>
        this.expenses.create({
          description,
          amountCents,
          date: daysAgo(ago),
          categoryId: byName[cat],
          userId: user.id,
        }),
      ),
    );
    this.logger.log(`Seeded demo account ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }
}
