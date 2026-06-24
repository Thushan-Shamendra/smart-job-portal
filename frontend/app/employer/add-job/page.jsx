"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddJobPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    skills: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    category: "",
    deadline: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "employer") {
      setError("Only employers can post jobs");
      setLoading(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(",").map((skill) => skill.trim()),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create job");
        return;
      }

      setMessage("Job created successfully");

      setTimeout(() => {
        router.push("/employer/my-jobs");
      }, 1500);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link href="/dashboard" className="text-blue-600">
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-6">Post New Job</h1>

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

        <form onSubmit={handleAddJob} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded h-32"
            required
          />

          <textarea
            name="requirements"
            placeholder="Job Requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full border p-3 rounded h-32"
            required
          />

          <input
            type="text"
            name="skills"
            placeholder="Skills, example: React, Next.js, Node.js"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            name="salary"
            placeholder="Salary, example: Rs. 150,000"
            value={formData.salary}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>

          <input
            type="text"
            name="category"
            placeholder="Category, example: Software Development"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}