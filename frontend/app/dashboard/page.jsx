"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

        {user.role === "jobseeker" && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
            <h2 className="font-semibold">Job Seeker Dashboard</h2>
            <p>You can search jobs, apply jobs, and manage your profile.</p>

            <div className="flex gap-3 mt-4">
            <a
                href="/my-profile"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                My Profile
            </a>

            <a
                href="/my-applications"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                My Applications
            </a>

            <a
                href="/jobs"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
                Browse Jobs
            </a>
            </div>
        </div>
        )}

        {user.role === "employer" && (
        <div className="mt-6 p-4 bg-green-50 rounded">
            <h2 className="font-semibold">Employer Dashboard</h2>
            <p>You can post jobs and manage applicants.</p>

            <div className="flex gap-3 mt-4">
            <a
                href="/employer/add-job"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Post New Job
            </a>

            <a
                href="/employer/my-jobs"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                My Jobs
            </a>
            </div>
        </div>
        )}

        {user.role === "admin" && (
          <div className="mt-6 p-4 bg-purple-50 rounded">
            <h2 className="font-semibold">Admin Dashboard</h2>
            <p>You can manage users, jobs, and applications.</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}