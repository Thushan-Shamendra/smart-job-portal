"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  skills?: string[];
};

type JobsResponse = {
  success: boolean;
  message?: string;
  jobs: Job[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/jobs`;

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (location) params.append("location", location);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data: JobsResponse = await res.json();

      if (data.success) {
        setJobs(data.jobs);
      }
    } catch {
      console.log("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Available Jobs</h1>

          <Link href="/dashboard" className="text-blue-600">
            Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Search by title, company, or skill"
            value={search}
            onChange={handleSearchChange}
            className="border p-3 rounded"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={handleLocationChange}
            className="border p-3 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-3 hover:bg-blue-700"
          >
            Search Jobs
          </button>
        </form>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/jobs/${job._id}`}
                  className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}