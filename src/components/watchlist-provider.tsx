'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Book } from '@/lib/types';

interface WatchlistContextType {
  watchlist: Book[];
  addToWatchlist: (book: Book) => void;
  removeFromWatchlist: (bookId: string) => void;
  isBookInWatchlist: (bookId: string) => boolean;
  isInitialized: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Book[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('bibliosleuth-watchlist');
      if (item) {
        setWatchlist(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage.', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem('bibliosleuth-watchlist', JSON.stringify(watchlist));
      } catch (error) {
         console.warn('Error setting localStorage.', error);
      }
    }
  }, [watchlist, isInitialized]);


  const addToWatchlist = (book: Book) => {
    setWatchlist((prev) => {
      if (prev.find((item) => item.id === book.id)) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeFromWatchlist = (bookId: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== bookId));
  };

  const isBookInWatchlist = (bookId: string) => {
    return watchlist.some((item) => item.id === bookId);
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isBookInWatchlist, isInitialized }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
