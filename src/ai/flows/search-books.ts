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
import type { BookFormat, SourceName } from '@/lib/types';
import { availableSources } from '@/lib/data';

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The book title or author to search for.'),
  genres: z.array(z.string()).optional().describe('A list of preferred genres to filter by.'),
  formats: z.array(z.nativeEnum(['Audiobook', 'eBook', 'Print'])).optional().describe('A list of preferred formats to filter by.'),
  sources: z.array(z.string()).optional().describe('A list of preferred sources to search on.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const SourceSchema = z.object({
    name: z.string().describe('The name of the source, e.g., "Amazon", "Libby".'),
    url: z.string().url().describe('The direct URL to the book on the source\'s website.'),
});

const BookSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A short description of the book.'),
  isbn: z.string().optional().describe('The ISBN-13 of the book, if available.'),
  formats: z.array(z.nativeEnum(['Audiobook', 'eBook', 'Print'])).describe('The available formats for the book.'),
  sources: z.array(SourceSchema).describe('A list of sources where the book can be found, with URLs.'),
});

const SearchBooksOutputSchema = z.object({
  books: z.array(BookSchema).describe('A list of books found. Can be an empty list.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

async function getCoverUrl(book: z.infer<typeof BookSchema>): Promise<string> {
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect fill="#e0e0e0" width="300" height="450"></rect>
    <text fill="rgba(0,0,0,0.3)" font-family="sans-serif" font-size="24" text-anchor="middle" x="150" y="225">Cover Not Available</text>
  </svg>`;
  const fallbackUrl = `data:image/svg+xml;base64,${Buffer.from(svgPlaceholder).toString('base64')}`;

  if (book.isbn) {
    const response = await fetch(`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`);
    if (response.ok && response.url) {
      if (!response.url.includes('olid-all-0.png')) {
        return response.url;
      }
    }
  }

  try {
    const query = encodeURIComponent(`${book.title} ${book.author}`);
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    const data = await response.json();
    const coverId = data.docs?.[0]?.cover_i;
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }
  } catch (error) {
    console.error('Error fetching cover from OpenLibrary search:', error);
  }
  
  return fallbackUrl;
}


export async function searchBooks(
  input: SearchBooksInput
): Promise<SearchBooksOutput> {
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
  output: {schema: SearchBooksOutputSchema},
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
- Amazon New
- Amazon Used
- Libby
- Hoopla
- PDF
{{/if}}
Construct the URLs to be as accurate as possible for searching for the specific book title. 
For Amazon Used, use a URL like 'https://www.amazon.com/s?k=TITLE&i=stripbooks-used'. 
For Amazon New, use a URL like 'https://www.amazon.com/s?k=TITLE&i=stripbooks&rh=p_n_condition-type%3A1294422011'. 
For Libby, use a google search scoped to their site: 'https://www.google.com/search?q=site%3Alibbyapp.com+TITLE'.
For PDF, use a google search with the filetype operator: 'https://www.google.com/search?q=TITLE+filetype%3Apdf'.

Ensure the information is accurate. If no books are found, return an empty list.`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { books: [] };
  }
);
