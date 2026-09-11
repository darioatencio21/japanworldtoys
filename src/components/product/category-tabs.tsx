"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CategoryTab {
  label: string;
  slug: string;
  image: string;
}

export function CategoryTabs({ tabs }: { tabs: CategoryTab[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeValues =
    searchParams.get("categoria")?.split(",").filter(Boolean) ?? [];

  const toggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("categoria")?.split(",").filter(Boolean) ?? [];
    const idx = current.indexOf(slug);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(slug);
    }
    if (current.length > 0) {
      params.set("categoria", current.join(","));
    } else {
      params.delete("categoria");
    }
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {tabs.map((tab) => {
        const isActive = activeValues.includes(tab.slug);
        return (
          <button
            key={tab.slug}
            type="button"
            onClick={() => toggle(tab.slug)}
            aria-pressed={isActive}
            className="group flex flex-col items-center gap-1 focus:outline-none"
          >
            <span
              className={cn(
                "relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-white shadow-sm ring-1 transition-all duration-200",
                isActive
                  ? "ring-2 ring-jw-red shadow-md"
                  : "ring-jw-gray-200 group-hover:ring-jw-red/50 group-hover:shadow-md group-hover:scale-105"
              )}
            >
              <Image
                src={tab.image}
                alt={tab.label}
                fill
                sizes="64px"
                className="object-cover"
              />
              {isActive && (
                <span className="absolute inset-0 bg-jw-red/10" aria-hidden />
              )}
            </span>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-semibold transition-colors",
                isActive ? "text-jw-red" : "text-jw-black group-hover:text-jw-red"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
