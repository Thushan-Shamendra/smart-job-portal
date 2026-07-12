"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Button, { buttonStyles } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import InputField from "@/components/ui/InputField";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SkillBadge from "@/components/ui/SkillBadge";
import StatCard from "@/components/ui/StatCard";
import TextareaField from "@/components/ui/TextareaField";
import { clearStoredAuth } from "@/lib/auth";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import { downloadProfileCV } from "@/lib/downloadProfileCV";
import type {
  Education,
  Experience,
  ProfileCVAnalysisResponse,
  ProfileResponse,
} from "@/lib/types";
import { getProfileCompletion, toSkillList } from "@/lib/utils";

const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024;

const allowedCVTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type ProfileFormData = {
  headline: string;
  bio: string;
  location: string;
  skills: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  educationSchool: string;
  educationDegree: string;
  educationField: string;
  educationFrom: string;
  educationTo: string;
  experienceCompany: string;
  experiencePosition: string;
  experienceFrom: string;
  experienceTo: string;
  experienceDescription: string;
};

const emptyFormState: ProfileFormData = {
  headline: "",
  bio: "",
  location: "",
  skills: "",
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  educationSchool: "",
  educationDegree: "",
  educationField: "",
  educationFrom: "",
  educationTo: "",
  experienceCompany: "",
  experiencePosition: "",
  experienceFrom: "",
  experienceTo: "",
  experienceDescription: "",
};

