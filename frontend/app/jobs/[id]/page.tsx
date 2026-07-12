"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest } from "@/lib/api";
import type { Job, JobResponse, JobsResponse } from "@/lib/types";
import { formatDate, isPastDate } from "@/lib/utils";

export default function JobDetailsPage() {
  const params = useParams();
  const { user } = useAppSession();

  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError("");

      try {
        const jobData = await apiRequest<JobResponse>(`/jobs/${id}`);

        if (!jobData.job) {
          setError("Job not found.");
          setJob(null);
          return;
        }

        setJob(jobData.job);

        if (jobData.job.category) {
          const related = await apiRequest<JobsResponse>(
            `/jobs?category=${encodeURIComponent(jobData.job.category)}`
          );

          setRelatedJobs(
            related.jobs.filter((item) => item._id !== jobData.job?._id).slice(0, 3)
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this job."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id]);

  const expired = useMemo(() => (job ? isPastDate(job.deadline) : false), [job]);
  const inactive = useMemo(() => (job ? !job.isActive : false), [job]);
  const canApply =
    job &&
    user?.role !== "employer" &&
    user?.role !== "admin" &&
    !expired &&
    !inactive;

  if (loading) {
    return (
      <div className="page-shell">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <LoadingSkeleton className="h-5 w-40" />
          <LoadingSkeleton className="mt-5 h-10 w-2/3" />
          <LoadingSkeleton className="mt-4 h-5 w-1/2" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-5 w-full" />
            ))}
          </div>
          <LoadingSkeleton className="mt-8 h-32 w-full" />
          <LoadingSkeleton className="mt-6 h-28 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-shell">
        <ErrorState
          title="Job unavailable"
          message={error || "We could not find the requested job."}
          action={
            <Link
              href="/jobs"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Back to jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Job Details"
        title={job.title}
        description={`${job.company} - ${job.location}`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Back to Jobs
            </Link>

            {canApply ? (
              <Link
                href={`/apply/${job._id}`}
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Apply Now
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              status={inactive ? "Inactive" : expired ? "Expired" : "Active"}
            />
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {job.jobType}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {job.category}
            </span>
          </div>

          {(inactive || expired) && (
            <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-semibold text-amber-800">
                This job is no longer open for applications
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-700">
                {inactive
                  ? "The employer or admin has marked this job as inactive."
                  : "The application deadline has passed."}
              </p>
            </div>
          )}

          {user?.role === "employer" || user?.role === "admin" ? (
            <div className="mt-6 rounded-[24px] border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
              Apply actions are available only to jobseeker accounts for this role.
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Company</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {job.company}
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Salary</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {job.salary || "Not specified"}
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {job.location}
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Deadline</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatDate(job.deadline)}
              </p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Role overview
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {job.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Requirements
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {job.requirements}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Required skills
            </h2>
            {job.skills && job.skills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <SkillBadge key={`${job._id}-${skill}`} label={skill} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No specific skills were listed for this role.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Application quick actions
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Review the job details, confirm the deadline, then apply with your
              cover letter and CV upload.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {canApply ? (
                <Link
                  href={`/apply/${job._id}`}
                  className={buttonStyles({
                    variant: "primary",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  Apply for this role
                </Link>
              ) : (
                <Button variant="outline" disabled fullWidth>
                  Applications unavailable
                </Button>
              )}
              <Link
                href="/jobs"
                className={buttonStyles({
                  variant: "outline",
                  size: "md",
                  fullWidth: true,
                })}
              >
                Explore more jobs
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Related opportunities
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              More roles in a similar category that may also fit your search.
            </p>
            <div className="mt-5 space-y-4">
              {relatedJobs.length > 0 ? (
                relatedJobs.map((relatedJob) => (
                  <JobCard
                    key={relatedJob._id}
                    job={relatedJob}
                    userRole={user?.role}
                    className="p-5"
                  />
                ))
              ) : (
                <EmptyState
                  title="No related jobs yet"
                  description="More roles will appear here when matching categories are available."
                />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
