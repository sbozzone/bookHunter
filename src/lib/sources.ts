/**
 * Deterministic source-link builder.
 *
 * Replaces the old LLM-generated search URLs. Given a book title (and optional
 * preferred sources), returns a list of `Source` objects with direct search
 * URLs — no AI, no network calls, instant.
 */

import type { Source, SourceName } from '@/lib/types';
import { availableSources } from '@/lib/data';

/**
 * URL templates for each source. `TITLE` is replaced with the URL-encoded
 * book title (optionally including the author for better matches).
 */
const sourceUrlTemplates: Record<SourceName, (q: string) => string> = {
  Amazon: (q) => `https://www.amazon.com/s?k=${q}`,
  Audible: (q) => `https://www.audible.com/search?keywords=${q}`,
  Hoopla: (q) => `https://www.hoopladigital.com/search?q=${q}`,
  Libby: (q) => `https://www.google.com/search?q=site%3Alibbyapp.com+${q}`,
  YouTube: (q) => `https://www.youtube.com/results?search_query=${q}+audiobook`,
  'Google Play': (q) => `https://play.google.com/store/search?q=${q}&c=books`,
  PDF: (q) => `https://www.google.com/search?q=${q}+filetype%3Apdf`,
};

/**
 * Build search-source links for a book.
 *
 * @param title  Book title (author is appended when provided for accuracy).
 * @param author Optional author, used to disambiguate the search query.
 * @param preferredSources When provided and non-empty, only these sources are
 *   returned; otherwise links for every available source are built.
 */
export function buildSources(
  title: string,
  author?: string,
  preferredSources?: SourceName[]
): Source[] {
  const query = encodeURIComponent([title, author].filter(Boolean).join(' ').trim());

  const sources =
    preferredSources && preferredSources.length > 0
      ? preferredSources
      : availableSources;

  return sources.map((name) => ({
    name,
    url: sourceUrlTemplates[name](query),
  }));
}
