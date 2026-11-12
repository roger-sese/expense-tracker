import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let users: jest.Mocked<Pick<UsersService, 'findByEmail' | 'findById' | 'create'>>;
  let categories: jest.Mocked<Pick<CategoriesService, 'createDefaults'>>;
  let service: AuthService;
  const jwt = new JwtService({ secret: 'test-secret' });

  const existingUser = async (): Promise<User> => ({
    id: 1,
    name: 'Ada',
    email: 'ada@example.com',
    passwordHash: await bcrypt.hash('correct-horse', 4),
    createdAt: new Date(),
  });

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() };
    categories = { createDefaults: jest.fn() };
    service = new AuthService(
      users as unknown as UsersService,
      categories as unknown as CategoriesService,
      jwt,
    );
  });

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      users.findByEmail.mockResolvedValue(await existingUser());
      await expect(
        service.register({ name: 'Ada', email: 'ada@example.com', password: 'password1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes the password, seeds default categories and returns a token', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockImplementation(async (data) => ({ id: 2, createdAt: new Date(), ...data }));

      const res = await service.register({ name: ' Bob ', email: 'bob@example.com', password: 'password1' });

      const created = users.create.mock.calls[0][0];
      expect(created.name).toBe('Bob');
      expect(created.passwordHash).not.toBe('password1');
      expect(await bcrypt.compare('password1', created.passwordHash)).toBe(true);
      expect(categories.createDefaults).toHaveBeenCalledWith(2);
      expect(res.user).toEqual({ id: 2, name: 'Bob', email: 'bob@example.com' });
      expect(await jwt.verifyAsync(res.accessToken)).toMatchObject({ sub: 2 });
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      users.findByEmail.mockResolvedValue(await existingUser());
      await expect(
        service.login({ email: 'ada@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns a token and public user for valid credentials', async () => {
      users.findByEmail.mockResolvedValue(await existingUser());
      const res = await service.login({ email: 'ada@example.com', password: 'correct-horse' });
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(res.accessToken).toEqual(expect.any(String));
    });
  });
});
