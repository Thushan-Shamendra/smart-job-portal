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

type Employer = {
  _id: string;
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
  category: string;
  salary: string;
  deadline: string;
  skills?: string[];
  isActive: boolean;
  employer?: Employer;
  createdAt: string;
};

type JobsResponse = {
  success: boolean;
  message?: string;
  jobs: Job[];
};

type DeleteJobResponse = {
  success: boolean;
  message?: string;
};

export default function AdminJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJobs = async () => {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: JobsResponse = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch jobs");
          return;
        }

        setJobs(data.jobs);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

  const handleDeleteJob = async (jobId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this job?");

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: DeleteJobResponse = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete job");
        return;
      }

      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));

      alert(data.message || "Job deleted successfully");
    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-6">Loading jobs...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Jobs</h1>
            <p className="text-gray-600 mt-1">
              View and remove invalid or fake job posts.
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

        {jobs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>No jobs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{job.title}</h2>

                    <p className="text-gray-700 mb-1">
                      <strong>Company:</strong> {job.company}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Employer:</strong>{" "}
                      {job.employer?.name || "Not available"}{" "}
                      {job.employer?.email && `(${job.employer.email})`}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Location:</strong> {job.location}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Type:</strong> {job.jobType}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Category:</strong> {job.category}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Salary:</strong> {job.salary}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          job.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>

                    <p className="text-gray-700 mb-4">
                      <strong>Deadline:</strong>{" "}
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-4">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}