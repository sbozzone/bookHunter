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
import type { Book, Source } from '@/lib/types';
import { Headphones, BookOpen, Book as BookIcon, ExternalLink } from 'lucide-react';
import { AddToWatchlistButton } from './add-to-watchlist-button';
import { Button } from './ui/button';

const formatIcons: Record<Book['formats'][number], React.ReactNode> = {
  Audiobook: <Headphones className="w-4 h-4" />,
  eBook: <BookOpen className="w-4 h-4" />,
  Print: <BookIcon className="w-4 h-4" />,
};

const SourceInfo = ({ source }: { source: Source }) => {
  const isAmazon = source.name.startsWith('Amazon');

  if (isAmazon) {
    return (
      <Button asChild variant="outline" size="sm" className="w-full justify-between">
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {source.name}
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    )
  }

  const available = source.availability === 'Available';
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
        <span className="font-medium">{source.name}</span>
        <Badge variant={available ? 'secondary' : 'destructive'}>{source.availability}</Badge>
    </a>
  );
};


export default function BookCard({ book, priority = false }: { book: Book, priority?: boolean }) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <div className="w-[100px] h-[150px] flex-shrink-0 relative">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="100px"
            className="object-cover rounded-md"
            priority={priority}
          />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline">{book.title}</CardTitle>
          <CardDescription>by {book.author}</CardDescription>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {book.formats.map((format) => (
              <Badge key={format} variant="secondary" className="flex items-center gap-1.5 pr-2.5 pl-2 py-1">
                {formatIcons[format]}
                {format}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="space-y-2">
            {book.sources && book.sources.map(source => <SourceInfo key={source.name} source={source} />)}
        </div>
        {book.isbn && (
          <div className="mt-2 pt-2 border-t border-dashed">
            <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <AddToWatchlistButton book={book} />
      </CardFooter>
    </Card>
  );
}
