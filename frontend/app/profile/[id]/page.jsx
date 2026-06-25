"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "employer" && user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch profile");
        return;
      }

      setProfile(data.profile);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Applicant Profile</h1>

          <Link href="/employer/my-jobs" className="text-blue-600">
            Back to My Jobs
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            <p>{error}</p>
            <p className="mt-2">
              This applicant may not have created a profile yet.
            </p>
          </div>
        )}

        {profile && (
          <div>
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold">
                {profile.user?.name}
              </h2>

              <p className="text-gray-700 mt-1">
                {profile.headline || "No headline added"}
              </p>

              <p className="text-gray-700 mt-2">
                <strong>Email:</strong> {profile.user?.email}
              </p>

              <p className="text-gray-700">
                <strong>Phone:</strong>{" "}
                {profile.user?.phone || "Not provided"}
              </p>

              <p className="text-gray-700">
                <strong>Location:</strong>{" "}
                {profile.location || "Not provided"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">About</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">
                {profile.bio || "No bio added"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Skills</h3>

              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No skills added</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Education</h3>

              {profile.education?.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                      <p className="font-semibold">{edu.degree}</p>
                      <p>{edu.school}</p>
                      <p className="text-gray-600">
                        {edu.fieldOfStudy}
                      </p>
                      <p className="text-gray-600">
                        {edu.from} - {edu.to}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No education added</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Experience</h3>

              {profile.experience?.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                      <p className="font-semibold">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p className="text-gray-600">
                        {exp.from} - {exp.to}
                      </p>
                      <p className="text-gray-700 mt-2">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No experience added</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  View CV
                </a>
              )}

              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                >
                  GitHub
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  LinkedIn
                </a>
              )}

              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}