"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplyJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [coverLetter, setCoverLetter] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
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

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to apply for job");
        return;
      }

      setMessage("Job application submitted successfully");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href={`/jobs/${id}`} className="text-blue-600">
          Back to Job Details
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-6">
          Apply for Job
        </h1>

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
          <label className="block mb-2 font-medium">
            Cover Letter
          </label>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Write a short cover letter"
            className="w-full border p-3 rounded mb-4 h-40"
            required
          />

          <label className="block mb-2 font-medium">
            CV URL
          </label>

          <input
            type="text"
            value={cvUrl}
            onChange={(e) => setCvUrl(e.target.value)}
            placeholder="https://example.com/my-cv.pdf"
            className="w-full border p-3 rounded mb-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}