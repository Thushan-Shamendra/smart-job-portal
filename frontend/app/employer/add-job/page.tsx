"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import JobForm, { type JobFormValues } from "@/components/jobs/JobForm";
import { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { JobResponse } from "@/lib/types";
import { toSkillList } from "@/lib/utils";

const initialFormState: JobFormValues = {
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

export default function AddJobPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["employer"],
  });

  const [formData, setFormData] = useState<JobFormValues>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest<JobResponse>("/jobs", {
        method: "POST",
        token,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills: toSkillList(formData.skills),
        }),
      });

      setMessage(data.message || "Job created successfully.");
      setFormData(initialFormState);
    } catch (saveError) {
      if (isUnauthorizedError(saveError)) {
        router.push("/login");
        return;
      }

      setError(
        saveError instanceof Error ? saveError.message : "Unable to create this job."
      );
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading) {
    return <div className="page-shell" />;
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Employer"
        title="Create a polished job listing"
        description="Create a clear, compelling role that reaches candidates across JobPilot's hiring experience."
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
          onSubmit={handleAddJob}
          saving={saving}
          submitLabel="Post Job"
        />
      </div>
    </div>
  );
}
