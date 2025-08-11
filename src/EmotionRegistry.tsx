"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";

function createEmotionCache() {
  const cache = createCache({ key: "mui", prepend: true });
  // compat helps with SSR + hydration alignment
  (cache as any).compat = true;
  return cache;
}

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState<EmotionCache>(() => createEmotionCache());

  useServerInsertedHTML(() => {
    // Collect Emotion's inserted styles and flush them into the HTML
    const inserted = (cache as any).inserted as Record<string, string>;
    const names = Object.keys(inserted);
    const css = names.map((n) => inserted[n]).join(" ");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
