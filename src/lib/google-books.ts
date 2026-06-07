/**
 * @fileOverview Fast book search.
 *
 * Replaces the old LLM-based "search engine" (`src/ai/flows/search-books.ts`),
 * which took 8–35s per query. Search now resolves in well under a second:
 *
 *  - Primary: the Google Books API — one HTTP call returns titles, authors,
 *    descriptions, cover images and ISBNs (covers inline, so no per-book cover
 *    fetches). Uses GOOGLE_BOOKS_API_KEY when set.
 *  - Fallback: the OpenLibrary API — no key and no quota. Used automatically
 *    when Google Books errors, is rate-limited (its keyless quota is shared and
 *    frequently exhausted), or returns no results. Keeps the app working out of
 *    the box without an API key.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Book, BookFormat, SourceName } from '@/lib/types';
import { buildSources } from '@/lib/sources';

const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';
const OPENLIBRARY_ENDPOINT = 'https://openlibrary.org/search.json';
const DEFAULT_MAX_RESULTS = 20;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-process cache for repeat searches within a server instance.
const searchCache = new Map<string, { books: Book[]; expires: number }>();

export type SearchOptions = {
  genres?: string[];
  formats?: BookFormat[];
  sources?: SourceName[];
  maxResults?: number;
};

const SVG_PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect fill="#e0e0e0" width="300" height="450"></rect>
    <text fill="rgba(0,0,0,0.3)" font-family="sans-serif" font-size="24" text-anchor="middle" x="150" y="225">Cover Not Available</text>
  </svg>`;
const FALLBACK_COVER = `data:image/svg+xml;base64,${Buffer.from(SVG_PLACEHOLDER).toString('base64')}`;

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Case-insensitive overlap test between a book's categories and preferred genres. */
function matchesGenres(categories: string[] | undefined, genres: string[]): boolean {
  if (genres.length === 0) return true;
  if (!categories || categories.length === 0) return false;
  const cats = categories.map((c) => c.toLowerCase());
  return genres.some((g) => cats.some((c) => c.includes(g.toLowerCase())));
}

/** Keep books that offer at least one of the preferred formats (all when none set). */
function matchesFormats(book: Book, formats: BookFormat[]): boolean {
  return formats.length === 0 || book.formats.some((f) => formats.includes(f));
}

/* -------------------------------------------------------------------------- */
/*  Google Books (primary)                                                    */
/* -------------------------------------------------------------------------- */

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type?: string; identifier?: string }[];
  };
  saleInfo?: { isEbook?: boolean };
  accessInfo?: {
    epub?: { isAvailable?: boolean };
    pdf?: { isAvailable?: boolean };
  };
}

/** Normalize a Google Books cover URL: force https, drop curl, request a larger image. */
function normalizeGoogleCover(volumeInfo: GoogleVolume['volumeInfo']): string {
  const raw = volumeInfo?.imageLinks?.thumbnail || volumeInfo?.imageLinks?.smallThumbnail;
  if (!raw) return FALLBACK_COVER;
  return raw
    .replace(/^http:/, 'https:')
    .replace(/&edge=curl/, '')
    .replace(/zoom=\d/, 'zoom=1');
}

function extractGoogleIsbn(volumeInfo: GoogleVolume['volumeInfo']): string | undefined {
  const ids = volumeInfo?.industryIdentifiers ?? [];
  return (
    ids.find((i) => i.type === 'ISBN_13')?.identifier ||
    ids.find((i) => i.type === 'ISBN_10')?.identifier
  );
}

/**
 * Derive formats from volume metadata.
 * - Print: always (Google Books volumes are books).
 * - eBook: an epub/pdf is available or it is sold as an ebook.
 * - Audiobook: always offered as a searchable option (Audible/YouTube links);
 *   the metadata APIs do not expose audiobook availability.
 */
function deriveFormats(isEbook: boolean): BookFormat[] {
  const formats: BookFormat[] = ['Print'];
  if (isEbook) formats.push('eBook');
  formats.push('Audiobook');
  return formats;
}

function mapGoogleVolume(volume: GoogleVolume, sources?: SourceName[]): Book {
  const info = volume.volumeInfo ?? {};
  const title = info.title ?? 'Unknown Title';
  const author = info.authors?.join(', ') ?? 'Unknown Author';
  const isEbook = Boolean(
    volume.saleInfo?.isEbook ||
      volume.accessInfo?.epub?.isAvailable ||
      volume.accessInfo?.pdf?.isAvailable
  );

  return {
    id: uuidv4(),
    title,
    author,
    coverUrl: normalizeGoogleCover(info),
    description: info.description ?? 'No description available.',
    isbn: extractGoogleIsbn(info),
    formats: deriveFormats(isEbook),
    sources: buildSources(title, author, sources),
  };
}

