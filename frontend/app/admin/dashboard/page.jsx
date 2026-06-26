"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch admin dashboard");
        return;
      }

      setStats(data.stats);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <p className="p-6">Loading admin dashboard...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage users, jobs, and applications
            </p>
          </div>

          <Link href="/dashboard" className="text-blue-600">
            Main Dashboard
          </Link>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Total Users</h2>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Job Seekers</h2>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalJobSeekers}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Employers</h2>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalEmployers}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Admins</h2>
                <p className="text-3xl font-bold mt-2">{stats.totalAdmins}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Total Jobs</h2>
                <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Active Jobs</h2>
                <p className="text-3xl font-bold mt-2">{stats.activeJobs}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-gray-600">Applications</h2>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalApplications}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/admin/users"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md"
              >
                <h2 className="text-xl font-bold mb-2">Manage Users</h2>
                <p className="text-gray-600">
                  View, activate, deactivate, or delete users.
                </p>
              </Link>

              <Link
                href="/admin/jobs"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md"
              >
                <h2 className="text-xl font-bold mb-2">Manage Jobs</h2>
                <p className="text-gray-600">
                  View and remove invalid job posts.
                </p>
              </Link>

              <Link
                href="/admin/applications"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md"
              >
                <h2 className="text-xl font-bold mb-2">
                  Manage Applications
                </h2>
                <p className="text-gray-600">
                  View all job applications in the system.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}