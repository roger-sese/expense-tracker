'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <>
      <h1 className="auth-card__title">Create your account</h1>
      <p className="muted">We&apos;ll set you up with a few starter categories.</p>
      <RegisterForm
        onSubmit={async (name, email, password) => {
          await register(name, email, password);
          router.replace('/dashboard');
        }}
      />
      <p className="auth-card__footer">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
