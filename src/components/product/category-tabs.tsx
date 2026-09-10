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
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {tabs.map((tab) => {
        const isActive = activeValues.includes(tab.slug);
        return (
          <button
            key={tab.slug}
            type="button"
            onClick={() => toggle(tab.slug)}
            aria-pressed={isActive}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span
              className={cn(
                "relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-white shadow-sm ring-1 transition-all duration-200",
                isActive
                  ? "ring-2 ring-jw-red shadow-md"
                  : "ring-jw-gray-200 group-hover:ring-jw-red/50 group-hover:shadow-md group-hover:scale-105"
              )}
            >
              <Image
                src={tab.image}
                alt={tab.label}
                fill
                sizes="96px"
                className="object-cover"
              />
              {isActive && (
                <span className="absolute inset-0 bg-jw-red/10" aria-hidden />
              )}
            </span>
            <span
              className={cn(
                "text-xs sm:text-sm font-semibold transition-colors",
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
