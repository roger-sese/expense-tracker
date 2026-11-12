import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

export const toPublicUser = (u: User): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
});
