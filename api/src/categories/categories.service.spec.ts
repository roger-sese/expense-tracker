import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { testDbImports } from '../test-utils/test-db';
import { CategoriesService } from './categories.service';
import { User } from '../users/user.entity';
import { Expense } from '../expenses/expense.entity';
import { DEFAULT_CATEGORIES } from './default-categories';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let expenses: Repository<Expense>;
  let userId: number;

  let moduleRef: TestingModule;

  afterEach(() => moduleRef.close());

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: testDbImports(),
      providers: [CategoriesService],
    }).compile();
    service = moduleRef.get(CategoriesService);
    expenses = moduleRef.get(getRepositoryToken(Expense));
    const users = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    userId = (await users.save({ name: 'A', email: 'a@x.co', passwordHash: 'h' })).id;
  });

  it('creates the default categories for a new user', async () => {
    await service.createDefaults(userId);
    const all = await service.findAll(userId);
    expect(all.map((c) => c.name).sort()).toEqual(DEFAULT_CATEGORIES.map((c) => c.name).sort());
  });

  it('rejects duplicate names per user', async () => {
    await service.create(userId, { name: 'Travel' });
    await expect(service.create(userId, { name: ' Travel ' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('includes expense counts when listing', async () => {
    const travel = await service.create(userId, { name: 'Travel', color: '#0ea5e9' });
    await expenses.save({ description: 'Flight', amountCents: 10000, date: '2025-01-01', categoryId: travel.id, userId });
    const [row] = await service.findAll(userId);
    expect(row).toMatchObject({ name: 'Travel', color: '#0ea5e9', expenseCount: 1 });
  });

  it('updates name and colour', async () => {
    const c = await service.create(userId, { name: 'Travel' });
    const updated = await service.update(userId, c.id, { name: 'Trips', color: '#000000' });
    expect(updated).toMatchObject({ name: 'Trips', color: '#000000' });
  });

  it('blocks deleting a category that still has expenses', async () => {
    const c = await service.create(userId, { name: 'Travel' });
    await expenses.save({ description: 'Bus', amountCents: 200, date: '2025-01-01', categoryId: c.id, userId });
    await expect(service.remove(userId, c.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('deletes an unused category', async () => {
    const c = await service.create(userId, { name: 'Travel' });
    await service.remove(userId, c.id);
    await expect(service.findOne(userId, c.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
