"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = "jobseeker" | "employer" | "admin";

type LoggedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<LoggedUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const hideNavbarRoutes = ["/login", "/register"];

  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Smart Job Portal
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
            Jobs
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          )}

          {user?.role === "jobseeker" && (
            <>
              <Link
                href="/recommended-jobs"
                className="text-gray-700 hover:text-blue-600"
              >
                Recommended
              </Link>

              <Link
                href="/my-applications"
                className="text-gray-700 hover:text-blue-600"
              >
                Applications
              </Link>
            </>
          )}

          {user?.role === "employer" && (
            <>
              <Link
                href="/employer/add-job"
                className="text-gray-700 hover:text-blue-600"
              >
                Post Job
              </Link>

              <Link
                href="/employer/my-jobs"
                className="text-gray-700 hover:text-blue-600"
              >
                My Jobs
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Admin
            </Link>
          )}

          {!user ? (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}