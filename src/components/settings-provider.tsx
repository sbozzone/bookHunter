
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
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

function isBookFormat(value: unknown): value is BookFormat {
  return availableFormats.includes(value as BookFormat);
}

function isSourceName(value: unknown): value is SourceName {
  return availableSources.includes(value as SourceName);
}

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
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
        if (Array.isArray(settings.preferredGenres)) {
            setPreferredGenres(settings.preferredGenres.filter((genre: unknown): genre is string => typeof genre === 'string'));
        }
        if (Array.isArray(settings.preferredFormats)) {
            // Drop legacy "Audiobook" values. Availability is not supplied by
            // either search provider, so it is no longer a valid result filter.
            setPreferredFormats(settings.preferredFormats.filter(isBookFormat));
        }
        if (Array.isArray(settings.preferredSources)) {
            setPreferredSources(settings.preferredSources.filter(isSourceName));
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
        const settingsString = JSON.stringify(settings);
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, settingsString);
        setCookie(SETTINGS_STORAGE_KEY, settingsString, 7);
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

  const contextValue = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <SettingsContext.Provider
      value={contextValue}
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
