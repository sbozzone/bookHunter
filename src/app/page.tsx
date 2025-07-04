'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { mockBooks } from '@/lib/data';
import type { Book } from '@/lib/types';

export default function Home() {
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>(mockBooks);

  useEffect(() => {
    if (submittedQuery.trim() === '') {
      setDisplayedBooks(mockBooks);
      return;
    }

    const filteredBooks = mockBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(submittedQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(submittedQuery.toLowerCase())
    );
    setDisplayedBooks(filteredBooks);
  }, [submittedQuery]);

  return (
    <AppLayout>
      <Header onSearch={setSubmittedQuery} />
      <main className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">
          {submittedQuery
            ? `Search Results for "${submittedQuery}"`
            : 'Featured Books'}
        </h2>
        {displayedBooks.length > 0 ? (
          <BookResults books={displayedBooks} />
        ) : (
          <p className="text-center text-muted-foreground">
            No books found matching your search.
          </p>
        )}
      </main>
    </AppLayout>
  );
}
