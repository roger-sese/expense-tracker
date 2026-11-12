import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('categories')
@Unique(['userId', 'name'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  /** Hex colour used for badges and charts, e.g. #22c55e */
  @Column({ default: '#64748b' })
  color: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