export default function MyProfilePage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["jobseeker"],
  });

  const [formData, setFormData] = useState<ProfileFormData>(emptyFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [currentCVName, setCurrentCVName] = useState("");
  const [downloadingCV, setDownloadingCV] = useState(false);
  const [analyzingCV, setAnalyzingCV] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<ProfileResponse>("/profile/me", { token });

        if (!data.profile) {
          setFormData(emptyFormState);
          setCurrentCVName("");
          return;
        }

        const profile = data.profile;

        setFormData({
          headline: profile.headline || "",
          bio: profile.bio || "",
          location: profile.location || "",
          skills: profile.skills?.join(", ") || "",
          portfolioUrl: profile.portfolioUrl || "",
          githubUrl: profile.githubUrl || "",
          linkedinUrl: profile.linkedinUrl || "",
          educationSchool: profile.education?.[0]?.school || "",
          educationDegree: profile.education?.[0]?.degree || "",
          educationField: profile.education?.[0]?.fieldOfStudy || "",
          educationFrom: profile.education?.[0]?.from || "",
          educationTo: profile.education?.[0]?.to || "",
          experienceCompany: profile.experience?.[0]?.company || "",
          experiencePosition: profile.experience?.[0]?.position || "",
          experienceFrom: profile.experience?.[0]?.from || "",
          experienceTo: profile.experience?.[0]?.to || "",
          experienceDescription: profile.experience?.[0]?.description || "",
        });
        setCurrentCVName(profile.cv?.originalName || "");
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        if (
          loadError instanceof Error &&
          loadError.message.toLowerCase().includes("profile not found")
        ) {
          setFormData(emptyFormState);
          setCurrentCVName("");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router, sessionLoading, token, user]);

  const profileCompletion = useMemo(
    () =>
      getProfileCompletion([
        formData.headline,
        formData.bio,
        formData.location,
        formData.skills,
        currentCVName || selectedFilename,
        formData.portfolioUrl,
        formData.githubUrl,
        formData.linkedinUrl,
      ]),
    [currentCVName, formData, selectedFilename]
  );

  const currentSkills = useMemo(() => toSkillList(formData.skills), [formData.skills]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCVChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setError("");
    setMessage("");
    setAnalysisMessage("");

    if (!file) {
      setSelectedCV(null);
      setSelectedFilename("");
      return;
    }

    if (!allowedCVTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX CV file.");
      e.target.value = "";
      setSelectedCV(null);
      setSelectedFilename("");
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setError("CV file size must be 2 MB or less.");
      e.target.value = "";
      setSelectedCV(null);
      setSelectedFilename("");
      return;
    }

    setSelectedCV(file);
    setSelectedFilename(file.name);

    if (!token) {
      return;
    }

    setAnalyzingCV(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const data = await apiRequest<ProfileCVAnalysisResponse>(
        "/profile/analyze-cv",
        {
          method: "POST",
          token,
          body: formData,
        }
      );

      const extractedSkills = data.extractedSkills || [];

      if (extractedSkills.length > 0) {
        setFormData((current) => {
          const mergedSkills = [
            ...new Set([
              ...toSkillList(current.skills),
              ...extractedSkills.map((skill) => skill.trim()).filter(Boolean),
            ]),
          ];

          return {
            ...current,
            skills: mergedSkills.join(", "),
          };
        });

        setAnalysisMessage(
          "Skills were added from your CV. You can edit them before saving your profile."
        );
      } else {
        setAnalysisMessage(
          "Your CV was uploaded, but no skills were detected to add automatically."
        );
      }
    } catch (analysisError) {
      if (isUnauthorizedError(analysisError)) {
        router.push("/login");
        return;
      }

      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to analyze your CV."
      );
    } finally {
      setAnalyzingCV(false);
    }
  };

  const handleDownloadProfileCV = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setDownloadingCV(true);

    try {
      await downloadProfileCV("/profile/me/cv", token, currentCVName || "my-cv");
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download your CV."
      );
    } finally {
      setDownloadingCV(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/login");
  };

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const education: Education[] =
      formData.educationSchool && formData.educationDegree
        ? [
            {
              school: formData.educationSchool,
              degree: formData.educationDegree,
              fieldOfStudy: formData.educationField,
              from: formData.educationFrom,
              to: formData.educationTo,
            },
          ]
        : [];

    const experience: Experience[] =
      formData.experienceCompany && formData.experiencePosition
        ? [
            {
              company: formData.experienceCompany,
              position: formData.experiencePosition,
              from: formData.experienceFrom,
              to: formData.experienceTo,
              description: formData.experienceDescription,
            },
          ]
        : [];

    try {
      const payload = new FormData();
      payload.append("headline", formData.headline);
      payload.append("bio", formData.bio);
      payload.append("location", formData.location);
      payload.append("skills", JSON.stringify(toSkillList(formData.skills)));
      payload.append("education", JSON.stringify(education));
      payload.append("experience", JSON.stringify(experience));
      payload.append("portfolioUrl", formData.portfolioUrl);
      payload.append("githubUrl", formData.githubUrl);
      payload.append("linkedinUrl", formData.linkedinUrl);

      if (selectedCV) {
        payload.append("cv", selectedCV);
      }

      const data = await apiRequest<ProfileResponse>("/profile/me", {
        method: "PUT",
        token,
        body: payload,
      });

      setCurrentCVName(data.profile?.cv?.originalName || currentCVName);
      setFormData((current) => ({
        ...current,
        skills: data.profile?.skills?.join(", ") || current.skills,
      }));
      setSelectedCV(null);
      setSelectedFilename("");
      setMessage(data.message || "Profile saved successfully.");
    } catch (saveError) {
      if (isUnauthorizedError(saveError)) {
        router.push("/login");
        return;
      }

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <div className="mt-8 grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
          <LoadingSkeleton className="h-96 w-full rounded-[32px]" />
          <LoadingSkeleton className="h-[52rem] w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="My Profile"
        title="Shape the profile that powers your recommendations"
        description="Your saved profile helps employers understand your background and keeps your job matches aligned with your skills."
        actions={
          <>
            <Link
              href="/my-applications"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              My Applications
            </Link>
            <Button variant="primary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        }
      />

      <div className="mt-8 space-y-4">
        {message ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {analysisMessage ? (
          <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            {analysisMessage}
          </div>
        ) : null}

        {error ? <ErrorState message={error} /> : null}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-6">
          <StatCard
            label="Profile completion"
            value={`${profileCompletion}%`}
            caption="Calculated from your currently filled profile sections."
          />

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Current skill snapshot
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep this list current so matching opportunities stay relevant.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {currentSkills.length > 0 ? (
                currentSkills.map((skill) => (
                  <SkillBadge key={skill} label={skill} />
                ))
              ) : (
                <p className="text-sm text-slate-600">
                  Add your first skills to improve role matching.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Saved CV</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload a PDF or DOCX version of your CV so it is ready when you need it.
            </p>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Current file</p>
              <p className="mt-2 text-sm text-slate-800">
                {currentCVName || "No CV uploaded yet"}
              </p>

              {currentCVName ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleDownloadProfileCV}
                  disabled={downloadingCV}
                >
                  {downloadingCV ? "Downloading CV..." : "Download Current CV"}
                </Button>
              ) : null}
            </div>

            {selectedFilename ? (
              <div className="mt-4 rounded-[24px] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                Selected file: {selectedFilename}
              </div>
            ) : null}

            {analyzingCV ? (
              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Analyzing your CV and detecting skills...
              </div>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Profile guidance
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Use a strong professional headline so employers understand your focus quickly.</li>
              <li>Keep your skills current to improve recommendation quality.</li>
              <li>Add your website, GitHub, and LinkedIn links when they strengthen your application story.</li>
            </ul>
          </div>
        </aside>

        <form
          onSubmit={handleSaveProfile}
          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Basic details
              </h2>
              <div className="mt-5 grid gap-4">
                <InputField
                  label="Professional headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="Full Stack Developer focused on React and Node.js"
                />
                <TextareaField
                  label="Short bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Summarize your background, strengths, and the kind of roles you are targeting."
                  rows={5}
                />
                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Colombo, Sri Lanka"
                />
                <InputField
                  label="Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Next.js, TypeScript, Node.js"
                  hint="Separate skills with commas. CV analysis can fill this for you, and you can still edit it."
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Upload CV
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCVChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <span className="mt-2 block text-sm text-slate-500">
                    Upload one PDF or DOCX file, up to 2 MB.
                  </span>
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Education
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InputField
                  label="School or university"
                  name="educationSchool"
                  value={formData.educationSchool}
                  onChange={handleChange}
                  placeholder="University of ..."
                />
                <InputField
                  label="Degree"
                  name="educationDegree"
                  value={formData.educationDegree}
                  onChange={handleChange}
                  placeholder="BSc in Computer Science"
                />
                <InputField
                  label="Field of study"
                  name="educationField"
                  value={formData.educationField}
                  onChange={handleChange}
                  placeholder="Software Engineering"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="From"
                    name="educationFrom"
                    value={formData.educationFrom}
                    onChange={handleChange}
                    placeholder="2022"
                  />
                  <InputField
                    label="To"
                    name="educationTo"
                    value={formData.educationTo}
                    onChange={handleChange}
                    placeholder="2026"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Experience
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InputField
                  label="Company or project"
                  name="experienceCompany"
                  value={formData.experienceCompany}
                  onChange={handleChange}
                  placeholder="Startup, freelance client, or university project"
                />
                <InputField
                  label="Position"
                  name="experiencePosition"
                  value={formData.experiencePosition}
                  onChange={handleChange}
                  placeholder="Frontend Developer Intern"
                />
                <InputField
                  label="From"
                  name="experienceFrom"
                  value={formData.experienceFrom}
                  onChange={handleChange}
                  placeholder="Jan 2025"
                />
                <InputField
                  label="To"
                  name="experienceTo"
                  value={formData.experienceTo}
                  onChange={handleChange}
                  placeholder="Present"
                />
                <div className="md:col-span-2">
                  <TextareaField
                    label="Experience description"
                    name="experienceDescription"
                    value={formData.experienceDescription}
                    onChange={handleChange}
                    placeholder="Describe the work, impact, tools, and technologies used."
                    rows={5}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Links
              </h2>
              <div className="mt-5 grid gap-4">
                <InputField
                  label="GitHub URL"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/your-handle"
                />
                <InputField
                  label="LinkedIn URL"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                />
                <InputField
                  label="Portfolio URL"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://your-site.com"
                />
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving Profile..." : "Save Profile"}
            </Button>
            <Link
              href="/recommended-jobs"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              View Recommendations
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
