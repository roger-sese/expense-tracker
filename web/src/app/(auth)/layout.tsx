import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="brand brand--center">
          <span className="brand__mark" aria-hidden>
            $
          </span>
          Spendwise
        </div>
        {children}
      </div>
    </main>
  );
}
