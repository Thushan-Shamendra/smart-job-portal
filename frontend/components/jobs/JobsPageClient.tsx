"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import JobFilters, { type JobFiltersValue } from "@/components/jobs/JobFilters";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest } from "@/lib/api";
import type { Job, JobsResponse } from "@/lib/types";

const getFiltersFromParams = (params: URLSearchParams): JobFiltersValue => ({
  search: params.get("search") || "",
  location: params.get("location") || "",
  category: params.get("category") || "",
  jobType: params.get("jobType") || "",
});

export default function JobsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<JobFiltersValue>(() =>
    getFiltersFromParams(new URLSearchParams(searchParams.toString()))
  );

  const searchParamString = searchParams.toString();

  useEffect(() => {
    Promise.resolve().then(() => {
      setFilters(getFiltersFromParams(new URLSearchParams(searchParamString)));
    });
  }, [searchParamString]);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const query = searchParamString ? `/jobs?${searchParamString}` : "/jobs";
        const [filteredJobs, availableJobs] = await Promise.all([
          apiRequest<JobsResponse>(query),
          apiRequest<JobsResponse>("/jobs"),
        ]);

        setJobs(filteredJobs.jobs);
        setAllJobs(availableJobs.jobs);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load jobs right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, [searchParamString]);

  const categories = useMemo(
    () => [...new Set(allJobs.map((job) => job.category))].sort(),
    [allJobs]
  );

  const updateUrl = (nextFilters: JobFiltersValue) => {
    const params = new URLSearchParams();

    if (nextFilters.search.trim()) {
      params.set("search", nextFilters.search.trim());
    }

    if (nextFilters.location.trim()) {
      params.set("location", nextFilters.location.trim());
    }

    if (nextFilters.category) {
      params.set("category", nextFilters.category);
    }

    if (nextFilters.jobType) {
      params.set("jobType", nextFilters.jobType);
    }

    router.push(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Browse Jobs"
        title="Find roles that match your skills and location"
        description="Search by keyword, location, category, and job type to narrow in on the opportunities that fit you best."
        actions={
          user ? (
            <Link
              href={user.role === "jobseeker" ? "/recommended-jobs" : "/dashboard"}
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              {user.role === "jobseeker"
                ? "View Recommendations"
                : "Go to Dashboard"}
            </Link>
          ) : (
            <Link
              href="/register"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Create an Account
            </Link>
          )
        }
      />

      <div className="mt-8">
        <JobFilters
          value={filters}
          categories={categories}
          onChange={setFilters}
          onSubmit={() => updateUrl(filters)}
          onClear={() => {
            const cleared = {
              search: "",
              location: "",
              category: "",
              jobType: "",
            };
            setFilters(cleared);
            updateUrl(cleared);
          }}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {loading ? "Loading roles..." : `${jobs.length} jobs found`}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Explore active openings across multiple categories and work styles.
          </p>
        </div>

        {(filters.search || filters.location || filters.category || filters.jobType) && (
          <Button
            variant="ghost"
            onClick={() => {
              const cleared = {
                search: "",
                location: "",
                category: "",
                jobType: "",
              };
              setFilters(cleared);
              updateUrl(cleared);
            }}
          >
            Clear active filters
          </Button>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
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
              <Button onClick={() => router.refresh()} variant="outline">
                Try again
              </Button>
            }
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs match these filters"
            description="Try broadening the keyword, switching the location, or clearing the category and job type filters."
            action={
              <Button
                onClick={() => {
                  const cleared = {
                    search: "",
                    location: "",
                    category: "",
                    jobType: "",
                  };
                  setFilters(cleared);
                  updateUrl(cleared);
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} userRole={user?.role} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
