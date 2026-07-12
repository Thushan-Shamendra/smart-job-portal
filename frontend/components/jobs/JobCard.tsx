import type { ReactNode } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import SkillBadge from "@/components/ui/SkillBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Job, UserRole } from "@/lib/types";
import { cn, formatDate, formatRelativeDate, getInitials, isPastDate } from "@/lib/utils";

type JobCardProps = {
  job: Job;
  href?: string;
  userRole?: UserRole;
  showApplyAction?: boolean;
  className?: string;
  footer?: ReactNode;
};

export default function JobCard({
  job,
  href,
  userRole,
  showApplyAction = true,
  className,
  footer,
}: JobCardProps) {
  const jobHref = href || `/jobs/${job._id}`;
  const expired = isPastDate(job.deadline);
  const inactive = !job.isActive;

  return (
    <article
      className={cn(
        "group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-semibold text-white shadow-lg shadow-blue-600/20">
            {getInitials(job.company)}
          </div>
          <div>
            <Link
              href={jobHref}
              className="text-xl font-semibold tracking-tight text-slate-950 transition group-hover:text-blue-700"
            >
              {job.title}
            </Link>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {job.company}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Posted {formatRelativeDate(job.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge
            status={inactive ? "Inactive" : expired ? "Expired" : "Active"}
          />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {job.jobType}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-800">Location:</span>{" "}
          {job.location}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Salary:</span>{" "}
          {job.salary || "Not specified"}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Category:</span>{" "}
          {job.category}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Deadline:</span>{" "}
          {formatDate(job.deadline)}
        </p>
      </div>

      {job.skills && job.skills.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {job.skills.slice(0, 6).map((skill) => (
            <SkillBadge key={`${job._id}-${skill}`} label={skill} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <Link href={jobHref} className={buttonStyles({ variant: "primary" })}>
          View Details
        </Link>

        {showApplyAction &&
        userRole !== "employer" &&
        userRole !== "admin" &&
        !inactive &&
        !expired ? (
          <Link
            href={`/apply/${job._id}`}
            className={buttonStyles({ variant: "outline" })}
          >
            Apply Now
          </Link>
        ) : null}

        {footer}
      </div>
    </article>
  );
}
