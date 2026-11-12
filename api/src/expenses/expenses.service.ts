import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateExpenseDto, ExpenseQueryDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpenseView, toExpenseView } from './expense.mapper';
import { currentMonth, monthRange } from './month-range';
import { fromCents, toCents } from '../common/money';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryTotal {
  categoryId: number;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface MonthlySummary {
  month: string;
  total: number;
  count: number;
  previousMonthTotal: number;
  byCategory: CategoryTotal[];
  recent: ExpenseView[];
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private readonly repo: Repository<Expense>,
    private readonly categories: CategoriesService,
  ) {}

  async findAll(userId: number, q: ExpenseQueryDto): Promise<Paginated<ExpenseView>> {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.category', 'c')
      .where('e.userId = :userId', { userId });

    if (q.search) qb.andWhere('LOWER(e.description) LIKE :s', { s: `%${q.search.toLowerCase()}%` });
    if (q.categoryId) qb.andWhere('e.categoryId = :categoryId', { categoryId: q.categoryId });
    if (q.from) qb.andWhere('e.date >= :from', { from: q.from });
    if (q.to) qb.andWhere('e.date <= :to', { to: q.to });

    const [rows, total] = await qb
      .orderBy('e.date', 'DESC')
      .addOrderBy('e.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items: rows.map(toExpenseView), total, page, limit };
  }

  async findOne(userId: number, id: number): Promise<ExpenseView> {
    return toExpenseView(await this.findEntity(userId, id));
  }

  async create(userId: number, dto: CreateExpenseDto): Promise<ExpenseView> {
    await this.categories.findOne(userId, dto.categoryId); // ownership check
    const saved = await this.repo.save(
      this.repo.create({
        description: dto.description.trim(),
        amountCents: toCents(dto.amount),
        date: dto.date,
        notes: dto.notes?.trim() || null,
        categoryId: dto.categoryId,
        userId,
      }),
    );
    return this.findOne(userId, saved.id);
  }

  async update(userId: number, id: number, dto: UpdateExpenseDto): Promise<ExpenseView> {
    const expense = await this.findEntity(userId, id);
    if (dto.categoryId !== undefined && dto.categoryId !== expense.categoryId) {
      await this.categories.findOne(userId, dto.categoryId); // ownership check
    }
    const patch: Partial<Expense> = {};
    if (dto.description !== undefined) patch.description = dto.description.trim();
    if (dto.amount !== undefined) patch.amountCents = toCents(dto.amount);
    if (dto.date !== undefined) patch.date = dto.date;
    if (dto.categoryId !== undefined) patch.categoryId = dto.categoryId;
    if (dto.notes !== undefined) patch.notes = dto.notes.trim() || null;
    if (Object.keys(patch).length > 0) await this.repo.update({ id, userId }, patch);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    const expense = await this.findEntity(userId, id);
    await this.repo.remove(expense);
  }

  async summary(userId: number, month = currentMonth()): Promise<MonthlySummary> {
    const { from, to, previous } = monthRange(month);
    const prevRange = monthRange(previous);

    const byCategoryRaw = await this.repo
      .createQueryBuilder('e')
      .innerJoin('e.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'name')
      .addSelect('c.color', 'color')
      .addSelect('SUM(e.amountCents)', 'totalCents')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.userId = :userId', { userId })
      .andWhere('e.date BETWEEN :from AND :to', { from, to })
      .groupBy('c.id')
      .orderBy('totalCents', 'DESC')
      .getRawMany<{ categoryId: number; name: string; color: string; totalCents: number; count: number }>();

    const prev = await this.repo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amountCents), 0)', 'totalCents')
      .where('e.userId = :userId', { userId })
      .andWhere('e.date BETWEEN :from AND :to', { from: prevRange.from, to: prevRange.to })
      .getRawOne<{ totalCents: number }>();

    const recent = await this.findAll(userId, { from, to, page: 1, limit: 5 });

    const byCategory = byCategoryRaw.map((r) => ({
      categoryId: Number(r.categoryId),
      name: r.name,
      color: r.color,
      total: fromCents(Number(r.totalCents)),
      count: Number(r.count),
    }));
    const totalCents = byCategoryRaw.reduce((sum, r) => sum + Number(r.totalCents), 0);

    return {
      month,
      total: fromCents(totalCents),
      count: byCategory.reduce((sum, c) => sum + c.count, 0),
      previousMonthTotal: fromCents(Number(prev?.totalCents ?? 0)),
      byCategory,
      recent: recent.items,
    };
  }

  private async findEntity(userId: number, id: number): Promise<Expense> {
    const expense = await this.repo.findOne({ where: { id, userId }, relations: ['category'] });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }
}
