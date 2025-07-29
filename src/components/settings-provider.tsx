
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { BookFormat, SourceName } from '@/lib/types';
import { availableGenres, availableSources, availableFormats } from '@/lib/data';

const SETTINGS_STORAGE_KEY = 'budget-book-hunter-settings';

interface SettingsContextType {
  preferredGenres: string[];
  toggleGenre: (genre: string) => void;
  setAllGenres: (selectAll: boolean) => void;
  preferredFormats: BookFormat[];
  toggleFormat: (format: BookFormat) => void;
  setAllFormats: (selectAll: boolean) => void;
  preferredSources: SourceName[];
  toggleSource: (source: SourceName) => void;
  setAllSources: (selectAll: boolean) => void;
  isInitialized: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
    preferredGenres: [],
    preferredFormats: [],
    preferredSources: availableSources,
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [preferredFormats, setPreferredFormats] = useState<BookFormat[]>([]);
  const [preferredSources, setPreferredSources] = useState<SourceName[]>(defaultSettings.preferredSources);
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (item) {
        const settings = JSON.parse(item);
        if (settings.preferredGenres) {
            setPreferredGenres(settings.preferredGenres);
        }
        if (settings.preferredFormats) {
            setPreferredFormats(settings.preferredFormats);
        }
        if (settings.preferredSources) {
            setPreferredSources(settings.preferredSources);
        }
      }
    } catch (error) {
      console.warn('Error reading settings from localStorage.', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const settings = { preferredGenres, preferredFormats, preferredSources };
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
         console.warn('Error saving settings to localStorage.', error);
      }
    }
  }, [preferredGenres, preferredFormats, preferredSources, isInitialized]);


  const toggleGenre = useCallback((genre: string) => {
    setPreferredGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const setAllGenres = useCallback((selectAll: boolean) => {
    if (selectAll) {
        setPreferredGenres(availableGenres);
    } else {
        setPreferredGenres([]);
    }
  }, []);

  const toggleFormat = useCallback((format: BookFormat) => {
    setPreferredFormats(prev =>
        prev.includes(format)
            ? prev.filter(f => f !== format)
            : [...prev, format]
    );
  }, []);
  
  const setAllFormats = useCallback((selectAll: boolean) => {
    if (selectAll) {
        setPreferredFormats(availableFormats);
    } else {
        setPreferredFormats([]);
    }
  }, []);

  const toggleSource = useCallback((source: SourceName) => {
    setPreferredSources(prev =>
        prev.includes(source)
            ? prev.filter(s => s !== source)
            : [...prev, source]
    );
    }, []);

  const setAllSources = useCallback((selectAll: boolean) => {
    if (selectAll) {
        setPreferredSources(availableSources);
    } else {
        setPreferredSources([]);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{ 
        preferredGenres, 
        toggleGenre,
        setAllGenres,
        preferredFormats,
        toggleFormat,
        setAllFormats,
        preferredSources,
        toggleSource,
        setAllSources,
        isInitialized 
    }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
