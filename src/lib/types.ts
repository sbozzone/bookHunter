export type Source = {
  name: 'Libby' | 'Hoopla' | 'PDF' | 'Amazon Used' | 'Amazon New';
  availability: 'Available' | 'Unavailable' | 'Check';
  price?: string;
  url: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  sources: Source[];
  formats: ('Audiobook' | 'eBook' | 'Print')[];
};
