import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: ApplicationStatus | "Active" | "Inactive" | "Expired";
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        (status === "Pending" || status === "Reviewed") &&
          "bg-blue-100 text-blue-700",
        status === "Shortlisted" && "bg-amber-100 text-amber-700",
        status === "Accepted" && "bg-emerald-100 text-emerald-700",
        (status === "Rejected" || status === "Inactive" || status === "Expired") &&
          "bg-rose-100 text-rose-700",
        status === "Active" && "bg-emerald-100 text-emerald-700",
        className
      )}
    >
      {status}
    </span>
  );
}
