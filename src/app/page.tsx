
'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { Skeleton } from '@/components/ui/skeleton';
import type { Book } from '@/lib/types';
import { getBooks } from '@/app/actions';
import { BookMarked } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSettings } from '@/components/settings-provider';
import { useToast } from '@/hooks/use-toast';

function SplashScreen({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 fixed inset-0 z-50 cursor-pointer overflow-hidden"
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onDismiss();
        }
      }}
    >
      <img
        src="/splash.png"
        alt="BudgetBookHunter"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-full">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}

function BookSearchSkeleton({ numSources }: { numSources: number }) {
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
            {[...Array(numSources)].map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
            ))}
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
  const { preferredGenres, preferredFormats, preferredSources, isInitialized: settingsAreInitialized } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');
  const hasPerformedInitialSearch = useRef(false);

  const sourcesCount = preferredSources.length > 0 ? preferredSources.length : 5;

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSubmittedQuery(query);
    // Don't show splash screen if user is doing a new search
    if (query) {
      setIsLoading(false);
    }
  }, [searchParams]);

  const performSearch = useCallback(async (query: string | null) => {
    if (query === null && hasPerformedInitialSearch.current) {
        return;
    }

    setIsSearching(true);
    setSearchProgress(query === null ? 'Loading featured books...' : 'Searching for books...');
    setNoResults(false);

    const searchQuery = query === null ? 'Featured Books' : query;

    try {
      const result = await getBooks({ query: searchQuery, preferredGenres, preferredFormats, preferredSources });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Search Failed', description: result.error });
      }
      setDisplayedBooks(result.books || []);
      setNoResults(!result.books || result.books.length === 0);
    } finally {
      setIsSearching(false);
      setSearchProgress('');
    }

    if (query === null) {
      hasPerformedInitialSearch.current = true;
    }
  }, [preferredGenres, preferredFormats, preferredSources, toast]);

  useEffect(() => {
    if (!settingsAreInitialized || isLoading) {
      return;
    }

    const query = searchParams.get('q');
    performSearch(query);

  }, [searchParams, settingsAreInitialized, isLoading, performSearch]);

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
    return <SplashScreen onDismiss={() => setIsLoading(false)} />;
  }

  return (
    <AppLayout>
      <Header onSearch={handleSearch} initialQuery={submittedQuery} isSearching={isSearching} />
      {isSearching && searchProgress && (
        <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 md:px-8 py-3">
          <p className="text-sm text-blue-700 dark:text-blue-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
            {searchProgress}
          </p>
        </div>
      )}
      <main className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">
          {submittedQuery
            ? `Search Results for "${submittedQuery}"`
            : 'Featured Books'}
        </h2>
        {isSearching ? (
          <BookSearchSkeleton numSources={sourcesCount} />
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
