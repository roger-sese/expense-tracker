'use client';

import { useState, type FormEvent } from 'react';
import { Alert, Button, TextField } from '@/components/ui';

export interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
}

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

export function validateRegistration(v: { name: string; email: string; password: string; confirm: string }): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Enter a valid email';
  if (v.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (v.confirm !== v.password) errors.confirm = 'Passwords do not match';
  return errors;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateRegistration(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values.name.trim(), values.email.trim(), values.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert>{error}</Alert>}
      <TextField label="Name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={set('email')}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={set('password')}
        error={errors.password}
        hint="At least 8 characters"
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={values.confirm}
        onChange={set('confirm')}
        error={errors.confirm}
      />
      <Button type="submit" isLoading={submitting} className="btn--block">
        Create account
      </Button>
    </form>
  );
}
