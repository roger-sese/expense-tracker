import { ButtonLink } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Page not found</h1>
        <p className="muted">The page you are looking for does not exist.</p>
        <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
      </div>
    </main>
  );
}
