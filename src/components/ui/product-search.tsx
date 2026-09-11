"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SearchInput } from "./input";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioComparativo: number | null;
  imagen: string | null;
}

interface ProductSearchProps {
  placeholder?: string;
  className?: string;
  /** Debounce delay in ms */
  delay?: number;
}

export function ProductSearch({
  placeholder = "Buscar figuras, mangas, franquicias...",
  className,
  delay = 250,
}: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  // Debounced fetch
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { results: SearchResult[] };
        if (reqId !== reqIdRef.current) return; // stale response
        setResults(data.results ?? []);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search failed:", err);
          if (reqId === reqIdRef.current) {
            setResults([]);
            setOpen(false);
          }
        }
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToCatalog = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/productos?q=${encodeURIComponent(trimmed)}` : "/productos");
      setOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        router.push(`/producto/${results[highlightedIndex].slug}`);
        setOpen(false);
      } else {
        goToCatalog(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        maxLength={70}
        aria-label="Buscar productos"
        role="combobox"
        aria-expanded={open}
        aria-controls="product-search-results"
        aria-autocomplete="list"
      />

      {open && (
        <div
          id="product-search-results"
          className="absolute z-[60] mt-2 w-full rounded-xl border border-jw-gray-200 bg-white shadow-xl overflow-hidden"
        >
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-jw-gray-500">Buscando…</div>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-3 text-sm text-jw-gray-500">
              Sin resultados para “{query.trim()}”
            </div>
          )}
          {results.length > 0 && (
            <ul className="max-h-[380px] overflow-y-auto py-1" role="listbox">
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === highlightedIndex}>
                  <Link
                    href={`/producto/${r.slug}`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-jw-off-white transition-colors"
                  >
                    {r.imagen ? (
                      <Image
                        src={r.imagen}
                        alt={r.nombre}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md object-cover border border-jw-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-jw-off-white border border-jw-gray-200" />
                    )}
                    <span className="flex-1 min-w-0 truncate">{r.nombre}</span>
                    <span className="flex-shrink-0 text-sm font-semibold text-jw-black">
                      {formatPrice(r.precio)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => goToCatalog(query)}
            className="w-full px-4 py-2.5 text-sm font-semibold text-jw-red border-t border-jw-gray-100 hover:bg-jw-off-white transition-colors text-left"
          >
            Ver todos los resultados para “{query.trim()}” →
          </button>
        </div>
      )}
    </div>
  );
}
