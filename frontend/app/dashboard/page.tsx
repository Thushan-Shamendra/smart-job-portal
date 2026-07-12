"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatCard from "@/components/ui/StatCard";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import { getProfileCompletion } from "@/lib/utils";
import type {
  ApplicationsResponse,
  Job,
  JobsResponse,
  Profile,
  ProfileResponse,
  RecommendedJobsResponse,
} from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["jobseeker", "employer", "admin"],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [referenceTime] = useState(() => Date.now());

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    if (user.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        if (user.role === "jobseeker") {
          const [profileResult, applicationsResult, recommendedResult] =
            await Promise.all([
              apiRequest<ProfileResponse>("/profile/me", { token }).catch(
                () => ({ success: false } as ProfileResponse)
              ),
              apiRequest<ApplicationsResponse>("/applications/my-applications", {
                token,
              }),
              apiRequest<RecommendedJobsResponse>("/jobs/recommended", {
                token,
              }).catch(() => ({
                success: false,
                recommendedJobs: [],
              })),
            ]);

          setProfile(profileResult.profile || null);
          setApplicationsCount(applicationsResult.applications.length);
          setShortlistedCount(
            applicationsResult.applications.filter(
              (application) => application.status === "Shortlisted"
            ).length
          );
          setRecommendedJobs(
            recommendedResult.recommendedJobs?.map((item) => item.job).slice(0, 3) ||
              []
          );
        }

        if (user.role === "employer") {
          const jobsResult = await apiRequest<JobsResponse>("/jobs/my-jobs", {
            token,
          });

          setEmployerJobs(jobsResult.jobs);
        }
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [router, sessionLoading, token, user]);

  const profileCompletion = useMemo(
    () =>
      getProfileCompletion([
        profile?.headline,
        profile?.bio,
        profile?.location,
        profile?.skills?.join(", "),
        profile?.cv?.originalName,
        profile?.portfolioUrl,
        profile?.githubUrl,
        profile?.linkedinUrl,
      ]),
    [profile]
  );

  const activeEmployerJobs = employerJobs.filter((job) => job.isActive);
  const closingSoonJobs = employerJobs.filter((job) => {
    const deadline = new Date(job.deadline).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return deadline > referenceTime && deadline - referenceTime <= sevenDays;
  });

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <div className="space-y-6">
          <LoadingSkeleton className="h-10 w-64" />
          <div className="grid-auto-fit">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-36 w-full rounded-[28px]" />
            ))}
          </div>
          <LoadingSkeleton className="h-80 w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="page-shell">
        <ErrorState
          message={error}
          action={
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  if (user.role === "jobseeker") {
    return (
      <div className="page-shell">
        <PageHeader
          eyebrow="Jobseeker Dashboard"
          title={`Welcome back, ${user.name}`}
          description="Track applications, review skill-based matches, and keep your profile strong so JobPilot can surface better opportunities."
          actions={
            <>
              <Link
                href="/my-profile"
                className={buttonStyles({ variant: "outline", size: "md" })}
              >
                Edit Profile
              </Link>
              <Link
                href="/jobs"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Browse Jobs
              </Link>
            </>
          }
        />

        <div className="mt-8 grid-auto-fit">
          <StatCard
            label="Profile completion"
            value={`${profileCompletion}%`}
            caption="Derived from your saved profile details."
          />
          <StatCard
            label="Applications"
            value={applicationsCount}
            caption="Applications you have submitted so far."
          />
          <StatCard
            label="Shortlisted"
            value={shortlistedCount}
            caption="Applications currently marked as shortlisted."
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Recommended roles
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Discover roles that align with the skills listed on your
                  profile.
                </p>
              </div>

              <Link
                href="/recommended-jobs"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-5">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    userRole={user.role}
                    className="p-5"
                  />
                ))
              ) : (
                <EmptyState
                  title="No recommendations yet"
                  description="Add more skills to your profile to unlock stronger role matches."
                  action={
                    <Link
                      href="/my-profile"
                      className={buttonStyles({
                        variant: "primary",
                        size: "md",
                      })}
                    >
                      Update Profile
                    </Link>
                  }
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Profile highlights
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep your details current so recruiters can understand your
                strengths quickly.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Headline</p>
                  <p className="mt-2 text-sm text-slate-900">
                    {profile?.headline || "Add a professional headline to improve your profile."}
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="mt-2 text-sm text-slate-900">
                    {profile?.location || "Not added yet"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <SkillBadge key={skill} label={skill} />
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">
                        No skills added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Quick actions
              </h2>
            <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/my-applications"
                  className={buttonStyles({
                    variant: "outline",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  View My Applications
                </Link>
                <Link
                  href="/recommended-jobs"
                  className={buttonStyles({
                    variant: "primary",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  Explore Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Employer Dashboard"
        title={`Welcome back, ${user.name}`}
        description="Manage your active postings, keep an eye on closing deadlines, and move quickly from listing creation to applicant review."
        actions={
          <>
            <Link
              href="/employer/my-jobs"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Manage Jobs
            </Link>
            <Link
              href="/employer/add-job"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Post a Job
            </Link>
          </>
        }
      />

      <div className="mt-8 grid-auto-fit">
        <StatCard
          label="Posted jobs"
          value={employerJobs.length}
          caption="Roles created under your employer account."
        />
        <StatCard
          label="Active jobs"
          value={activeEmployerJobs.length}
          caption="Currently visible and accepting applications."
        />
        <StatCard
          label="Closing soon"
          value={closingSoonJobs.length}
          caption="Jobs with deadlines within the next seven days."
        />
      </div>

      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Recent postings
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review your current roles and jump directly into applicants or
              edits.
            </p>
          </div>

          <Link
            href="/employer/my-jobs"
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            View all
          </Link>
        </div>

        <div className="mt-6 space-y-5">
          {employerJobs.length > 0 ? (
            employerJobs.slice(0, 4).map((job) => (
              <JobCard
                key={job._id}
                job={job}
                userRole={user.role}
                showApplyAction={false}
                footer={
                  <>
                    <Link
                      href={`/employer/jobs/${job._id}/edit`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Edit Job
                    </Link>
                    <Link
                      href={`/employer/jobs/${job._id}/applicants`}
                      className={buttonStyles({
                        variant: "secondary",
                        size: "sm",
                        className: "text-white hover:text-white visited:text-white",
                      })}
                      style={{ color: "#ffffff" }}
                    >
                      View Applicants
                    </Link>
                  </>
                }
              />
            ))
          ) : (
            <EmptyState
              title="No jobs posted yet"
              description="Create your first job post to start receiving applications through JobPilot."
              action={
                <Link
                  href="/employer/add-job"
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  Post a Job
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
