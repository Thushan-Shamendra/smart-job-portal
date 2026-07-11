"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills?: string[];
  location: string;
  salary: string;
  jobType: string;
  category: string;
  deadline: string;
};

type JobResponse = {
  success: boolean;
  message?: string;
  job?: Job;
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`
        );

        const data: JobResponse = await res.json();

        if (data.success && data.job) {
          setJob(data.job);
        }
      } catch {
        console.log("Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <p className="p-6">Loading job details...</p>;
  }

  if (!job) {
    return <p className="p-6">Job not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/jobs" className="text-blue-600">
          Back to Jobs
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-2">{job.title}</h1>

        <p className="text-gray-700 mb-1">
          <strong>Company:</strong> {job.company}
        </p>

        <p className="text-gray-700 mb-1">
          <strong>Location:</strong> {job.location}
        </p>

        <p className="text-gray-700 mb-1">
          <strong>Job Type:</strong> {job.jobType}
        </p>

        <p className="text-gray-700 mb-1">
          <strong>Category:</strong> {job.category}
        </p>

        <p className="text-gray-700 mb-1">
          <strong>Salary:</strong> {job.salary}
        </p>

        <p className="text-gray-700 mb-4">
          <strong>Deadline:</strong>{" "}
          {new Date(job.deadline).toLocaleDateString()}
        </p>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{job.description}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <p className="text-gray-700">{job.requirements}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.skills?.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
            >
              {skill}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push(`/apply/${job._id}`)}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
