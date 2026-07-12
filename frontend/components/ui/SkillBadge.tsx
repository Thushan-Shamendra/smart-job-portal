import { cn } from "@/lib/utils";

type SkillBadgeProps = {
  label: string;
  muted?: boolean;
  className?: string;
};

export default function SkillBadge({
  label,
  muted = false,
  className,
}: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        muted
          ? "bg-slate-100 text-slate-600"
          : "bg-blue-100 text-blue-700",
        className
      )}
    >
      {label}
    </span>
  );
}
