'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { useWatchlist } from '@/components/watchlist-provider';

function WatchlistPageComponent() {
  const { watchlist } = useWatchlist();
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
        {watchlist.length > 0 ? (
          <BookResults books={watchlist} />
        ) : (
          <p className="text-center text-muted-foreground">
            Your watchlist is empty. Add books from the main page to see them here.
          </p>
        )}
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
