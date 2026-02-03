import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-24 w-24 text-muted-foreground mx-auto mb-6" aria-hidden />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This page doesn’t exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
