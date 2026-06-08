'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Book } from '@/lib/types';

const FEEDBACK_STORAGE_KEY = 'budget-book-hunter-feedback';

export type Rating = 'up' | 'down' | 'read';
type FeedbackMap = Record<string, Rating>;

interface BookFeedbackContextType {
  getRating: (book: Book) => Rating | undefined;
  setRating: (book: Book, rating: Rating) => void;
  isHidden: (book: Book) => boolean;
  isInitialized: boolean;
}

const BookFeedbackContext = createContext<BookFeedbackContextType | undefined>(undefined);

// Books are re-fetched with fresh random ids, so key feedback by title + author.
export function bookKey(book: Book): string {
  return `${book.title}|${book.author}`.toLowerCase().trim();
}

export function BookFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (item) setFeedback(JSON.parse(item));
    } catch (error) {
      console.warn('Error reading book feedback.', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
    } catch (error) {
      console.warn('Error saving book feedback.', error);
    }
  }, [feedback, isInitialized]);

  const getRating = useCallback((book: Book) => feedback[bookKey(book)], [feedback]);

  const setRating = useCallback((book: Book, rating: Rating) => {
    const key = bookKey(book);
    setFeedback((prev) => {
      // Toggle off when the same rating is tapped again.
      if (prev[key] === rating) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: rating };
    });
  }, []);

  const isHidden = useCallback(
    (book: Book) => {
      const r = feedback[bookKey(book)];
      return r === 'down' || r === 'read';
    },
    [feedback]
  );

  const value = useMemo(
    () => ({ getRating, setRating, isHidden, isInitialized }),
    [getRating, setRating, isHidden, isInitialized]
  );

  return <BookFeedbackContext.Provider value={value}>{children}</BookFeedbackContext.Provider>;
}

export function useBookFeedback() {
  const context = useContext(BookFeedbackContext);
  if (context === undefined) {
    throw new Error('useBookFeedback must be used within a BookFeedbackProvider');
  }
  return context;
}