async function googleVolumesRequest(query: string, maxResults: number): Promise<GoogleVolume[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: 'books',
    country: 'US',
  });
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    params.set('key', process.env.GOOGLE_BOOKS_API_KEY);
  }

  const response = await fetch(`${GOOGLE_BOOKS_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Google Books request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { items?: GoogleVolume[] };
  return data.items ?? [];
}

async function searchGoogleBooks(query: string, options: SearchOptions): Promise<Book[]> {
  const { genres = [], formats = [], sources, maxResults = DEFAULT_MAX_RESULTS } = options;

  const items = await googleVolumesRequest(query, maxResults);
  return items
    .filter((v) => v.volumeInfo?.title)
    .filter((v) => matchesGenres(v.volumeInfo?.categories, genres))
    .map((v) => mapGoogleVolume(v, sources))
    .filter((b) => matchesFormats(b, formats));
}

/* -------------------------------------------------------------------------- */
/*  OpenLibrary (fallback)                                                     */
/* -------------------------------------------------------------------------- */

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  ebook_access?: string; // 'no' | 'printdisabled' | 'borrowable' | 'public'
  first_sentence?: string[];
}

function mapOpenLibraryDoc(doc: OpenLibraryDoc, sources?: SourceName[]): Book {
  const title = doc.title ?? 'Unknown Title';
  const author = doc.author_name?.join(', ') ?? 'Unknown Author';
  const isEbook = Boolean(doc.ebook_access && doc.ebook_access !== 'no');

  return {
    id: uuidv4(),
    title,
    author,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : FALLBACK_COVER,
    description: doc.first_sentence?.[0] ?? 'No description available.',
    isbn: doc.isbn?.[0],
    formats: deriveFormats(isEbook),
    sources: buildSources(title, author, sources),
  };
}

async function searchOpenLibrary(query: string, options: SearchOptions): Promise<Book[]> {
  const { genres = [], formats = [], sources, maxResults = DEFAULT_MAX_RESULTS } = options;

  const params = new URLSearchParams({
    q: query,
    limit: String(maxResults),
    fields: 'title,author_name,cover_i,isbn,subject,ebook_access,first_sentence',
  });

  const response = await fetch(`${OPENLIBRARY_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`OpenLibrary request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { docs?: OpenLibraryDoc[] };
  return (data.docs ?? [])
    .filter((d) => d.title)
    .filter((d) => matchesGenres(d.subject, genres))
    .map((d) => mapOpenLibraryDoc(d, sources))
    .filter((b) => matchesFormats(b, formats));
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Search for books. Tries Google Books first, then transparently falls back to
 * OpenLibrary if Google Books fails or returns nothing. One network round trip
 * in the common case; results are cached in-process for repeat queries.
 */
export async function searchBooks(query: string, options: SearchOptions = {}): Promise<Book[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { genres = [], formats = [], sources, maxResults = DEFAULT_MAX_RESULTS } = options;
  const cacheKey = JSON.stringify({
    q: trimmed.toLowerCase(),
    genres,
    formats,
    sources,
    maxResults,
  });

  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.books;
  }

  let books: Book[] = [];
  try {
    books = await searchGoogleBooks(trimmed, options);
  } catch (error) {
    console.warn(
      'Google Books search failed, falling back to OpenLibrary:',
      error instanceof Error ? error.message : error
    );
  }

  if (books.length === 0) {
    try {
      books = await searchOpenLibrary(trimmed, options);
    } catch (error) {
      console.error(
        'OpenLibrary fallback failed:',
        error instanceof Error ? error.message : error
      );
    }
  }

  searchCache.set(cacheKey, { books, expires: Date.now() + CACHE_TTL_MS });
  return books;
}

/* -------------------------------------------------------------------------- */
/*  Similar-books recommender (keyless)                                        */
/* -------------------------------------------------------------------------- */

async function suggestViaGoogle(query: string): Promise<string[]> {
  // Find the seed book to learn its author and genre.
  const seed = await googleVolumesRequest(query, 1);
  const info = seed[0]?.volumeInfo;
  const seedTitle = info?.title;
  const author = info?.authors?.[0];
  const category = info?.categories?.[0];

  const titles = new Set<string>();
  const collect = (items: GoogleVolume[]) => {
    for (const v of items) {
      const t = v.volumeInfo?.title;
      if (t && t.toLowerCase() !== seedTitle?.toLowerCase()) {
        titles.add(t);
      }
    }
  };

  // More by the same author, then more in the same genre.
  if (author) {
    collect(await googleVolumesRequest(`inauthor:"${author}"`, 10));
  }
  if (category && titles.size < 8) {
    collect(await googleVolumesRequest(`subject:"${category}"`, 10));
  }

  return Array.from(titles).slice(0, 8);
}

async function suggestViaOpenLibrary(query: string): Promise<string[]> {
  const seedParams = new URLSearchParams({ q: query, limit: '1', fields: 'title,author_name' });
  const seedRes = await fetch(`${OPENLIBRARY_ENDPOINT}?${seedParams.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!seedRes.ok) throw new Error(`OpenLibrary request failed: ${seedRes.status}`);
  const seedData = (await seedRes.json()) as { docs?: OpenLibraryDoc[] };
  const seed = seedData.docs?.[0];
  const author = seed?.author_name?.[0];
  if (!author) return [];

  const params = new URLSearchParams({
    author,
    limit: '12',
    fields: 'title',
  });
  const res = await fetch(`${OPENLIBRARY_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`OpenLibrary request failed: ${res.status}`);
  const data = (await res.json()) as { docs?: OpenLibraryDoc[] };

  const titles = new Set<string>();
  for (const d of data.docs ?? []) {
    if (d.title && d.title.toLowerCase() !== seed?.title?.toLowerCase()) {
      titles.add(d.title);
    }
  }
  return Array.from(titles).slice(0, 8);
}

/**
 * Suggest books similar to a title or author — no API key required. Uses Google
 * Books (same author + same genre) with an automatic OpenLibrary fallback.
 * Returns a list of titles the user can search for.
 */
export async function suggestSimilarBooks(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const viaGoogle = await suggestViaGoogle(trimmed);
    if (viaGoogle.length > 0) return viaGoogle;
  } catch (error) {
    console.warn(
      'Google Books suggestions failed, falling back to OpenLibrary:',
      error instanceof Error ? error.message : error
    );
  }

  try {
    return await suggestViaOpenLibrary(trimmed);
  } catch (error) {
    console.error(
      'OpenLibrary suggestions failed:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
