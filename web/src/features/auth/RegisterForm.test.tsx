import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm, validateRegistration } from './RegisterForm';

describe('validateRegistration', () => {
  it('flags every invalid field', () => {
    expect(validateRegistration({ name: ' ', email: 'nope', password: 'short', confirm: 'x' })).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      confirm: expect.any(String),
    });
  });

  it('accepts valid input', () => {
    expect(
      validateRegistration({ name: 'Ada', email: 'ada@example.com', password: 'longenough', confirm: 'longenough' }),
    ).toEqual({});
  });
});

describe('RegisterForm', () => {
  it('shows a mismatch error and does not submit', async () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password124');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
