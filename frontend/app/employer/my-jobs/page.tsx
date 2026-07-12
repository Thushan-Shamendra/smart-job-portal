"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function MyJobsPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["employer"],
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
        const data = await apiRequest<JobsResponse>("/jobs/my-jobs", { token });
        setJobs(data.jobs);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Unable to load your jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, [router, sessionLoading, token, user]);

  const handleDelete = async () => {
    if (!token || !jobToDelete) {
      return;
    }

    setDeleting(true);

    try {
      await apiRequest(`/jobs/${jobToDelete._id}`, {
        method: "DELETE",
        token,
      });

      setJobs((current) => current.filter((job) => job._id !== jobToDelete._id));
      setJobToDelete(null);
    } catch (deleteError) {
      if (isUnauthorizedError(deleteError)) {
        router.push("/login");
        return;
      }

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this job."
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
        eyebrow="Employer"
        title="Manage your published roles"
        description="Track every job post you own, edit details, and move directly into the applicant review flow."
        actions={
          <Link
            href="/employer/add-job"
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Post New Job
          </Link>
        }
      />

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} />
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            description="Create your first listing to publish it to the public jobs page and start receiving applications."
            action={
              <Link
                href="/employer/add-job"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Post My First Job
              </Link>
            }
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              userRole={user?.role}
              showApplyAction={false}
              footer={
                <>
                  <Link
                    href={`/employer/jobs/${job._id}/edit`}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    Edit Job
                  </Link>
                    <Link
                      href={`/employer/jobs/${job._id}/applicants`}
                      className={buttonStyles({
                        variant: "secondary",
                        size: "sm",
                        className: "text-white hover:text-white visited:text-white",
                      })}
                      style={{ color: "#ffffff" }}
                    >
                      View Applicants
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
        title="Delete this job?"
        description={`This will remove "${jobToDelete?.title || "this job"}" from JobPilot. This action cannot be undone.`}
        confirmLabel="Delete Job"
        busy={deleting}
        onCancel={() => setJobToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
