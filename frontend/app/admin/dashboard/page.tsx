"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { AdminStatsResponse } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["admin"],
  });

  const [stats, setStats] = useState<AdminStatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<AdminStatsResponse>("/admin/dashboard", {
          token,
        });
        setStats(data.stats || null);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [router, sessionLoading, token, user]);

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 grid-auto-fit">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-36 w-full rounded-[28px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="System overview and moderation tools"
        description="Monitor platform activity, review account health, and move quickly into user, job, or application management."
        actions={
          <>
            <Link
              href="/admin/users"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Manage Users
            </Link>
            <Link
              href="/admin/jobs"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Review Jobs
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} />
        </div>
      ) : null}

      {stats ? (
        <>
          <div className="mt-8 grid-auto-fit">
            <StatCard label="Total users" value={stats.totalUsers} />
            <StatCard label="Jobseekers" value={stats.totalJobSeekers} />
            <StatCard label="Employers" value={stats.totalEmployers} />
            <StatCard label="Admins" value={stats.totalAdmins} />
            <StatCard label="Total jobs" value={stats.totalJobs} />
            <StatCard label="Active jobs" value={stats.activeJobs} />
            <StatCard
              label="Applications"
              value={stats.totalApplications}
              caption="Total submissions received across the platform."
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link
              href="/admin/users"
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                User management
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Search by name, filter by role, activate or deactivate accounts,
                and delete users when necessary.
              </p>
            </Link>

            <Link
              href="/admin/jobs"
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Job moderation
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review all listings, inspect employer details, and remove roles
                that should no longer be visible.
              </p>
            </Link>

            <Link
              href="/admin/applications"
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Application oversight
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Inspect platform-wide submissions, extracted skills, and secure
                CV downloads through admin access.
              </p>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
