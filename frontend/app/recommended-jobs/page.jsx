"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecommendedJobsPage() {
  const router = useRouter();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendedJobs = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "jobseeker") {
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/recommended`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch recommended jobs");
        return;
      }

      setRecommendedJobs(data.recommendedJobs);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  if (loading) {
    return <p className="p-6">Loading recommended jobs...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recommended Jobs</h1>

          <div className="flex gap-4">
            <Link href="/my-profile" className="text-green-600">
              My Profile
            </Link>

            <Link href="/dashboard" className="text-blue-600">
              Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <p>{error}</p>

            <Link
              href="/my-profile"
              className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Profile
            </Link>
          </div>
        )}

        {!error && recommendedJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>No recommended jobs found.</p>

            <p className="text-gray-600 mt-2">
              Add more skills to your profile or browse all jobs.
            </p>

            <div className="flex gap-3 mt-4">
              <Link
                href="/my-profile"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Update Profile
              </Link>

              <Link
                href="/jobs"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedJobs.map((item) => (
              <div
                key={item.job._id}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold">{item.job.title}</h2>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">
                    {item.matchPercentage}% Match
                  </span>
                </div>

                <p className="text-gray-700 mb-1">
                  <strong>Company:</strong> {item.job.company}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Location:</strong> {item.job.location}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Job Type:</strong> {item.job.jobType}
                </p>

                <p className="text-gray-700 mb-1">
                  <strong>Salary:</strong> {item.job.salary}
                </p>

                <p className="text-gray-700 mb-3">
                  <strong>Category:</strong> {item.job.category}
                </p>

                <div className="mb-4">
                  <p className="font-semibold mb-2">Matched Skills:</p>

                  <div className="flex flex-wrap gap-2">
                    {item.matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold mb-2">Required Skills:</p>

                  <div className="flex flex-wrap gap-2">
                    {item.job.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/jobs/${item.job._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </Link>

                  <Link
                    href={`/jobs/${item.job._id}/apply`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Apply Now
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