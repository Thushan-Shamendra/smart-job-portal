"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Button, { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import TextareaField from "@/components/ui/TextareaField";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, buildApiUrl, isUnauthorizedError } from "@/lib/api";
import type {
  ApplyJobResponse,
  CVFile,
  Job,
  JobResponse,
  ProfileResponse,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";

const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024;

const allowedCVTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ApplyJobPageContent() {
  const params = useParams();
  const router = useRouter();
  const { loading: sessionLoading, token } = useAppSession({
    required: true,
    allowedRoles: ["jobseeker"],
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [profileCV, setProfileCV] = useState<CVFile | null>(null);
  const [showCVPicker, setShowCVPicker] = useState(false);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    const loadPageData = async () => {
      setPageLoading(true);
      setError("");

      try {
        const jobPromise = apiRequest<JobResponse>(`/jobs/${jobId}`);
        const profilePromise = token
          ? apiRequest<ProfileResponse>("/profile/me", { token }).catch(() => ({
              success: false,
            } as ProfileResponse))
          : Promise.resolve({ success: false } as ProfileResponse);

        const [jobResult, profileResult] = await Promise.all([
          jobPromise,
          profilePromise,
        ]);

        if (jobResult.job) {
          setJob(jobResult.job);
        } else {
          setError("Job not found.");
        }

        const existingProfileCV = profileResult.profile?.cv || null;

        setProfileCV(existingProfileCV);
        setShowCVPicker(!existingProfileCV);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load this job."
        );
      } finally {
        setPageLoading(false);
      }
    };

    void loadPageData();
  }, [jobId, sessionLoading, token]);

  const resetSelection = () => {
    setSelectedCV(null);
    setSelectedFilename("");
  };

  const handleCVChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setError("");
    setMessage("");

    if (!file) {
      resetSelection();
      return;
    }

    if (!allowedCVTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX CV file.");
      e.target.value = "";
      resetSelection();
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setError("CV file size must be 2 MB or less.");
      e.target.value = "";
      resetSelection();
      return;
    }

    setSelectedCV(file);
    setSelectedFilename(file.name);
    setShowCVPicker(true);
  };

  const getProfileCVFile = async () => {
    if (!token || !profileCV?.originalName) {
      return null;
    }

    const response = await fetch(buildApiUrl("/profile/me/cv"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let message = "Unable to load your saved CV.";

      try {
        const errorData = (await response.json()) as { message?: string };
        message = errorData.message || message;
      } catch {
        // Ignore binary parse failures.
      }

      throw new Error(message);
    }

    const blob = await response.blob();
    const fileType =
      profileCV.contentType || blob.type || "application/octet-stream";

    return new File([blob], profileCV.originalName, {
      type: fileType,
    });
  };

  const handleApply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    setMessage("");
    setError("");
    setExtractedSkills([]);

    if (!coverLetter.trim()) {
      setError("Cover letter is required.");
      return;
    }

    setSubmitting(true);

    try {
      let cvToSubmit = selectedCV;

      if (!cvToSubmit && profileCV?.originalName) {
        cvToSubmit = await getProfileCVFile();
      }

      if (!cvToSubmit) {
        setError("Please upload your CV before submitting.");
        return;
      }

      if (!allowedCVTypes.includes(cvToSubmit.type)) {
        setError("Please upload a PDF or DOCX CV file.");
        return;
      }

      if (cvToSubmit.size > MAX_CV_SIZE_BYTES) {
        setError("CV file size must be 2 MB or less.");
        return;
      }

      const formData = new FormData();
      formData.append("coverLetter", coverLetter.trim());
      formData.append("cv", cvToSubmit);

      const data = await apiRequest<ApplyJobResponse>(
        `/applications/${jobId}/apply`,
        {
          method: "POST",
          token,
          body: formData,
        }
      );

      setExtractedSkills(data.extractedSkills || []);
      setMessage(data.message || "Job application submitted successfully.");
      setCoverLetter("");
      resetSelection();
      setShowCVPicker(!profileCV);
    } catch (submitError) {
      if (isUnauthorizedError(submitError)) {
        router.push("/login");
        return;
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading || pageLoading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <LoadingSkeleton className="h-80 w-full rounded-[32px]" />
          <LoadingSkeleton className="h-[34rem] w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (error && !job && !message) {
    return (
      <div className="page-shell">
        <ErrorState
          title="Application unavailable"
          message={error}
          action={
            <Link
              href="/jobs"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Back to Jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Apply for Job"
        title={job ? `Apply for ${job.title}` : "Submit your application"}
        description={
          job
            ? `${job.company} - ${job.location} - Deadline ${formatDate(job.deadline)}`
            : "Upload your CV and submit a tailored cover letter."
        }
        actions={
          <Link
            href={job ? `/jobs/${job._id}` : "/jobs"}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to Job Details
          </Link>
        }
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              CV upload rules
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Accepted file formats: PDF and DOCX only.</li>
              <li>Maximum file size: 2 MB.</li>
              <li>Your CV is sent as `FormData` using the `cv` field.</li>
              <li>Authentication stays on the Authorization header.</li>
            </ul>
          </div>

          {job ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Role snapshot
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Company:</span>{" "}
                  {job.company}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Location:</span>{" "}
                  {job.location}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Job type:</span>{" "}
                  {job.jobType}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Category:</span>{" "}
                  {job.category}
                </p>
              </div>
            </div>
          ) : null}
        </aside>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          {message ? (
            <div>
              <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="text-xl font-semibold text-emerald-800">
                  Application submitted successfully
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  {message}
                </p>
              </div>

              <div className="mt-8 rounded-[28px] bg-slate-50 p-6">
                <h3 className="text-xl font-semibold text-slate-950">
                  Skills extracted from your CV
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These are the skills returned by the Groq-powered CV analysis
                  service.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {extractedSkills.length > 0 ? (
                    extractedSkills.map((skill) => (
                      <SkillBadge key={skill} label={skill} />
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">
                      No skills were extracted from this CV.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/my-applications"
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  Go to My Applications
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMessage("");
                    setExtractedSkills([]);
                  }}
                >
                  Submit Another Application
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error ? <ErrorState message={error} /> : null}

              <form onSubmit={handleApply} className="mt-6 space-y-5">
                <TextareaField
                  label="Cover Letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you're a strong fit for this role and highlight relevant achievements."
                  rows={8}
                  required
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="block text-sm font-medium text-slate-700">
                      Upload CV
                    </span>
                    {profileCV?.originalName ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCVPicker(true);
                          fileInputRef.current?.click();
                        }}
                      >
                        Change CV
                      </Button>
                    ) : null}
                  </div>

                  {profileCV?.originalName && !selectedFilename ? (
                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        Using saved profile CV
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {profileCV.originalName}
                      </p>
                    </div>
                  ) : null}

                  <label className={showCVPicker || !profileCV ? "block" : "hidden"}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCVChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                    <span className="mt-2 block text-sm text-slate-500">
                      Upload one PDF or DOCX file, up to 2 MB.
                    </span>
                  </label>
                </div>

                {selectedFilename ? (
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Selected file
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedFilename}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? "Uploading CV and submitting..." : "Submit Application"}
                  </Button>
                  <Link
                    href="/my-applications"
                    className={buttonStyles({ variant: "outline", size: "lg" })}
                  >
                    View My Applications
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
