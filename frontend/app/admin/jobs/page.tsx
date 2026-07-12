"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import { buttonStyles } from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { Job, JobsResponse } from "@/lib/types";

export default function AdminJobsPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["admin"],
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<JobsResponse>("/admin/jobs", { token });
        setJobs(data.jobs);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Unable to load jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, [router, sessionLoading, token, user]);

  const confirmDelete = async () => {
    if (!token || !jobToDelete) {
      return;
    }

    setDeleting(true);

    try {
      await apiRequest(`/admin/jobs/${jobToDelete._id}`, {
        method: "DELETE",
        token,
      });

      setJobs((current) => current.filter((item) => item._id !== jobToDelete._id));
      setJobToDelete(null);
    } catch (deleteError) {
      if (isUnauthorizedError(deleteError)) {
        router.push("/login");
        return;
      }

      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete this job."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-72 w-full rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Admin"
        title="Review all platform job listings"
        description="Review employer-owned listings and remove roles that should no longer appear publicly."
        />

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} />
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Jobs created by employers will appear here automatically."
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              userRole="admin"
              showApplyAction={false}
              footer={
                <>
                  <Link
                    href={`/jobs/${job._id}`}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    View Job
                  </Link>
                  <button
                    type="button"
                    onClick={() => setJobToDelete(job)}
                    className={buttonStyles({ variant: "danger", size: "sm" })}
                  >
                    Delete Job
                  </button>
                </>
              }
            />
          ))
        )}
      </div>

      <ConfirmationModal
        open={Boolean(jobToDelete)}
        title="Delete this job listing?"
        description={`This will permanently remove "${jobToDelete?.title || "this job"}" from JobPilot.`}
        confirmLabel="Delete Job"
        busy={deleting}
        onCancel={() => setJobToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
