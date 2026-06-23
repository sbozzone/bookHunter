'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { useWatchlist } from '@/components/watchlist-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bookmark, Compass } from 'lucide-react';

function WatchlistContent() {
  const { watchlist, isInitialized } = useWatchlist();

  if (!isInitialized) {
    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {watchlist.length > 0 ? (
        <BookResults books={watchlist} />
      ) : (
        <div className="animate-fade-up mx-auto max-w-md py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Your watchlist is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the bookmark on any book to save it here for later.
          </p>
          <Button asChild className="mt-4 gap-1.5 rounded-full">
            <Link href="/">
              <Compass className="h-4 w-4" />
              Discover books
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}

function WatchlistPageComponent() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <AppLayout>
      <Header onSearch={handleSearch} />
      <main className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">
          My Watchlist
        </h2>
        <WatchlistContent />
      </main>
    </AppLayout>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense>
      <WatchlistPageComponent />
    </Suspense>
  );
}
