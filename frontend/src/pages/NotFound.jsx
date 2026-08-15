import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <CompassIcon size={32} className="text-muted" />
      <h1 className="font-serif text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-sm text-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="focus-ring mt-2 rounded font-medium text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
