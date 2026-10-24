import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { DARK, LIGHT } from './theme';

const Ctx = createContext(DARK);

export function ThemeProvider({ mode, systemScheme, children }) {
  const effective = mode === 'system' ? systemScheme || 'dark' : mode;
  const theme = effective === 'light' ? LIGHT : DARK;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', theme.bg);
  }, [theme.bg]);

  return <Ctx.Provider value={theme}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
