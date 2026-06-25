"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    headline: "",
    bio: "",
    location: "",
    skills: "",
    cvUrl: "",
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
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "jobseeker") {
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 404) {
        return;
      }

      if (!res.ok) {
        setError(data.message || "Failed to fetch profile");
        return;
      }

      const profile = data.profile;

      setFormData({
        headline: profile.headline || "",
        bio: profile.bio || "",
        location: profile.location || "",
        skills: profile.skills?.join(", ") || "",
        cvUrl: profile.cvUrl || "",
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
    } catch (error) {
      setError("Something went wrong");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    const profileData = {
      headline: formData.headline,
      bio: formData.bio,
      location: formData.location,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== ""),

      cvUrl: formData.cvUrl,
      portfolioUrl: formData.portfolioUrl,
      githubUrl: formData.githubUrl,
      linkedinUrl: formData.linkedinUrl,

      education: [
        {
          school: formData.educationSchool,
          degree: formData.educationDegree,
          fieldOfStudy: formData.educationField,
          from: formData.educationFrom,
          to: formData.educationTo,
        },
      ],

      experience: [
        {
          company: formData.experienceCompany,
          position: formData.experiencePosition,
          from: formData.experienceFrom,
          to: formData.experienceTo,
          description: formData.experienceDescription,
        },
      ],
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save profile");
        return;
      }

      setMessage("Profile saved successfully");
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>

          <Link href="/dashboard" className="text-blue-600">
            Dashboard
          </Link>
        </div>

        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-3">Basic Details</h2>

            <input
              type="text"
              name="headline"
              placeholder="Headline, example: Full Stack Developer"
              value={formData.headline}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <textarea
              name="bio"
              placeholder="Short bio about yourself"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3 h-28"
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="skills"
              placeholder="Skills, example: React, Next.js, Node.js, MongoDB"
              value={formData.skills}
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Education</h2>

            <input
              type="text"
              name="educationSchool"
              placeholder="School / University"
              value={formData.educationSchool}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="educationDegree"
              placeholder="Degree"
              value={formData.educationDegree}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="educationField"
              placeholder="Field of Study"
              value={formData.educationField}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                name="educationFrom"
                placeholder="From, example: 2023"
                value={formData.educationFrom}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="educationTo"
                placeholder="To, example: 2027"
                value={formData.educationTo}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Experience</h2>

            <input
              type="text"
              name="experienceCompany"
              placeholder="Company / Project"
              value={formData.experienceCompany}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="experiencePosition"
              placeholder="Position, example: Full Stack Developer"
              value={formData.experiencePosition}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                name="experienceFrom"
                placeholder="From"
                value={formData.experienceFrom}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="experienceTo"
                placeholder="To"
                value={formData.experienceTo}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />
            </div>

            <textarea
              name="experienceDescription"
              placeholder="Experience description"
              value={formData.experienceDescription}
              onChange={handleChange}
              className="w-full border p-3 rounded h-28"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Links</h2>

            <input
              type="text"
              name="cvUrl"
              placeholder="CV URL"
              value={formData.cvUrl}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="githubUrl"
              placeholder="GitHub URL"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="linkedinUrl"
              placeholder="LinkedIn URL"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="text"
              name="portfolioUrl"
              placeholder="Portfolio URL"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            {loading ? "Saving Profile..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}