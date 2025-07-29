export type SourceName = 
  | 'Libby' 
  | 'Hoopla' 
  | 'PDF' 
  | 'Amazon Used' 
  | 'Amazon New'
  | 'Audible'
  | 'Kobo Audiobooks'
  | 'All You Can Books'
  | 'LibriVox'
  | 'OverDrive'
  | 'YouTube'
  | 'Digitalbook.io'
  | 'Google Audiobooks'
  | 'Downpour'
  | 'Libro.fm';

export type Source = {
  name: SourceName;
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
