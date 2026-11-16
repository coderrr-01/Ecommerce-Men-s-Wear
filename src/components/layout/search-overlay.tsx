"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/navigation";

const RECENT_SEARCHES_KEY = "diamond-selection:recent-searches:v1";
const MAX_RECENT_SEARCHES = 5;

export function SearchOverlay() {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const suggestions = debouncedQuery
    ? mainNav.filter((item) => item.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : [];

  function openSearch() {
    try {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch {
      toast.error("Recent searches are unavailable in this browser.");
    }
    dialog.current?.showModal();
    window.requestAnimationFrame(() => searchInput.current?.focus());
  }

  function search(value: string, href?: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((item) => item !== normalized)].slice(
      0,
      MAX_RECENT_SEARCHES,
    );
    setRecentSearches(next);
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      toast.error("This search could not be saved to recent searches.");
    }
    dialog.current?.close();
    router.push(href ?? `/shop?q=${encodeURIComponent(normalized)}`);
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Search products"
        onClick={openSearch}
      >
        <Search />
      </Button>
      <dialog
        ref={dialog}
        aria-label="Search the collection"
        onKeyDown={(event) => {
          if (event.key === "Escape") dialog.current?.close();
        }}
        className="search-dialog fixed inset-x-0 top-0 m-0 w-full max-w-none border-0 bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/40"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            search(query);
          }}
          className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-8 sm:py-7"
        >
          <label htmlFor="store-search" className="sr-only">
            Search products
          </label>
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={searchInput}
            id="store-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the collection"
            autoComplete="off"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="outline" className="hidden sm:inline-flex">
            Search
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </Button>
        </form>
        <div className="mx-auto max-h-[60dvh] max-w-4xl overflow-y-auto border-t border-border px-4 py-4 sm:px-8">
          {debouncedQuery ? (
            <div className="space-y-1">
              <p className="px-3 pb-2 text-xs text-muted-foreground">Suggestions</p>
              {suggestions.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => search(item.title, item.href)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-secondary"
                >
                  <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                  {item.title}
                </button>
              ))}
              <button
                type="button"
                onClick={() => search(debouncedQuery)}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-secondary"
              >
                <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                Search all products for “{debouncedQuery}”
              </button>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 pb-2 text-xs text-muted-foreground">Recent searches</p>
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => search(item)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-secondary"
                >
                  <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 text-sm text-muted-foreground">Search shirts, trousers and more.</p>
          )}
        </div>
      </dialog>
    </>
  );
}
