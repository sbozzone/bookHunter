'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { Skeleton } from '@/components/ui/skeleton';
import type { Book } from '@/lib/types';
import { getBooks } from '@/app/actions';
import { BookMarked } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background fixed inset-0 z-50">
      <div className="flex items-center gap-4">
        <BookMarked className="size-12 text-primary animate-pulse" />
        <h1 className="text-4xl font-bold font-headline">The Budget Book Hunter</h1>
      </div>
       <p className="mt-4 text-muted-foreground">Loading your reading experience...</p>
    </div>
  );
}

function BookSearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="flex flex-row items-start gap-4 p-4">
             <Skeleton className="h-[150px] w-[100px] rounded-md" />
             <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
             </div>
          </div>
          <div className="space-y-2 px-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
           <div className="p-4 pt-0 mt-auto">
             <Skeleton className="h-10 w-full" />
           </div>
        </div>
      ))}
    </div>
  );
}


function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSubmittedQuery(query);
    if (!query) {
      // Only show splash screen on initial load without a query
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const queryToSearch = submittedQuery.trim() === '' ? 'Featured Books' : submittedQuery;
    
    setIsSearching(true);
    getBooks(queryToSearch).then(result => {
      if (result.books) {
        setDisplayedBooks(result.books);
      }
      setIsSearching(false);
      // TODO: Handle error case
    });
  }, [submittedQuery]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AppLayout>
      <Header onSearch={handleSearch} initialQuery={submittedQuery} />
      <main className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">
          {submittedQuery
            ? `Search Results for "${submittedQuery}"`
            : 'Featured Books'}
        </h2>
        {isSearching ? (
          <BookSearchSkeleton />
        ) : displayedBooks.length > 0 ? (
          <BookResults books={displayedBooks} />
        ) : (
          <p className="text-center text-muted-foreground">
            No books found. Try a different search.
          </p>
        )}
      </main>
    </AppLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
