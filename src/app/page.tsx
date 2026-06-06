
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

function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // Update progress every 20ms to reach 100 in 2s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background fixed inset-0 z-50">
      <div className="flex items-center gap-4">
        <BookMarked className="size-12 text-primary animate-pulse" />
        <h1 className="text-4xl font-bold font-headline">BudgetBookHunter

          
        </h1>
      </div>
      <p className="mt-4 text-xl text-foreground">Find It. Read It, Save Big!</p>
      <p className="mt-2 text-muted-foreground">Scanning Libby, Hoopla, Amazon and more!</p>
      <Progress value={progress} className="w-1/4 mt-8" />
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
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [searchParams]);
  
  const performSearch = useCallback(async (query: string | null) => {
    if (query === null && hasPerformedInitialSearch.current) {
        return;
    }

    setIsSearching(true);
    setSearchProgress('Starting search...');
    setNoResults(false);

    const searchQuery = query === null ? 'Featured Books' : query;
    console.log('performSearch called with:', { query, searchQuery });

    try {
      setSearchProgress(searchQuery === 'Featured Books' ? 'Loading featured books...' : 'Searching for books...');
      const result = await getBooks({ query: searchQuery, preferredGenres, preferredFormats, preferredSources });

      console.log('getBooks result:', {
        booksCount: result.books?.length || 0,
        error: result.error,
        hasBooks: !!result.books && result.books.length > 0
      });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Search Failed', description: result.error });
      }
      setDisplayedBooks(result.books || []);
      setNoResults(!result.books || result.books.length === 0);
      setSearchProgress('');
    } catch (error) {
      console.error('performSearch error:', error);
      setSearchProgress('');
    } finally {
      setIsSearching(false);
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
    return <SplashScreen />;
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
