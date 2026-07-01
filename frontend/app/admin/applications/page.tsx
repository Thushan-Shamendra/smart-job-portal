"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = "jobseeker" | "employer" | "admin";

type LoggedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
};

type Applicant = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

type Employer = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

type ApplicationStatus =
  | "Pending"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Accepted";

type Application = {
  _id: string;
  job?: Job;
  applicant?: Applicant;
  employer?: Employer;
  coverLetter?: string;
  cvUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
};

type ApplicationsResponse = {
  success: boolean;
  message?: string;
  applications: Application[];
};

export default function AdminApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");
      const loggedUser: LoggedUser | null = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token) {
        router.push("/login");
        return;
      }

      if (loggedUser?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/applications`,
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

  if (loading) {
    return <p className="p-6">Loading applications...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Applications</h1>
            <p className="text-gray-600 mt-1">
              View all job applications in the system.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="text-purple-600">
              Admin Dashboard
            </Link>

            <Link href="/dashboard" className="text-blue-600">
              Main Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        {applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>No applications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {application.job?.title || "Job not available"}
                    </h2>

                    <p className="text-gray-700 mb-1">
                      <strong>Company:</strong>{" "}
                      {application.job?.company || "Not available"}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Location:</strong>{" "}
                      {application.job?.location || "Not available"}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Job Type:</strong>{" "}
                      {application.job?.jobType || "Not available"}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Applicant:</strong>{" "}
                      {application.applicant?.name || "Not available"}{" "}
                      {application.applicant?.email &&
                        `(${application.applicant.email})`}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Employer:</strong>{" "}
                      {application.employer?.name || "Not available"}{" "}
                      {application.employer?.email &&
                        `(${application.employer.email})`}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          application.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : application.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : application.status === "Shortlisted"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {application.status}
                      </span>
                    </p>

                    <p className="text-gray-700 mb-4">
                      <strong>Applied Date:</strong>{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {application.job?._id && (
                      <Link
                        href={`/jobs/${application.job._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                      >
                        View Job
                      </Link>
                    )}

                    {application.applicant?._id && (
                      <Link
                        href={`/profile/${application.applicant._id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
                      >
                        View Applicant
                      </Link>
                    )}

                    {application.cvUrl && (
                      <a
                        href={application.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
                      >
                        View CV
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Cover Letter</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">
                    {application.coverLetter || "No cover letter provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}