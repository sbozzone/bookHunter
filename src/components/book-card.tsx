import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book, BookFormat, Source } from '@/lib/types';
import { BookOpen, Book as BookIcon, ExternalLink } from 'lucide-react';
import { AddToWatchlistButton } from './add-to-watchlist-button';
import { Button } from './ui/button';

// Only formats we can actually verify from the metadata API get a badge.
// Audiobook availability is not verifiable, so it is surfaced through the
// source links (Audible / YouTube) rather than an unreliable badge.
const verifiableFormatIcons: Partial<Record<BookFormat, React.ReactNode>> = {
  eBook: <BookOpen className="w-3.5 h-3.5" />,
  Print: <BookIcon className="w-3.5 h-3.5" />,
};

const SourceChip = ({ source }: { source: Source }) => (
  <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-xs">
    <a href={source.url} target="_blank" rel="noopener noreferrer">
      {source.name}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  </Button>
);

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
  const badges = book.formats.filter((f): f is 'eBook' | 'Print' => f in verifiableFormatIcons);

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <div className="w-[90px] h-[135px] flex-shrink-0 relative rounded-md overflow-hidden bg-muted">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="90px"
            className="object-contain"
            priority={priority}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-headline leading-snug">{book.title}</CardTitle>
          <CardDescription className="mt-0.5">by {book.author}</CardDescription>
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {badges.map((format) => (
                <Badge key={format} variant="secondary" className="flex items-center gap-1 font-normal">
                  {verifiableFormatIcons[format]}
                  {format}
                </Badge>
              ))}
            </div>
          )}
          {book.description && book.description !== 'No description available.' && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{book.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-xs font-medium text-muted-foreground mb-2">Where to find it</p>
        <div className="flex flex-wrap gap-2">
          {book.sources.map((source) => (
            <SourceChip key={source.name} source={source} />
          ))}
        </div>
        {book.isbn && (
          <p className="mt-3 text-xs text-muted-foreground/70">ISBN: {book.isbn}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <AddToWatchlistButton book={book} />
      </CardFooter>
    </Card>
  );
}
