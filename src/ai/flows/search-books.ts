
'use server';

/**
 * @fileOverview A flow for searching books on the internet.
 *
 * - searchBooks - A function that takes a query and returns a list of books.
 * - SearchBooksInput - The input type for the searchBooks function.
 * - SearchBooksOutput - The return type for the searchBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import type { Book, BookFormat, SourceName } from '@/lib/types';
import { availableSources } from '@/lib/data';

const coverUrlCache = new Map<string, string>();
const COVER_FETCH_TIMEOUT = 2000;

const BookFormatEnum = z.enum(['Audiobook', 'eBook', 'Print']);

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The book title or author to search for.'),
  genres: z.array(z.string()).optional().describe('A list of preferred genres to filter by.'),
  formats: z.array(BookFormatEnum).optional().describe('A list of preferred formats to filter by.'),
  sources: z.array(z.string()).optional().describe('A list of preferred sources to search on.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const SourceSchema = z.object({
    name: z.enum(['Libby', 'Hoopla', 'PDF', 'Amazon', 'Audible', 'YouTube', 'Google Play'] as const).describe('The name of the source, e.g., "Amazon", "Libby".'),
    url: z.string().describe('The direct URL to the book on the source\'s website.'),
});

const BookSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A short description of the book.'),
  isbn: z.string().optional().describe('The ISBN-13 of the book, if available.'),
  formats: z.array(BookFormatEnum).describe('The available formats for the book.'),
  sources: z.array(SourceSchema).describe('A list of sources where the book can be found, with URLs.'),
});

const SearchBooksOutputSchema = z.object({
  books: z.array(BookSchema).describe('A list of books found. Can be an empty list.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

function fetchWithTimeout(url: string, timeout: number = COVER_FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function getCoverUrl(book: z.infer<typeof BookSchema>): Promise<string> {
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect fill="#e0e0e0" width="300" height="450"></rect>
    <text fill="rgba(0,0,0,0.3)" font-family="sans-serif" font-size="24" text-anchor="middle" x="150" y="225">Cover Not Available</text>
  </svg>`;
  const fallbackUrl = `data:image/svg+xml;base64,${Buffer.from(svgPlaceholder).toString('base64')}`;

  const cacheKey = book.isbn || `${book.title}:${book.author}`;
  if (coverUrlCache.has(cacheKey)) {
    return coverUrlCache.get(cacheKey)!;
  }

  try {
    const results = await Promise.allSettled([
      (async () => {
        if (!book.isbn) throw new Error('No ISBN');
        const response = await fetchWithTimeout(`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`);
        if (response.ok && response.url && !response.url.includes('olid-all-0.png')) {
          return response.url;
        }
        throw new Error('Invalid ISBN response');
      })(),
      (async () => {
        const query = encodeURIComponent(`${book.title} ${book.author}`);
        const response = await fetchWithTimeout(`https://openlibrary.org/search.json?q=${query}`);
        const data = await response.json();
        const coverId = data.docs?.[0]?.cover_i;
        if (coverId) {
          return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        }
        throw new Error('No cover found in search results');
      })(),
    ]);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        coverUrlCache.set(cacheKey, result.value);
        return result.value;
      }
    }
  } catch (error) {
    console.debug('Error fetching cover:', error instanceof Error ? error.message : 'Unknown error');
  }

  coverUrlCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}


export async function searchBooks(
  input: SearchBooksInput
): Promise<{ books: Book[] }> {
  const booksFromFlow = await searchBooksFlow(input);

  if (!booksFromFlow || !booksFromFlow.books || booksFromFlow.books.length === 0) {
    return { books: [] };
  }

  const booksWithFullData = await Promise.all(
    booksFromFlow.books.map(async (book) => {
      const coverUrl = await getCoverUrl(book);

      return {
        ...book,
        id: uuidv4(),
        coverUrl,
      };
    })
  );
  
  return { books: booksWithFullData };
}

const prompt = ai.definePrompt({
  name: 'searchBooksPrompt',
  input: {schema: SearchBooksInputSchema},
  prompt: `You are a book expert acting as a search engine. Find up to 6 books matching the query "{{query}}".
{{#if genres}}
Prioritize books from the following genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

For each book, provide the title, author, a brief description, and the book's ISBN-13 if available.
Based on your knowledge, determine which of the following formats are actually available for the book: 'Audiobook', 'eBook', 'Print'.
{{#if formats}}
Only return books that are available in at least one of the preferred formats: {{#each formats}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
For the books you return, provide ALL of their available formats, not just the ones the user prefers.
{{else}}
Only include the formats that are realistically available for purchase or loan.
{{/if}}

For each book, provide valid search URLs for the following sources:
{{#if sources}}
{{#each sources}}
- {{{this}}}
{{/each}}
{{else}}
- Amazon
- Libby
- Hoopla
- PDF
- Audible
- YouTube
- Google Play
{{/if}}

Construct the URLs to be as accurate as possible for searching for the specific book title. Replace TITLE with the book's title.
- Amazon: 'https://www.amazon.com/s?k=TITLE'
- Libby: 'https://www.google.com/search?q=site%3Alibbyapp.com+TITLE'
- Hoopla: 'https://www.hoopladigital.com/search?q=TITLE'
- PDF: 'https://www.google.com/search?q=TITLE+filetype%3Apdf'
- Audible: 'https://www.audible.com/search?keywords=TITLE'
- YouTube: 'https://www.youtube.com/results?search_query=TITLE+audiobook'
- Google Play: 'https://play.google.com/store/search?q=TITLE&c=books'

Ensure the information is accurate. If no books are found, return an empty list.

Respond with ONLY a valid JSON object (no markdown, no code fences, no explanation) matching this exact shape:
{
  "books": [
    {
      "title": "string",
      "author": "string",
      "description": "string",
      "isbn": "string (optional, ISBN-13)",
      "formats": ["Audiobook" | "eBook" | "Print"],
      "sources": [{ "name": "Libby" | "Hoopla" | "PDF" | "Amazon" | "Audible" | "YouTube" | "Google Play", "url": "string" }]
    }
  ]
}`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async input => {
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const {text} = await prompt(input);
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return SearchBooksOutputSchema.parse(parsed);
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.message.includes('429')) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Failed to fetch books after retries');
  }
);
