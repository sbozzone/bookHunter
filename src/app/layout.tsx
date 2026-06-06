import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings-provider';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400;1,7..72,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
          defaultColorTheme="green"
          storageKey="budget-book-hunter-color-theme"
        >
          <SettingsProvider>
            {children}
          </SettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
