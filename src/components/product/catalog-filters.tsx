"use client";

import { useDeferredValue, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

function useActiveCount(groups: FilterGroup[]) {
  const searchParams = useSearchParams();
  return useMemo(
    () =>
      groups.reduce(
        (acc, g) => acc + (searchParams.get(g.key)?.split(",").filter(Boolean).length || 0),
        0
      ),
    [searchParams, groups]
  );
}

export function SortSelect({
  options,
  className,
}: {
  options: { value: string; label: string }[];
  className?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sortedBy = searchParams.get("orden") || "destacados";

  return (
    <div className={cn("relative", className)}>
      <select
        value={sortedBy}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("orden", e.target.value);
          router.push(`/productos?${params.toString()}`);
        }}
        className={cn(
          "appearance-none h-9 pl-3 pr-8 rounded-lg border border-jw-gray-200 text-sm",
          "bg-white focus:outline-none focus:ring-2 focus:ring-jw-red focus:border-transparent"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-jw-gray-500 pointer-events-none" />
    </div>
  );
}

function FiltersPanel({
  groups,
  sortOptions,
  render = "full",
}: {
  groups: FilterGroup[];
  sortOptions: { value: string; label: string }[];
  render?: "full" | "chips-only";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deferredSearchParams = useDeferredValue(searchParams.toString());
  const activeParams = new URLSearchParams(deferredSearchParams);

  const activeFilters = useMemo(() => {
    const result: { key: string; value: string; label: string }[] = [];
    for (const group of groups) {
      const current = activeParams.get(group.key)?.split(",").filter(Boolean) || [];
      for (const v of current) {
        const opt = group.options.find((o) => o.value === v);
        if (opt) result.push({ key: group.key, value: v, label: opt.label });
      }
    }
    return result;
  }, [activeParams, groups]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(activeParams);
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    if (current.length > 0) {
      params.set(key, current.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/productos?${params.toString()}`);
  };

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(activeParams);
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const filtered = current.filter((v) => v !== value);
    if (filtered.length > 0) {
      params.set(key, filtered.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/productos?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/productos");
  };

  if (render === "chips-only") {
    if (activeFilters.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((f) => (
          <button
            key={`${f.key}-${f.value}`}
            onClick={() => removeFilter(f.key, f.value)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-jw-red/10 text-jw-red text-xs font-medium hover:bg-jw-red hover:text-white transition-colors"
          >
            {f.label}
            <X className="h-3 w-3" />
          </button>
        ))}
        <button
          onClick={clearAll}
          className="text-xs text-jw-gray-500 hover:text-jw-red underline underline-offset-2 transition-colors"
        >
          Limpiar todo
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Active filters chips (all screens) */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {activeFilters.map((f) => (
            <button
              key={`${f.key}-${f.value}`}
              onClick={() => removeFilter(f.key, f.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-jw-red/10 text-jw-red text-xs font-medium hover:bg-jw-red hover:text-white transition-colors"
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-jw-gray-500 hover:text-jw-red underline underline-offset-2 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Filter groups */}
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-jw-black mb-3">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.options.map((option) => {
                const isActive = activeParams.get(group.key)?.split(",").includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2.5 cursor-pointer py-1 group/label",
                      isActive && "text-jw-red"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={!!isActive}
                      onChange={() => updateFilter(group.key, option.value)}
                      className={cn(
                        "h-4 w-4 rounded border-jw-gray-300 accent-jw-red cursor-pointer"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm transition-colors group-hover/label:text-jw-red",
                        isActive ? "font-semibold text-jw-red" : "text-jw-gray-700"
                      )}
                    >
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-jw-gray-500 ml-auto">
                        ({option.count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function CatalogFilters({
  groups,
  sortOptions,
}: {
  groups: FilterGroup[];
  sortOptions: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = useActiveCount(groups);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      {/* Toolbar mobile: filtros + ordenar */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors",
            activeCount > 0
              ? "border-jw-red text-jw-red bg-jw-red/5"
              : "border-jw-gray-200 text-jw-gray-700 bg-white"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-jw-red text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <SortSelect options={sortOptions} className="ml-auto" />
      </div>

      {/* Desktop sidebar content */}
      <div className="hidden lg:block">
        <FiltersPanel groups={groups} sortOptions={sortOptions} />
      </div>

      {/* Mobile: chips de filtros activos */}
      <div className="lg:hidden mt-3">
        <FiltersPanel groups={groups} sortOptions={sortOptions} render="chips-only" />
      </div>

      {/* Mobile drawer (portal para evitar containing blocks y stacking issues) */}
      {isOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[86vw] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 h-14 border-b border-jw-gray-100 flex-shrink-0">
              <span className="text-sm font-bold text-jw-black flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-jw-red" />
                Filtros
                {activeCount > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-jw-red text-white text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-jw-off-white transition-colors"
                aria-label="Cerrar filtros"
              >
                <X className="h-5 w-5 text-jw-gray-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FiltersPanel groups={groups} sortOptions={sortOptions} />
            </div>
            <div className="p-4 border-t border-jw-gray-100 flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full h-11 rounded-xl bg-jw-red text-white text-sm font-bold shadow-sm active:scale-[0.98] transition-transform"
              >
                Ver {activeCount > 0 ? `${activeCount} filtro${activeCount > 1 ? "s" : ""} aplicado${activeCount > 1 ? "s" : ""}` : "productos"}
              </button>
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}