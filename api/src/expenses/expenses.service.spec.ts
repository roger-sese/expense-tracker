import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { testDbImports } from '../test-utils/test-db';
import { ExpensesService } from './expenses.service';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let userId: number;
  let otherUserId: number;
  let food: Category;
  let bills: Category;

  let moduleRef: TestingModule;

  afterEach(() => moduleRef.close());

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: testDbImports(),
      providers: [ExpensesService, CategoriesService],
    }).compile();

    service = moduleRef.get(ExpensesService);
    const users = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    const cats = moduleRef.get<Repository<Category>>(getRepositoryToken(Category));

    userId = (await users.save({ name: 'A', email: 'a@x.co', passwordHash: 'h' })).id;
    otherUserId = (await users.save({ name: 'B', email: 'b@x.co', passwordHash: 'h' })).id;
    food = await cats.save({ name: 'Food', color: '#f97316', userId });
    bills = await cats.save({ name: 'Bills', color: '#ef4444', userId });
  });

  const add = (description: string, amount: number, date: string, categoryId = food.id) =>
    service.create(userId, { description, amount, date, categoryId });

  it('creates an expense and returns it with its category', async () => {
    const e = await add('Pizza', 12.5, '2025-03-10');
    expect(e).toMatchObject({
      description: 'Pizza',
      amount: 12.5,
      date: '2025-03-10',
      category: { id: food.id, name: 'Food' },
    });
  });

  it("refuses to use another user's category", async () => {
    await expect(
      service.create(otherUserId, { description: 'x', amount: 1, date: '2025-03-01', categoryId: food.id }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('filters by search text, category and date range, newest first', async () => {
    await add('Pizza', 10, '2025-03-01');
    await add('Pizza again', 11, '2025-03-05');
    await add('Power bill', 80, '2025-03-03', bills.id);
    await add('Old pizza', 9, '2025-01-01');

    const res = await service.findAll(userId, { search: 'PIZZA', from: '2025-03-01', to: '2025-03-31', page: 1, limit: 20 });
    expect(res.items.map((e) => e.description)).toEqual(['Pizza again', 'Pizza']);
    expect(res.total).toBe(2);

    const byCat = await service.findAll(userId, { categoryId: bills.id, page: 1, limit: 20 });
    expect(byCat.items.map((e) => e.description)).toEqual(['Power bill']);
  });

  it('paginates results', async () => {
    for (let i = 1; i <= 5; i++) await add(`Item ${i}`, i, `2025-03-0${i}`);
    const page2 = await service.findAll(userId, { page: 2, limit: 2 });
    expect(page2.total).toBe(5);
    expect(page2.items.map((e) => e.description)).toEqual(['Item 3', 'Item 2']);
  });

  it('updates fields including the category', async () => {
    const e = await add('Lunch', 10, '2025-03-01');
    const updated = await service.update(userId, e.id, { amount: 15.75, categoryId: bills.id, notes: '  ' });
    expect(updated).toMatchObject({ amount: 15.75, notes: null, category: { id: bills.id } });
  });

  it("does not expose or modify another user's expense", async () => {
    const e = await add('Secret', 10, '2025-03-01');
    await expect(service.findOne(otherUserId, e.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(otherUserId, e.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes an expense', async () => {
    const e = await add('Temp', 1, '2025-03-01');
    await service.remove(userId, e.id);
    await expect(service.findOne(userId, e.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('builds a monthly summary with category totals and previous month comparison', async () => {
    await add('Groceries', 40.1, '2025-03-02');
    await add('Snacks', 9.9, '2025-03-20');
    await add('Rent', 100, '2025-03-01', bills.id);
    await add('Feb food', 25, '2025-02-14');
    await add('April food', 99, '2025-04-01');

    const s = await service.summary(userId, '2025-03');
    expect(s.total).toBe(150);
    expect(s.count).toBe(3);
    expect(s.previousMonthTotal).toBe(25);
    expect(s.byCategory).toEqual([
      { categoryId: bills.id, name: 'Bills', color: '#ef4444', total: 100, count: 1 },
      { categoryId: food.id, name: 'Food', color: '#f97316', total: 50, count: 2 },
    ]);
    expect(s.recent.map((e) => e.description)).toEqual(['Snacks', 'Groceries', 'Rent']);
  });
});
