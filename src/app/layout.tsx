import type { Metadata } from 'next';
import { Inter, Literata } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings-provider';
import { WatchlistProvider } from '@/components/watchlist-provider';
import { BookFeedbackProvider } from '@/components/book-feedback-provider';

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const headlineFont = Literata({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'The Budget Book Hunter',
  description: 'Find, track, and get recommendations for your next favorite book.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${headlineFont.variable} font-body antialiased`} suppressHydrationWarning>
        <ThemeProvider
          defaultColorTheme="green"
          storageKey="budget-book-hunter-color-theme"
        >
          <SettingsProvider>
            <WatchlistProvider>
              <BookFeedbackProvider>
                {children}
              </BookFeedbackProvider>
            </WatchlistProvider>
          </SettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
