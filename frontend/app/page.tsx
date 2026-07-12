"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import JobCard from "@/components/jobs/JobCard";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest } from "@/lib/api";
import { getDashboardRoute } from "@/lib/auth";
import type { Job, JobsResponse } from "@/lib/types";

const howItWorks = [
  {
    title: "Create your account",
    description:
      "Choose your role, sign in securely, and start using JobPilot in minutes.",
  },
  {
    title: "Build your profile",
    description:
      "Add your skills, experience, and professional links so better opportunities are easier to discover.",
  },
  {
    title: "Apply or hire faster",
    description:
      "Submit applications with CV analysis, or manage listings and applicants from one place.",
  },
];

const benefits = [
  {
    title: "For jobseekers",
    description:
      "Discover matching roles, upload your CV, track application progress, and surface your strongest skills.",
    image: "/images/candidate.png",
    href: "/recommended-jobs",
    action: "Explore Recommendations",
  },
  {
    title: "For employers",
    description:
      "Publish opportunities, review candidate skills, and download CVs securely with role-based access.",
    image: "/images/employer.png",
    href: "/employer/add-job",
    action: "Post a Job",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { loading: sessionLoading, user } = useAppSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await apiRequest<JobsResponse>("/jobs");
        setJobs(data.jobs);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load latest jobs right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadHomeData();
  }, []);

  const latestJobs = useMemo(() => jobs.slice(0, 3), [jobs]);

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();

    jobs.forEach((job) => {
      const current = counts.get(job.category) || 0;
      counts.set(job.category, current + 1);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));
  }, [jobs]);

  const dashboardRoute = getDashboardRoute(user?.role);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("search", keyword.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    router.push(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  };

  return (
    <div className="overflow-hidden">
      <section className="page-shell pt-10">
        <div className="hero-gradient relative overflow-hidden rounded-[36px] border border-white/70 px-6 py-12 shadow-[0_35px_80px_rgba(37,99,235,0.12)] md:px-10 md:py-16 lg:px-14">
          <div className="absolute inset-y-0 right-0 hidden w-[34%] xl:w-[38%] lg:block">
            <Image
              src="/images/hero-job.png"
              alt="JobPilot hero"
              fill
              priority
              className="object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl animate-fade-in-up lg:max-w-[58%] xl:max-w-[54%]">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-lg">
                <Image
                  src="/images/jobpilot-logo-full.png"
                  alt="JobPilot logo"
                  width={112}
                  height={112}
                  priority
                  className="h-16 w-16 object-contain md:h-20 md:w-20"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                  JobPilot
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Smart job discovery for candidates, employers, and admins
                </p>
              </div>
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Find better opportunities and move your job search forward with confidence.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Explore new roles, upload your CV, uncover key skills
              automatically, and manage every stage of the application journey
              in one place.
            </p>

            <form
              onSubmit={handleSearch}
              className="section-surface mt-8 grid max-w-4xl gap-4 rounded-[30px] p-4 md:grid-cols-[1.2fr_0.95fr_auto] xl:max-w-3xl"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Job title or keyword
                </span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Frontend developer, product manager, React"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Location
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Colombo, remote, hybrid"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-col justify-end gap-3">
                <Button type="submit" size="lg" fullWidth>
                  Search Jobs
                </Button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "text-white hover:text-white visited:text-white",
                })}
                style={{ color: "#ffffff" }}
              >
                Browse Jobs
              </Link>
              <Link
                href={sessionLoading ? "/jobs" : user ? dashboardRoute : "/register"}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                {sessionLoading ? "Explore Platform" : user ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
              Latest Jobs
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Fresh opportunities to explore
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Discover recently posted roles across different industries and
              working styles.
            </p>
          </div>

          <Link
            href="/jobs"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            View all jobs
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <LoadingSkeleton className="h-14 w-14 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <LoadingSkeleton className="h-5 w-2/3" />
                    <LoadingSkeleton className="h-4 w-1/2" />
                    <LoadingSkeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <LoadingSkeleton className="h-4 w-full" />
                  <LoadingSkeleton className="h-4 w-full" />
                  <LoadingSkeleton className="h-4 w-full" />
                  <LoadingSkeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            message={error}
            action={
              <Link
                href="/jobs"
                className={buttonStyles({ variant: "outline", size: "md" })}
              >
                Browse all jobs
              </Link>
            }
          />
        ) : latestJobs.length === 0 ? (
          <EmptyState
            title="No active jobs yet"
            description="Once employers publish roles, the latest opportunities will appear here automatically."
            action={
              <Link
                href="/jobs"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Go to jobs
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {latestJobs.map((job) => (
              <JobCard key={job._id} job={job} userRole={user?.role} />
            ))}
          </div>
        )}
      </section>

      <section className="page-shell pt-0">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                Categories
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Explore the roles people are hiring for right now
              </h2>
            </div>
          </div>

          {topCategories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topCategories.map((item) => (
                <Link
                  key={item.category}
                  href={`/jobs?category=${encodeURIComponent(item.category)}`}
                  className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                        {item.category}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.count} active role{item.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      Explore
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Categories will appear here"
              description="As active jobs are added, JobPilot groups them into browsable categories automatically."
            />
          )}
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {howItWorks.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-semibold text-blue-700">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_60px_rgba(15,23,42,0.2)]"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-blue-950/80" />
              <div className="relative z-10 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  {item.title}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  {item.title === "For jobseekers"
                    ? "Turn your CV into a stronger application story."
                    : "Run a cleaner hiring workflow with better visibility."}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-200">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className={buttonStyles({
                    variant: "primary",
                    size: "md",
                    className: "mt-6",
                  })}
                >
                  {item.action}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
