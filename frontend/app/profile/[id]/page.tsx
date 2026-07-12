"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import { downloadProfileCV } from "@/lib/downloadProfileCV";
import type { Profile, ProfileResponse } from "@/lib/types";

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["employer", "admin"],
  });

  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingCV, setDownloadingCV] = useState(false);

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<ProfileResponse>(`/profile/user/${id}`, {
          token,
        });

        if (!data.profile) {
          setError("Profile not found.");
          return;
        }

        setProfile(data.profile);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this applicant profile."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [id, router, sessionLoading, token, user]);

  const handleDownloadCV = async () => {
    if (!token || !profile?.cv?.originalName) {
      return;
    }

    setError("");
    setDownloadingCV(true);

    try {
      await downloadProfileCV(
        `/profile/user/${id}/cv`,
        token,
        profile.cv.originalName
      );
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download this CV."
      );
    } finally {
      setDownloadingCV(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <LoadingSkeleton className="mt-8 h-[56rem] w-full rounded-[32px]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-shell">
        <ErrorState
          message={error || "This applicant profile is unavailable."}
          action={
            <Link
              href="/employer/my-jobs"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Back to My Jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Applicant Profile"
        title={profile.user?.name || "Candidate"}
        description={profile.headline || "No professional headline added yet."}
        actions={
          <Link
            href="/employer/my-jobs"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to My Jobs
          </Link>
        }
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Email:</span>{" "}
                {profile.user?.email || "Not provided"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Phone:</span>{" "}
                {profile.user?.phone || "Not provided"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Location:</span>{" "}
                {profile.location || "Not provided"}
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Links</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.cv?.originalName ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleDownloadCV}
                  disabled={downloadingCV}
                >
                  {downloadingCV ? "Downloading CV..." : "Download CV"}
                </Button>
              ) : null}
              {profile.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  GitHub
                </a>
              ) : null}
              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  LinkedIn
                </a>
              ) : null}
              {profile.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Portfolio
                </a>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              About
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Skills
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <SkillBadge key={skill} label={skill} />
                ))
              ) : (
                <p className="text-sm text-slate-600">No skills added yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Education
            </h2>
            <div className="mt-5 space-y-4">
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((education, index) => (
                  <div key={index} className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-lg font-semibold text-slate-950">
                      {education.degree}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {education.school}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {education.fieldOfStudy || "Field of study not specified"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {education.from || "N/A"} - {education.to || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No education added"
                  description="This applicant has not added education details yet."
                />
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Experience
            </h2>
            <div className="mt-5 space-y-4">
              {profile.experience && profile.experience.length > 0 ? (
                profile.experience.map((experience, index) => (
                  <div key={index} className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-lg font-semibold text-slate-950">
                      {experience.position}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {experience.company}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {experience.from || "N/A"} - {experience.to || "N/A"}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {experience.description || "No description provided."}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No experience added"
                  description="This applicant has not added experience details yet."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
