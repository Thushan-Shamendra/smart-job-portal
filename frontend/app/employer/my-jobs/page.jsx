"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

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
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/my-jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch jobs");
        return;
      }

      setJobs(data.jobs);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async (jobId) => {
    const confirmDelete = confirm("Are you sure you want to delete this job?");

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete job");
        return;
      }

      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (error) {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-6">Loading jobs...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Posted Jobs</h1>

          <div className="flex gap-4">
            <Link href="/employer/add-job" className="text-green-600">
              Post New Job
            </Link>

            <Link href="/dashboard" className="text-blue-600">
              Dashboard
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
            <p>You have not posted any jobs yet.</p>

            <Link
              href="/employer/add-job"
              className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Post First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-2">{job.title}</h2>

                <p className="text-gray-700 mb-1">
                  <strong>Company:</strong> {job.company}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Location:</strong> {job.location}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Type:</strong> {job.jobType}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Salary:</strong> {job.salary}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Status:</strong>{" "}
                  {job.isActive ? "Active" : "Inactive"}
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

                <div className="flex gap-3">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View
                  </Link>

                  <Link
                    href={`/employer/jobs/${job._id}/applicants`}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Applicants
                  </Link>

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}