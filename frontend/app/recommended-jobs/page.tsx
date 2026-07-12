"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatCard from "@/components/ui/StatCard";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { RecommendedJob, RecommendedJobsResponse } from "@/lib/types";

export default function RecommendedJobsPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["jobseeker"],
  });

  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadRecommendations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<RecommendedJobsResponse>(
          "/jobs/recommended",
          { token }
        );
        setRecommendedJobs(data.recommendedJobs);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load recommended jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadRecommendations();
  }, [router, sessionLoading, token, user]);

  const highestMatch = recommendedJobs[0]?.matchPercentage || 0;

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 grid-auto-fit">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-36 w-full rounded-[28px]" />
          ))}
        </div>
        <div className="mt-8 space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-80 w-full rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Recommended Jobs"
        title="Skill-based matches from your saved profile"
        description="See opportunities ranked by how closely they align with the skills and experience on your profile."
        actions={
          <>
            <Link
              href="/my-profile"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Update Profile
            </Link>
            <Link
              href="/jobs"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Browse All Jobs
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mt-8">
          <ErrorState
            message={error}
            action={
              <Link
                href="/my-profile"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Review My Profile
              </Link>
            }
          />
        </div>
      ) : null}

      {!error && (
        <>
          <div className="mt-8 grid-auto-fit">
            <StatCard
              label="Recommended roles"
              value={recommendedJobs.length}
              caption="Active jobs that share at least one profile skill."
            />
            <StatCard
              label="Best match"
              value={`${highestMatch}%`}
              caption="Your strongest match right now."
            />
            <StatCard
              label="Ready to apply"
              value={recommendedJobs.filter((item) => item.matchPercentage >= 50).length}
              caption="Matches at 50% or above."
            />
          </div>

          <div className="mt-8 space-y-6">
            {recommendedJobs.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                description="Add more skills to your profile and JobPilot will start surfacing stronger matches."
                action={
                  <Link
                    href="/my-profile"
                    className={buttonStyles({ variant: "primary", size: "md" })}
                  >
                    Improve My Profile
                  </Link>
                }
              />
            ) : (
              recommendedJobs.map((item) => (
                <div
                  key={item.job._id}
                  className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {item.job.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.job.company} - {item.job.location}
                      </p>
                    </div>

                    <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                      {item.matchPercentage}% Match
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <JobCard
                      job={item.job}
                      userRole={user?.role}
                      className="p-5 shadow-none"
                    />

                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">
                        Matched skills
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.matchedSkills.length > 0 ? (
                          item.matchedSkills.map((skill) => (
                            <SkillBadge
                              key={`${item.job._id}-${skill}`}
                              label={skill}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">
                            No direct skill matches were returned.
                          </p>
                        )}
                      </div>

                      <h3 className="mt-6 text-lg font-semibold text-slate-950">
                        Required skills
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.job.skills && item.job.skills.length > 0 ? (
                          item.job.skills.map((skill) => (
                            <SkillBadge
                              key={`${item.job._id}-required-${skill}`}
                              label={skill}
                              muted={!item.matchedSkills.includes(skill)}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">
                            No skills were listed for this role.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
