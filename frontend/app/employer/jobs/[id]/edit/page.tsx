"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = "jobseeker" | "employer" | "admin";

type LoggedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type JobType = "Full-time" | "Part-time" | "Internship" | "Remote" | "Contract";

type JobFormData = {
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills: string;
  location: string;
  salary: string;
  jobType: JobType;
  category: string;
  deadline: string;
};

type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills?: string[];
  location: string;
  salary: string;
  jobType: JobType;
  category: string;
  deadline: string;
};

type JobResponse = {
  success: boolean;
  message?: string;
  job?: Job;
};

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [formData, setFormData] = useState<JobFormData>({
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
  });

  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchJob = async () => {
      const token = localStorage.getItem("token");
      const user: LoggedUser | null = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token) {
        router.push("/login");
        return;
      }

      if (user?.role !== "employer") {
        router.push("/dashboard");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`);
        const data: JobResponse = await res.json();

        if (!res.ok || !data.job) {
          setError(data.message || "Failed to fetch job details");
          return;
        }

        const job = data.job;

        setFormData({
          title: job.title || "",
          company: job.company || "",
          description: job.description || "",
          requirements: job.requirements || "",
          skills: job.skills?.join(", ") || "",
          location: job.location || "",
          salary: job.salary || "",
          jobType: job.jobType || "Full-time",
          category: job.category || "",
          deadline: job.deadline ? job.deadline.substring(0, 10) : "",
        });
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const updatedJobData = {
      ...formData,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== ""),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedJobData),
      });

      const data: JobResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update job");
        return;
      }

      setMessage("Job updated successfully");

      setTimeout(() => {
        router.push("/employer/my-jobs");
      }, 1500);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading job details...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/employer/my-jobs" className="text-blue-600">
          Back to My Jobs
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-6">Edit Job</h1>

        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleUpdateJob} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded h-32"
            required
          />

          <textarea
            name="requirements"
            placeholder="Job Requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full border p-3 rounded h-32"
            required
          />

          <input
            type="text"
            name="skills"
            placeholder="Skills, example: React, Next.js, Node.js"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="salary"
            placeholder="Salary, example: Rs. 150,000"
            value={formData.salary}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>

          <input
            type="text"
            name="category"
            placeholder="Category, example: Software Development"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? "Updating Job..." : "Update Job"}
          </button>
        </form>
      </div>
    </div>
  );
}