"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function MuiProviders({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: "#347866" },
          secondary: { main: "#FF6F61" },
        },
        typography: {
          fontFamily:
            'var(--font-lato), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
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
