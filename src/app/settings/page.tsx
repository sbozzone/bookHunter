'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import { SettingsProvider, useSettings } from '@/components/settings-provider';
import { ThemeSelector } from '@/components/theme-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { availableGenres, availableFormats } from '@/lib/data';

function SettingsContent() {
  const {
    preferredGenres,
    toggleGenre,
    preferredFormats,
    toggleFormat,
  } = useSettings();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Preferences</CardTitle>
          <CardDescription>Filter your search results based on your favorite genres and formats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">Favorite Genres</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableGenres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={preferredGenres.includes(genre)}
                    onCheckedChange={() => toggleGenre(genre)}
                  />
                  <label
                    htmlFor={`genre-${genre}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-bold">Preferred Formats</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(availableFormats).map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={preferredFormats.includes(format)}
                    onCheckedChange={() => toggleFormat(format)}
                  />
                  <label
                    htmlFor={`format-${format}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {format}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function SettingsPageComponent() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <AppLayout>
      <Header onSearch={handleSearch} />
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
           <h1 className="text-3xl font-bold tracking-tight mb-8 font-headline">
            Settings
          </h1>
          <SettingsContent />
        </div>
      </main>
    </AppLayout>
  );
}


export default function SettingsPage() {
    return (
        <Suspense>
            <SettingsProvider>
                <SettingsPageComponent />
            </SettingsProvider>
        </Suspense>
    )
}
