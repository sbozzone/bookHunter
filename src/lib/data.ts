import type { Book, BookFormat, SourceName, SourceData } from '@/lib/types';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A novel about the American dream.',
    formats: ['Audiobook', 'eBook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('The Great Gatsby')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('The Great Gatsby')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('The Great Gatsby')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('The Great Gatsby')}` },
    ],
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A novel about injustice in the American South.',
    formats: ['eBook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('To Kill a Mockingbird')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('To Kill a Mockingbird')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('To Kill a Mockingbird')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('To Kill a Mockingbird')}` },
    ],
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A dystopian novel about totalitarianism.',
    formats: ['Audiobook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('1984')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('1984')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('1984')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('1984')}` },
    ],
  },
   {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A romantic novel of manners.',
    formats: ['Audiobook', 'eBook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('Pride and Prejudice')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('Pride and Prejudice')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('Pride and Prejudice')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('Pride and Prejudice')}` },
    ],
  },
   {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A fantasy novel and prelude to The Lord of the Rings.',
    formats: ['Audiobook', 'eBook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('The Hobbit')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('The Hobbit')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('The Hobbit')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('The Hobbit')}` },
    ],
  },
   {
    id: '6',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://placehold.co/300x450.png',
    description: 'A science fiction epic set in the distant future.',
    formats: ['Audiobook', 'eBook', 'Print'],
    sources: [
      { name: 'Libby', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${encodeURIComponent('Dune')}` },
      { name: 'Hoopla', url: `https://www.hoopladigital.com/search?q=${encodeURIComponent('Dune')}` },
      { name: 'PDF', url: `https://www.google.com/search?q=${encodeURIComponent('Dune')}+filetype%3Apdf` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent('Dune')}` },
    ],
  },
];

export const availableGenres = [
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Non-Fiction',
  'Biography',
  'Young Adult',
  'Children',
  'Literary Fiction',
];

export const availableFormats: BookFormat[] = ['Audiobook', 'eBook', 'Print'];

export const sourceData: SourceData[] = [
  { name: 'Amazon', formats: ['Audiobook', 'eBook', 'Print'], note: 'New and used books, ebooks, and audiobooks' },
  { name: 'Audible', formats: ['Audiobook'], note: 'Amazon company' },
  { name: 'Hoopla', formats: ['Audiobook', 'eBook'], note: 'Library provider' },
  { name: 'Libby', formats: ['Audiobook', 'eBook'], note: 'App for OverDrive' },
  { name: 'YouTube', formats: ['Audiobook'], note: 'Unofficial uploads' },
  { name: 'Google Play', formats: ['Audiobook', 'eBook'], note: 'Sells eBooks and Audiobooks' },
  { name: 'PDF', formats: ['eBook', 'Print'], note: 'General PDF search' },
];

export const availableSources: SourceName[] = sourceData.map(s => s.name);
