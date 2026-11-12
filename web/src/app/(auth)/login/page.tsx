'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginForm } from '@/features/auth/LoginForm';
import { safeRedirect } from '@/features/auth/safe-redirect';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  return (
    <>
      <h1 className="auth-card__title">Welcome back</h1>
      <p className="muted">Log in to see where your money goes.</p>
      {params.get('expired') && <Alert tone="info">Your session expired. Please log in again.</Alert>}
      <LoginForm
        onSubmit={async (email, password) => {
          await login(email, password);
          router.replace(safeRedirect(params.get('next')));
        }}
      />
      <p className="auth-card__footer">
        No account? <Link href="/register">Create one</Link>
      </p>
      <p className="auth-card__demo muted">
        Demo: <code>demo@example.com</code> / <code>password123</code>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
