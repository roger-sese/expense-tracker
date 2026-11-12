import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('expenses')
@Index(['userId', 'date'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  /** Stored as integer cents to avoid floating point rounding errors. */
  @Column('integer')
  amountCents: number;

  /** ISO calendar date (YYYY-MM-DD). String comparison sorts chronologically. */
  @Column({ type: 'varchar', length: 10 })
  date: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  category: Category;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
