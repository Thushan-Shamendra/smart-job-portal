"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ApplyJobResponse = {
  success: boolean;
  message?: string;
  application?: unknown;
};

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [cvUrl, setCvUrl] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleApply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coverLetter,
            cvUrl,
          }),
        }
      );

      const data: ApplyJobResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to apply for job");
        return;
      }

      setMessage("Job application submitted successfully");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetterChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCoverLetter(e.target.value);
  };

  const handleCvUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCvUrl(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href={`/jobs/${id}`} className="text-blue-600">
          Back to Job Details
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-6">Apply for Job</h1>

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

        <form onSubmit={handleApply}>
          <label className="block mb-2 font-medium">Cover Letter</label>

          <textarea
            value={coverLetter}
            onChange={handleCoverLetterChange}
            placeholder="Write a short cover letter"
            className="w-full border p-3 rounded mb-4 h-40"
            required
          />

          <label className="block mb-2 font-medium">CV URL</label>

          <input
            type="text"
            value={cvUrl}
            onChange={handleCvUrlChange}
            placeholder="https://example.com/my-cv.pdf"
            className="w-full border p-3 rounded mb-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}