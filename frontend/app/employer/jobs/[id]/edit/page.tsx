"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams } from "next/navigation";
import JobForm, { type JobFormValues } from "@/components/jobs/JobForm";
import { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { JobResponse } from "@/lib/types";
import { toSkillList } from "@/lib/utils";

const emptyFormState: JobFormValues = {
  title: "",
  company: "",
  description: "",
  requirements: "",
  skills: "",
  location: "",
  salary: "",
  jobType: "Full-time",
  category: "",
  deadline: "",
};

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["employer"],
  });

  const id = params.id as string;

  const [formData, setFormData] = useState<JobFormValues>(emptyFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadJob = async () => {
      setLoading(true);

      try {
        const data = await apiRequest<JobResponse>(`/jobs/${id}`);

        if (!data.job) {
          setError("Unable to find this job.");
          return;
        }

        setFormData({
          title: data.job.title || "",
          company: data.job.company || "",
          description: data.job.description || "",
          requirements: data.job.requirements || "",
          skills: data.job.skills?.join(", ") || "",
          location: data.job.location || "",
          salary: data.job.salary || "",
          jobType: data.job.jobType || "Full-time",
          category: data.job.category || "",
          deadline: data.job.deadline ? data.job.deadline.substring(0, 10) : "",
        });
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Unable to load this job."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id, router, sessionLoading, token, user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest<JobResponse>(`/jobs/${id}`, {
        method: "PUT",
        token,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills: toSkillList(formData.skills),
        }),
      });

      setMessage(data.message || "Job updated successfully.");
    } catch (saveError) {
      if (isUnauthorizedError(saveError)) {
        router.push("/login");
        return;
      }

      setError(
        saveError instanceof Error ? saveError.message : "Unable to update this job."
      );
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <LoadingSkeleton className="mt-8 h-[52rem] w-full rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Employer"
        title="Refine your job listing"
        description="Update the job details that power the public listing, recommendations, and applicant workflow."
        actions={
          <Link
            href="/employer/my-jobs"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to My Jobs
          </Link>
        }
      />

      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {message ? (
          <div className="mb-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6">
            <ErrorState message={error} />
          </div>
        ) : null}

        <JobForm
          value={formData}
          onChange={handleChange}
          onSubmit={handleUpdateJob}
          saving={saving}
          submitLabel="Update Job"
        />
      </div>
    </div>
  );
}
