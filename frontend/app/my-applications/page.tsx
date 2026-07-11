"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { downloadApplicationCV } from "@/lib/downloadApplicationCV";

type ApplicationStatus =
  | "Pending"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Accepted";

type AppliedJob = {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
};

type JobApplication = {
  _id: string;
  job?: AppliedJob;
  cv?: {
    originalName?: string;
    filename?: string;
    contentType?: string;
    size?: number;
  };
  extractedSkills?: string[];
  status: ApplicationStatus;
  createdAt: string;
};

type ApplicationsResponse = {
  success: boolean;
  message?: string;
  applications: JobApplication[];
};

export default function MyApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [downloadError, setDownloadError] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string>("");

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/my-applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: ApplicationsResponse = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch applications");
          return;
        }

        setApplications(data.applications);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  const handleDownloadCV = async (
    applicationId: string,
    originalName?: string
  ) => {
    const token = localStorage.getItem("token");

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
        originalName || "my-cv"
      );
    } catch (downloadFailure) {
      setDownloadError(
        downloadFailure instanceof Error
          ? downloadFailure.message
          : "Something went wrong while downloading your CV."
      );
    } finally {
      setDownloadingId("");
    }
  };

  if (loading) {
    return <p className="p-6">Loading applications...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Applications</h1>

          <Link href="/dashboard" className="text-blue-600">
            Dashboard
          </Link>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        {downloadError && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {downloadError}
          </p>
        )}

        {applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>You have not applied for any jobs yet.</p>

            <Link
              href="/jobs"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h2 className="text-xl font-bold mb-2">
                  {application.job?.title}
                </h2>

                <p className="text-gray-700 mb-1">
                  <strong>Company:</strong> {application.job?.company}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Location:</strong> {application.job?.location}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Job Type:</strong> {application.job?.jobType}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Salary:</strong> {application.job?.salary}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Status:</strong>{" "}
                  <span className="font-semibold text-blue-600">
                    {application.status}
                  </span>
                </p>

                <p className="text-gray-700 mb-4">
                  <strong>Applied Date:</strong>{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>

                <div className="mb-4">
                  <p className="font-semibold mb-2">Extracted Skills:</p>

                  {application.extractedSkills &&
                  application.extractedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {application.extractedSkills.map((skill) => (
                        <span
                          key={`${application._id}-${skill}`}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No extracted skills found.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/jobs/${application.job?._id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Job
                  </Link>

                  {application.cv && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadCV(
                          application._id,
                          application.cv?.originalName
                        )
                      }
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      {downloadingId === application._id
                        ? "Downloading My CV..."
                        : "Download My CV"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
