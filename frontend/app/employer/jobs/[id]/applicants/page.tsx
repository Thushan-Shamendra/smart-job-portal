"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Button, { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import { downloadApplicationCV } from "@/lib/downloadApplicationCV";
import type {
  ApplicationStatus,
  ApplicationsResponse,
  JobApplication,
} from "@/lib/types";

const applicationStatuses: ApplicationStatus[] = [
  "Pending",
  "Reviewed",
  "Shortlisted",
  "Rejected",
  "Accepted",
];

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["employer"],
  });

  const jobId = params.id as string;

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [downloadingId, setDownloadingId] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadApplicants = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<ApplicationsResponse>(
          `/applications/job/${jobId}`,
          { token }
        );

        setApplications(data.applications);
        setJobTitle(data.applications[0]?.job?.title || "");
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load applicants."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadApplicants();
  }, [jobId, router, sessionLoading, token, user]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    if (!token) {
      router.push("/login");
      return;
    }

    setStatusMessage("");
    setError("");

    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: "PUT",
        token,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );
      setStatusMessage("Application status updated successfully.");
    } catch (statusError) {
      if (isUnauthorizedError(statusError)) {
        router.push("/login");
        return;
      }

      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update the application status."
      );
    }
  };

  const handleSelectChange = (
    e: ChangeEvent<HTMLSelectElement>,
    applicationId: string
  ) => {
    void handleStatusChange(applicationId, e.target.value as ApplicationStatus);
  };

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
          {Array.from({ length: 2 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-80 w-full rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Employer"
        title={jobTitle ? `Applicants for ${jobTitle}` : "Applicants"}
        description="Review cover letters, explore extracted skills, and keep every candidate moving through the hiring pipeline."
        actions={
          <Link
            href="/employer/my-jobs"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to My Jobs
          </Link>
        }
      />

      <div className="mt-8 space-y-4">
        {statusMessage ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {statusMessage}
          </div>
        ) : null}
        {error ? <ErrorState message={error} /> : null}
        {downloadError ? (
          <ErrorState title="Download failed" message={downloadError} />
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        {applications.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">
              No applicants have submitted to this role yet.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <article
              key={application._id}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {application.applicant?.name || "Candidate"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {application.applicant?.email || "Email unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {application.applicant?.phone || "Phone not provided"}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <StatusBadge status={application.status} />
                  <select
                    value={application.status}
                    onChange={(e) => handleSelectChange(e, application._id)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {applicationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
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

                {application.applicant?._id ? (
                  <Link
                    href={`/profile/${application.applicant._id}`}
                    className={buttonStyles({ variant: "outline", size: "md" })}
                  >
                    View Profile
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
