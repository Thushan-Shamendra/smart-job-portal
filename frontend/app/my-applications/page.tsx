"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import { downloadApplicationCV } from "@/lib/downloadApplicationCV";
import type { ApplicationsResponse, JobApplication } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function MyApplicationsPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["jobseeker"],
  });

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadApplications = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<ApplicationsResponse>(
          "/applications/my-applications",
          { token }
        );

        setApplications(data.applications);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your applications."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, [router, sessionLoading, token, user]);

  const handleDownloadCV = async (
    applicationId: string,
    originalName?: string
  ) => {
    if (!token) {
      router.push("/login");
      return;
    }

    setDownloadError("");
    setDownloadingId(applicationId);

    try {
      await downloadApplicationCV(applicationId, token, originalName || "my-cv");
    } catch (downloadFailure) {
      setDownloadError(
        downloadFailure instanceof Error
          ? downloadFailure.message
          : "Unable to download your CV."
      );
    } finally {
      setDownloadingId("");
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-64" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <LoadingSkeleton className="h-6 w-56" />
              <LoadingSkeleton className="mt-3 h-4 w-40" />
              <LoadingSkeleton className="mt-6 h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="My Applications"
        title="Track every application in one place"
        description="Review statuses, download the CV you submitted, and see the skills extracted from your uploaded file."
        actions={
          <Link
            href="/jobs"
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Browse More Jobs
          </Link>
        }
      />

      <div className="mt-8 space-y-4">
        {error ? <ErrorState message={error} /> : null}
        {downloadError ? <ErrorState title="Download failed" message={downloadError} /> : null}
      </div>

      <div className="mt-8 space-y-6">
        {!error && applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Your submitted applications will appear here with status updates and extracted CV skills."
            action={
              <Link
                href="/jobs"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Start applying
              </Link>
            }
          />
        ) : (
          applications.map((application) => (
            <article
              key={application._id}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {application.job?.title || "Job role unavailable"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {application.job?.company || "Unknown company"} ·{" "}
                    {application.job?.location || "Unknown location"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={application.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Applied {formatDate(application.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Job Type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {application.job?.jobType || "Not specified"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Salary</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {application.job?.salary || "Not specified"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Category</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {application.job?.category || "Not specified"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Deadline</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(application.job?.deadline)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Extracted CV Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {application.extractedSkills &&
                  application.extractedSkills.length > 0 ? (
                    application.extractedSkills.map((skill) => (
                      <SkillBadge
                        key={`${application._id}-${skill}`}
                        label={skill}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">
                      No skills were extracted from this application.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {application.job?._id ? (
                  <Link
                    href={`/jobs/${application.job._id}`}
                    className={buttonStyles({ variant: "outline", size: "md" })}
                  >
                    View Job Details
                  </Link>
                ) : null}

                {application.cv ? (
                  <Button
                    variant="success"
                    onClick={() =>
                      handleDownloadCV(
                        application._id,
                        application.cv?.originalName
                      )
                    }
                  >
                    {downloadingId === application._id
                      ? "Downloading My CV..."
                      : "Download My CV"}
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
