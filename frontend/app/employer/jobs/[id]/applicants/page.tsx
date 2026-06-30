"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = "jobseeker" | "employer" | "admin";

type LoggedUser = {
  id: string;
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

type Applicant = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type Job = {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  jobType?: string;
};

type JobApplication = {
  _id: string;
  job?: Job;
  applicant?: Applicant;
  coverLetter?: string;
  cvUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
};

type ApplicationsResponse = {
  success: boolean;
  message?: string;
  applications: JobApplication[];
};

type StatusUpdateResponse = {
  success: boolean;
  message?: string;
  application?: JobApplication;
};

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchApplicants = async () => {
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/job/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: ApplicationsResponse = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch applicants");
          return;
        }

        setApplications(data.applications);

        if (data.applications.length > 0) {
          setJobTitle(data.applications[0].job?.title || "");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id, router]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data: StatusUpdateResponse = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application._id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );

      alert("Application status updated successfully");
    } catch {
      alert("Something went wrong");
    }
  };

  const handleSelectChange = (
    e: ChangeEvent<HTMLSelectElement>,
    applicationId: string
  ) => {
    handleStatusChange(applicationId, e.target.value as ApplicationStatus);
  };

  if (loading) {
    return <p className="p-6">Loading applicants...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Applicants</h1>
            {jobTitle && <p className="text-gray-600 mt-1">{jobTitle}</p>}
          </div>

          <div className="flex gap-4">
            <Link href="/employer/my-jobs" className="text-blue-600">
              My Jobs
            </Link>

            <Link href="/dashboard" className="text-green-600">
              Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
        )}

        {applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>No applicants for this job yet.</p>
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
                      {application.applicant?.name}
                    </h2>

                    <p className="text-gray-700 mb-1">
                      <strong>Email:</strong> {application.applicant?.email}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Phone:</strong>{" "}
                      {application.applicant?.phone || "Not provided"}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Applied Date:</strong>{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-gray-700 mb-4">
                      <strong>Status:</strong>{" "}
                      <span className="font-semibold text-blue-600">
                        {application.status}
                      </span>
                    </p>
                  </div>

                  <select
                    value={application.status}
                    onChange={(e) => handleSelectChange(e, application._id)}
                    className="border p-2 rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Accepted">Accepted</option>
                  </select>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Cover Letter</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">
                    {application.coverLetter || "No cover letter provided"}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  {application.cvUrl && (
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      View CV
                    </a>
                  )}

                  <Link
                    href={`/profile/${application.applicant?._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}