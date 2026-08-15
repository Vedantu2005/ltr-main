import { Outlet } from 'react-router-dom';
import { Sparkles, Star, ShieldCheck, BarChart3 } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const POINTS = [
  { icon: Star, text: 'Every rating is verified against a real purchase relationship — one voice, one vote.' },
  { icon: BarChart3, text: 'Store owners see reputation trends the moment a new rating lands, not next quarter.' },
  { icon: ShieldCheck, text: 'Role-based access control keeps admin tooling separate from public storefronts.' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[color:var(--foreground)] px-12 py-10 text-[color:var(--background)] lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-foreground">
            <Sparkles size={18} />
          </span>
          <span className="font-serif text-xl font-semibold">RateSphere</span>
        </div>

        <div className="max-w-md">
          <p className="font-serif text-3xl leading-snug">
            Reputation, measured with precision.
          </p>
          <p className="mt-4 text-sm text-[color:var(--background)]/70">
            RateSphere gives every registered store a single source of truth for customer sentiment —
            transparent, auditable, and owned by the people who use it.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-[color:var(--background)]/80">
                <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[color:var(--background)]/50">
          &copy; {new Date().getFullYear()} RateSphere. A store rating &amp; reputation platform.
        </p>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="flex items-center gap-2 font-serif text-lg font-semibold text-foreground lg:hidden">
            <Sparkles size={18} className="text-primary" /> RateSphere
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
