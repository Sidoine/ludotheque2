"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { type ReactNode, useState } from "react";

export function EmotionRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "css" });
    cache.compat = true;
    const previousInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return previousInsert(...args);
    };

    return {
      cache,
      flush: () => {
        const flushed = inserted;
        inserted = [];
        return flushed;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;

    const styles = names
      .map((name) => cache.inserted[name])
      .filter((style): style is string => typeof style === "string")
      .join("");

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
