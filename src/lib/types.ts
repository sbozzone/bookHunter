export type SourceName = 
  | 'Libby' 
  | 'Hoopla' 
  | 'PDF' 
  | 'Amazon Used' 
  | 'Amazon New'
  | 'Audible'
  | 'YouTube'
  | 'Google Audiobooks';

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

export type SourceData = {
  name: SourceName;
  formats: BookFormat[];
  note?: string;
};
