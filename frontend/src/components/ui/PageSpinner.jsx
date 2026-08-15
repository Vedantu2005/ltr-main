import { Loader2 } from 'lucide-react';

export default function PageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  );
}
