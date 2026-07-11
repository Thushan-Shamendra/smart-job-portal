"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: string[];
  posted: string;
};

const featuredJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Global Systems",
    location: "Colombo",
    salary: "Rs. 150,000",
    type: "Full-time",
    skills: ["React", "Next.js", "TypeScript"],
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "TechNova",
    location: "Remote",
    salary: "Rs. 180,000",
    type: "Remote",
    skills: ["Node.js", "Express", "MongoDB"],
    posted: "5 hours ago",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: "Creative Labs",
    location: "Colombo",
    salary: "Rs. 120,000",
    type: "Contract",
    skills: ["Figma", "UX", "Design"],
    posted: "1 day ago",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.append("search", keyword.trim());
    }

    if (location.trim()) {
      params.append("location", location.trim());
    }

    router.push(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[760px] flex items-center justify-center px-6">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-job.png"
            alt="JobPilot hero background"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/40 to-slate-50" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center pt-16 animate-fade-up">
          {/* Big Logo Fix */}
          <div className="mb-8 flex justify-center">
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-slate-200 flex items-center justify-center hover:scale-105 transition duration-500">
              <Image
                src="/images/jobpilot-logo-full.png"
                alt="JobPilot Logo"
                width={256}
                height={256}
                priority
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>

          <p className="uppercase tracking-widest text-blue-700 font-semibold mb-4">
            JobPilot - Smart Job Portal
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Find Your Dream Career with{" "}
            <span className="text-blue-600">JobPilot</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto mb-10">
            Navigate your professional future. Discover jobs, apply online,
            track your applications, and get skill-based recommendations that
            match your profile.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 animate-fade-up-delay"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
              <span className="text-slate-400">⌕</span>

              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
              <span className="text-slate-400">⌖</span>

              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              Find Jobs
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm animate-fade-up-delay-2">
            <span className="text-slate-500">Popular:</span>

            {["Software Engineer", "Product Manager", "Data Scientist"].map(
              (tag) => (
                <Link
                  key={tag}
                  href="/jobs"
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                >
                  {tag}
                </Link>
              )
            )}
          </div>

          <div className="hidden lg:block absolute left-10 top-56 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float">
            <p className="text-sm text-slate-500">Profile Match</p>
            <p className="text-2xl font-bold text-blue-600">92%</p>
          </div>

          <div className="hidden lg:block absolute right-8 top-64 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float-delay">
            <p className="text-sm text-slate-500">Application</p>
            <p className="text-lg font-bold text-emerald-600">Shortlisted</p>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold">Featured Jobs</h2>
            <p className="text-slate-600 mt-2">
              Top opportunities curated for you.
            </p>
          </div>

          <Link href="/jobs" className="text-blue-600 font-semibold">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job, index) => (
            <div
              key={job.id}
              className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-card"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold">
                  {job.company.charAt(0)}
                </div>

                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {job.type}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition">
                {job.title}
              </h3>

              <p className="text-blue-600 text-sm mb-4">{job.company}</p>

              <div className="text-sm text-slate-600 space-y-2 mb-4">
                <p>⌖ {job.location}</p>
                <p>💼 {job.salary}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-xs text-slate-500">{job.posted}</span>

                <Link
                  href="/jobs"
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Streamlined for Success
            </h2>
            <p className="text-slate-600 mt-3">
              Everything you need to apply, hire, and manage jobs smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Create Your Profile",
                text: "Build a profile with skills, education, experience, and CV links.",
              },
              {
                title: "Get Smart Matches",
                text: "Find recommended jobs based on your saved skills.",
              },
              {
                title: "Apply and Track",
                text: "Apply for jobs and track your application status.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold mb-5">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-[360px] rounded-3xl overflow-hidden shadow-xl group">
            <Image
              src="/images/candidate.png"
              alt="Candidate career growth"
              fill
              className="object-cover group-hover:scale-105 transition duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                For Candidates
              </span>

              <h3 className="text-3xl font-bold mt-4">
                Accelerate Your Career
              </h3>

              <p className="text-white/80 mt-2 mb-5">
                Showcase your skills to top companies and land the role you
                deserve.
              </p>

              <Link
                href="/my-profile"
                className="bg-blue-600 px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Build Profile
              </Link>
            </div>
          </div>

          <div className="relative h-[360px] rounded-3xl overflow-hidden shadow-xl group">
            <Image
              src="/images/employer.png"
              alt="Employer hiring team"
              fill
              className="object-cover group-hover:scale-105 transition duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                For Employers
              </span>

              <h3 className="text-3xl font-bold mt-4">Hire Top Talent</h3>

              <p className="text-white/80 mt-2 mb-5">
                Reach qualified candidates quickly and manage applicants from
                one place.
              </p>

              <Link
                href="/employer/add-job"
                className="bg-white text-slate-900 px-5 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">
            Ready to Start Your Journey?
          </h2>

          <p className="text-slate-300 text-lg mb-10">
            Join professionals finding ideal roles every day with JobPilot.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Get Started Now
            </Link>

            <Link
              href="/jobs"
              className="border border-white/40 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-950 transition"
            >
              Browse Jobs First
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-white/10 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">JobPilot</h3>
            <p className="text-slate-400 mt-2">
              Navigate your professional future smarter.
            </p>
          </div>

          <p className="text-slate-500 text-sm">
            © 2026 JobPilot. Built with Next.js, TypeScript, Node.js, Express,
            and MongoDB.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out both;
        }

        .animate-fade-up-delay {
          animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .animate-fade-up-delay-2 {
          animation: fadeUp 0.8s ease-out 0.4s both;
        }

        .animate-card {
          animation: fadeUp 0.7s ease-out both;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float 4s ease-in-out 1s infinite;
        }
      `}</style>
    </main>
  );
}