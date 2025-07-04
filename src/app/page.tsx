import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { mockBooks } from '@/lib/data';

export default function Home() {
  return (
    <AppLayout>
      <Header />
      <main className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Featured Books</h2>
        <BookResults books={mockBooks} />
      </main>
    </AppLayout>
  );
}
