'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { WatchlistProvider, useWatchlist } from '@/components/watchlist-provider';
import { Skeleton } from '@/components/ui/skeleton';

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
        <p className="text-center text-muted-foreground">
          Your watchlist is empty. Add books from the main page to see them here.
        </p>
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
      <WatchlistProvider>
        <WatchlistPageComponent />
      </WatchlistProvider>
    </Suspense>
  );
}
