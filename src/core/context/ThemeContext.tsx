import React from "react";

interface ThemeContextType {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

export const ThemeContext = React.createContext<ThemeContextType | null>(null);
