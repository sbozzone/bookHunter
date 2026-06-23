
'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import { useSettings } from '@/components/settings-provider';
import { ThemeSelector } from '@/components/theme-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { availableGenres, availableFormats, sourceData, availableSources } from '@/lib/data';
import { Separator } from '@/components/ui/separator';


function SettingsContent() {
  const {
    preferredGenres,
    toggleGenre,
    setAllGenres,
    preferredFormats,
    toggleFormat,
    setAllFormats,
    preferredSources,
    toggleSource,
    setAllSources,
  } = useSettings();

  const allGenresSelected = preferredGenres.length === availableGenres.length;
  const someGenresSelected = preferredGenres.length > 0 && !allGenresSelected;
  
  const allSourcesSelected = preferredSources.length === availableSources.length;
  const someSourcesSelected = preferredSources.length > 0 && !allSourcesSelected;

  const allFormatsSelected = preferredFormats.length === availableFormats.length;
  const someFormatsSelected = preferredFormats.length > 0 && !allFormatsSelected;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-base font-bold">Color Theme</Label>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Preferences</CardTitle>
          <CardDescription>Filter results using genres and formats confirmed by the search providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">Favorite Genres</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all-genres"
                    checked={allGenresSelected}
                    onCheckedChange={(checked) => setAllGenres(!!checked)}
                    indeterminate={someGenresSelected}
                />
                <label
                    htmlFor="select-all-genres"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Select All
                </label>
            </div>
            <Separator />
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
             <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all-formats"
                    checked={allFormatsSelected}
                    onCheckedChange={(checked) => setAllFormats(!!checked)}
                    indeterminate={someFormatsSelected}
                />
                <label
                    htmlFor="select-all-formats"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Select All
                </label>
            </div>
            <Separator />
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

      <Card>
        <CardHeader>
            <CardTitle>Search Sources</CardTitle>
            <CardDescription>Choose which search links appear on each book. Availability is confirmed after you open a source.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all-sources"
                    checked={allSourcesSelected}
                    onCheckedChange={(checked) => setAllSources(!!checked)}
                    indeterminate={someSourcesSelected}
                />
                <label
                    htmlFor="select-all-sources"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Select All
                </label>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {sourceData.map((source) => {
                const selected = preferredSources.includes(source.name);
                return (
                  <Button
                    key={source.name}
                    type="button"
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => toggleSource(source.name)}
                    title={source.note}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    {source.name}
                  </Button>
                );
              })}
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
            <SettingsPageComponent />
        </Suspense>
    )
}
