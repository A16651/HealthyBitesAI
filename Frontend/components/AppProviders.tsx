"use client";

import React, { createContext, useContext, useState } from 'react';

type ProductBrief = { id: string; product_name?: string; brand?: string; image_url?: string } | null;

type ResultContextType = {
  currentProduct: ProductBrief;
  setCurrentProduct: (p: ProductBrief) => void;
  cache: Record<string, any>;
  setCacheEntry: (k: string, v: any) => void;
};

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function useResultContext() {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error('useResultContext must be used within ResultProvider');
  return ctx;
}

export function ResultProvider({ children }: { children: React.ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<ProductBrief>(null);
  const [cache, setCache] = useState<Record<string, any>>({});

  const setCacheEntry = (k: string, v: any) => setCache((s) => ({ ...s, [k]: v }));

  return (
    <ResultContext.Provider value={{ currentProduct, setCurrentProduct, cache, setCacheEntry }}>
      {children}
    </ResultContext.Provider>
  );
}

// Settings context
type SettingsType = { printJsonOnError: boolean; setPrintJsonOnError: (v: boolean) => void };
const SettingsContext = createContext<SettingsType | undefined>(undefined);
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [printJsonOnError, setPrintJsonOnErrorState] = useState(false);

  // Load settings from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('fd_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setPrintJsonOnErrorState(settings.printJsonOnError || false);
      }
    } catch (e) {
      // Default settings
    }
  }, []);

  const setPrintJsonOnError = (value: boolean) => {
    setPrintJsonOnErrorState(value);
    try {
      const settings = { printJsonOnError: value };
      localStorage.setItem('fd_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ printJsonOnError, setPrintJsonOnError }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Theme context
type ThemeType = { dark: boolean; toggle: () => void };
const ThemeContext = createContext<ThemeType | undefined>(undefined);
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('fdark');
      setDark(stored === '1');
    } catch (e) {
      // Default to light mode
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return;

    try {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('fdark', dark ? '1' : '0');
    } catch (e) {
      console.error('Error applying theme:', e);
    }
  }, [dark, mounted]);

  const toggle = () => setDark(s => !s);

  // Ensure ThemeContext is always provided to avoid useTheme errors
  // The mounted flag is only used for applying the theme class to the document element.
  // UI will render immediately with default theme (light) until the effect runs.


  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ResultProvider>{children}</ResultProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
