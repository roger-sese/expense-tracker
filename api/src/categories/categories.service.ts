import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Expense } from '../expenses/expense.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { DEFAULT_CATEGORIES } from './default-categories';

export interface CategoryWithCount extends Omit<Category, 'user'> {
  expenseCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
  ) {}

  async findAll(userId: number): Promise<CategoryWithCount[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .leftJoin(Expense, 'e', 'e.categoryId = c.id')
      .select(['c.id AS id', 'c.name AS name', 'c.color AS color', 'c.userId AS userId'])
      .addSelect('COUNT(e.id)', 'expenseCount')
      .where('c.userId = :userId', { userId })
      .groupBy('c.id')
      .orderBy('c.name', 'ASC')
      .getRawMany<CategoryWithCount>();
    return rows.map((r) => ({ ...r, id: Number(r.id), expenseCount: Number(r.expenseCount) }));
  }

  async findOne(userId: number, id: number): Promise<Category> {
    const category = await this.repo.findOne({ where: { id, userId } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    await this.assertNameAvailable(userId, dto.name);
    return this.repo.save(this.repo.create({ ...dto, name: dto.name.trim(), userId }));
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(userId, id);
    if (dto.name && dto.name.trim() !== category.name) {
      await this.assertNameAvailable(userId, dto.name);
      category.name = dto.name.trim();
    }
    if (dto.color) category.color = dto.color;
    return this.repo.save(category);
  }

  async remove(userId: number, id: number): Promise<void> {
    const category = await this.findOne(userId, id);
    const inUse = await this.expenses.count({ where: { categoryId: id, userId } });
    if (inUse > 0) {
      throw new ConflictException(
        `Category is used by ${inUse} expense(s). Reassign or delete them first.`,
      );
    }
    await this.repo.remove(category);
  }

  async createDefaults(userId: number): Promise<void> {
    await this.repo.save(DEFAULT_CATEGORIES.map((c) => this.repo.create({ ...c, userId })));
  }

  private async assertNameAvailable(userId: number, name: string): Promise<void> {
    if (await this.repo.exist({ where: { userId, name: name.trim() } })) {
      throw new ConflictException(`Category "${name.trim()}" already exists`);
    }
  }
}
