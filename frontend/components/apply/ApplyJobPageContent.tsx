"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024;

const allowedCVTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type ApplyJobResponse = {
  success: boolean;
  message?: string;
  extractedSkills?: string[];
};

export default function ApplyJobPageContent() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.id as string;

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

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
  };

  const handleApply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setExtractedSkills([]);

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!coverLetter.trim()) {
      setError("Cover letter is required.");
      return;
    }

    if (!selectedCV) {
      setError("Please upload your CV before submitting.");
      return;
    }

    if (!allowedCVTypes.includes(selectedCV.type)) {
      setError("Please upload a PDF or DOCX CV file.");
      return;
    }

    if (selectedCV.size > MAX_CV_SIZE_BYTES) {
      setError("CV file size must be 2 MB or less.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter.trim());
      formData.append("cv", selectedCV);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${jobId}/apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data: ApplyJobResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to apply for job.");
        return;
      }

      setExtractedSkills(data.extractedSkills || []);
      setMessage(data.message || "Job application submitted successfully.");
      setCoverLetter("");
      resetSelection();
    } catch {
      setError("Something went wrong while submitting your application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href={`/jobs/${jobId}`} className="text-blue-600">
          Back to Job Details
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-6">Apply for Job</h1>

        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <p className="font-medium">{message}</p>

            <p className="mt-1 text-sm">
              Your CV was uploaded successfully and analyzed for matching
              skills.
            </p>
          </div>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
        )}

        {message ? (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h2 className="text-xl font-semibold mb-3">Extracted Skills</h2>

              {extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No skills were extracted from this CV.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/my-applications")}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Go to My Applications
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setExtractedSkills([]);
                }}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50 transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Cover Letter</label>

              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a short cover letter"
                className="w-full border p-3 rounded h-40"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Upload CV</label>

              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleCVChange}
                className="w-full border p-3 rounded bg-white"
                required
              />

              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF and DOCX. Maximum size: 2 MB.
              </p>

              {selectedFilename && (
                <p className="text-sm text-gray-700 mt-2">
                  Selected file:{" "}
                  <span className="font-medium">{selectedFilename}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-green-400 transition"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
