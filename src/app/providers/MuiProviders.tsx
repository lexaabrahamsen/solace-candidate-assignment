"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function MuiProviders({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: "#347866" },        // ← your primary
          secondary: { main: "#FF6F61" },      // ← replace with your secondary hex
        },
        typography: {
          // keep body text as-is, only override display headings
          h1: { fontFamily: '"Mollie Glaston", sans-serif' },
          h2: { fontFamily: '"Mollie Glaston", sans-serif' },
          h3: { fontFamily: '"Mollie Glaston", sans-serif' },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        {children}
    </ThemeProvider>
  );
}
