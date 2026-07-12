"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["admin"],
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
          "/admin/applications",
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
            : "Unable to load applications."
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
      await downloadApplicationCV(
        applicationId,
        token,
        originalName || "candidate-cv"
      );
    } catch (downloadFailure) {
      setDownloadError(
        downloadFailure instanceof Error
          ? downloadFailure.message
          : "Unable to download the CV."
      );
    } finally {
      setDownloadingId("");
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-80 w-full rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Admin"
        title="Platform-wide application oversight"
        description="Inspect candidate submissions, extracted skill sets, job associations, and secure CV downloads from one place."
      />

      <div className="mt-8 space-y-4">
        {error ? <ErrorState message={error} /> : null}
        {downloadError ? (
          <ErrorState title="Download failed" message={downloadError} />
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        {applications.length === 0 ? (
          <EmptyState
            title="No applications found"
            description="Applications submitted through JobPilot will appear here for admin review."
          />
        ) : (
          applications.map((application) => (
            <article
              key={application._id}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {application.job?.title || "Job unavailable"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {application.job?.company || "Unknown company"} -{" "}
                    {application.job?.location || "Unknown location"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Applicant: {application.applicant?.name || "Unknown"}{" "}
                    {application.applicant?.email
                      ? `(${application.applicant.email})`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Employer: {application.employer?.name || "Unknown"}{" "}
                    {application.employer?.email
                      ? `(${application.employer.email})`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={application.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Applied {formatDate(application.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  Cover Letter
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {application.coverLetter || "No cover letter provided."}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-950">
                  Extracted Skills
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
                      No extracted skills found for this application.
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
                    View Job
                  </Link>
                ) : null}

                {application.applicant?._id ? (
                  <Link
                    href={`/profile/${application.applicant._id}`}
                    className={buttonStyles({ variant: "outline", size: "md" })}
                  >
                    View Applicant
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
                      ? "Downloading CV..."
                      : "Download CV"}
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
