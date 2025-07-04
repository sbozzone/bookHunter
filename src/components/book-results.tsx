import type { Book } from '@/lib/types';
import BookCard from './book-card';

export default function BookResults({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
