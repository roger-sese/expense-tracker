'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, PageLoader } from '@/components/ui';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/categories', label: 'Categories' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();

  // Middleware handles signed-out users; this covers the brief session-restore moment.
  if (status !== 'authenticated') return <PageLoader />;

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/dashboard" className="brand">
          <span className="brand__mark" aria-hidden>
            $
          </span>
          Spendwise
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav__link${active ? ' nav__link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="topbar__user">
          <span className="muted topbar__name">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
