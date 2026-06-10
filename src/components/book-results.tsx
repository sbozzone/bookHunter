import type { Book } from '@/lib/types';
import BookCard from './book-card';

export default function BookResults({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {books.map((book, index) => (
        <div
          key={book.id}
          className="animate-fade-up h-full"
          style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}
        >
          <BookCard book={book} priority={index < 2} />
        </div>
      ))}
    </div>
  );
}
