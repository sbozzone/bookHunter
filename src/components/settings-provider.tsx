'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { BookFormat } from '@/lib/types';
import { availableGenres } from '@/lib/data';

const SETTINGS_STORAGE_KEY = 'budget-book-hunter-settings';

interface SettingsContextType {
  preferredGenres: string[];
  toggleGenre: (genre: string) => void;
  preferredFormats: BookFormat[];
  toggleFormat: (format: BookFormat) => void;
  isInitialized: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
    preferredGenres: [],
    preferredFormats: [],
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [preferredFormats, setPreferredFormats] = useState<BookFormat[]>([]);
  
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
        const settings = { preferredGenres, preferredFormats };
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
         console.warn('Error saving settings to localStorage.', error);
      }
    }
  }, [preferredGenres, preferredFormats, isInitialized]);


  const toggleGenre = useCallback((genre: string) => {
    setPreferredGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const toggleFormat = useCallback((format: BookFormat) => {
    setPreferredFormats(prev =>
        prev.includes(format)
            ? prev.filter(f => f !== format)
            : [...prev, format]
    );
  }, []);

  return (
    <SettingsContext.Provider
      value={{ 
        preferredGenres, 
        toggleGenre, 
        preferredFormats,
        toggleFormat,
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
