export type Source = {
  name: 'Libby' | 'Hoopla' | 'PDF' | 'Amazon Used' | 'Amazon New';
  availability?: 'Available' | 'Unavailable' | 'Check';
  url: string;
};

export type BookFormat = 'Audiobook' | 'eBook' | 'Print';

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  sources: Source[];
  formats: BookFormat[];
  isbn?: string;
};
