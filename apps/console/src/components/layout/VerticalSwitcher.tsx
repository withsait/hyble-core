"use client";

import { cn } from "@hyble/ui";

type VerticalType = "gaming" | "digital" | "cloud";

interface VerticalSwitcherProps {
  activeVertical: VerticalType;
  onVerticalChange: (vertical: VerticalType) => void;
}

const verticals = [
  {
    id: "gaming" as const,
    name: "Gaming",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "studios",
    activeClass: "bg-studios-50 text-studios-700 border-studios-200",
    hoverClass: "hover:bg-studios-50/50",
  },
  {
    id: "digital" as const,
    name: "Digital",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    color: "digital",
    activeClass: "bg-digital-50 text-digital-700 border-digital-200",
    hoverClass: "hover:bg-digital-50/50",
  },
  {
    id: "cloud" as const,
    name: "Cloud",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    color: "cloud",
    activeClass: "bg-cloud-50 text-cloud-700 border-cloud-200",
    hoverClass: "hover:bg-cloud-50/50",
  },
];

export function VerticalSwitcher({
  activeVertical,
  onVerticalChange,
}: VerticalSwitcherProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      {verticals.map((vertical) => (
        <button
          key={vertical.id}
          onClick={() => onVerticalChange(vertical.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            activeVertical === vertical.id
              ? `${vertical.activeClass} border shadow-sm`
              : `text-foreground-secondary ${vertical.hoverClass}`
          )}
        >
          {vertical.icon}
          <span className="hidden sm:inline">{vertical.name}</span>
        </button>
      ))}
    </div>
  );
}
