import { Avatar as AvatarRoot, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Written out in full: Tailwind only generates classes it finds as complete strings.
// The order is fixed for good: changing the length would recolor almost everyone.
const COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];

// The same id always lands on the same color, on every device. Nothing is stored.
function colorFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps { name: string; colorKey: string; size?: "sm" | "default" | "lg" | "xl" }

export function Avatar({ name, colorKey, size = "default" }: AvatarProps) {
  // The shadcn Avatar stops at lg (40px). xl is ours: the default size with bigger classes.
  const xl = size === "xl";
  return (
    <AvatarRoot size={xl ? "default" : size} className={xl ? "size-20" : undefined}>
      <AvatarFallback className={cn(colorFor(colorKey), xl && "text-3xl")}>{name[0]}</AvatarFallback>
    </AvatarRoot>
  );
}
