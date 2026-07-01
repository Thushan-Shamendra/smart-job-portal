import Link from "next/link";
import Image from "next/image";

type Feature = {
  title: string;
  description: string;
};

type Step = {
  number: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Skill-Based Job Recommendations",
    description:
      "Job seekers receive recommended jobs based on their saved skills and profile details.",
  },
  {
    title: "Role-Based Dashboards",
    description:
      "Separate dashboards are available for job seekers, employers, and admins.",
  },
  {
    title: "Application Tracking",
    description:
      "Applicants can track job application status such as pending, reviewed, shortlisted, rejected, and accepted.",
  },
  {
    title: "Employer Job Management",
    description:
      "Employers can create, update, delete, and manage job posts from their dashboard.",
  },
];

const steps: Step[] = [
  {
    number: "01",
    title: "Create an Account",
    description:
      "Register as a job seeker or employer and access your role-based dashboard.",
  },
  {
    number: "02",
    title: "Complete Your Profile",
    description:
      "Job seekers can add skills, education, experience, and CV links.",
  },
  {
    number: "03",
    title: "Apply or Hire",
    description:
      "Job seekers apply for jobs while employers manage applicants and statuses.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="mb-6">
            <Image
              src="/images/jobpilot-logo-full.png"
              alt="JobPilot Logo"
              width={260}
              height={260}
              priority
              className="bg-white rounded-2xl p-4 shadow-lg"
            />
          </div>
          <div>
            <p className="uppercase tracking-widest text-blue-100 font-semibold mb-4">
              Full Stack Smart Job Portal
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Jobs Faster with Smart Skill Matching
            </h1>

            <p className="text-blue-100 text-lg mb-8 max-w-xl">
              A modern job portal built with Next.js, Node.js, Express, and
              MongoDB. Job seekers can apply for jobs, employers can manage job
              posts, and admins can control the platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/jobs"
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                Browse Jobs
              </Link>

              <Link
                href="/register"
                className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Project Highlights</h2>

            <div className="space-y-4">
              <div className="bg-white text-gray-800 p-4 rounded-xl">
                <p className="font-semibold">Frontend</p>
                <p className="text-gray-600">Next.js + TypeScript + Tailwind CSS</p>
              </div>

              <div className="bg-white text-gray-800 p-4 rounded-xl">
                <p className="font-semibold">Backend</p>
                <p className="text-gray-600">Node.js + Express.js REST APIs</p>
              </div>

              <div className="bg-white text-gray-800 p-4 rounded-xl">
                <p className="font-semibold">Database</p>
                <p className="text-gray-600">MongoDB + Mongoose Models</p>
              </div>

              <div className="bg-white text-gray-800 p-4 rounded-xl">
                <p className="font-semibold">Security</p>
                <p className="text-gray-600">JWT Authentication + Role-Based Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">3</p>
            <p className="text-gray-600 mt-1">User Roles</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">CRUD</p>
            <p className="text-gray-600 mt-1">Job Management</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">JWT</p>
            <p className="text-gray-600 mt-1">Authentication</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">Smart</p>
            <p className="text-gray-600 mt-1">Recommendations</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-2">Main Features</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for Job Seekers, Employers, and Admins
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            This project includes real-world full stack features that are useful
            for a professional CV and portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">User Roles</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Role-Based Access Control
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-3">Job Seeker</h3>
              <p className="text-gray-600 mb-4">
                Create profile, browse jobs, apply for jobs, view applications,
                and get recommended jobs.
              </p>
              <Link href="/register" className="text-blue-600 font-semibold">
                Register as Job Seeker
              </Link>
            </div>

            <div className="border rounded-xl p-6 hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-3">Employer</h3>
              <p className="text-gray-600 mb-4">
                Post jobs, edit jobs, delete jobs, view applicants, and update
                application status.
              </p>
              <Link href="/register" className="text-blue-600 font-semibold">
                Register as Employer
              </Link>
            </div>

            <div className="border rounded-xl p-6 hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-3">Admin</h3>
              <p className="text-gray-600 mb-4">
                Manage users, jobs, applications, and view system dashboard
                statistics.
              </p>
              <Link href="/login" className="text-blue-600 font-semibold">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple Job Application Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-white p-6 rounded-xl shadow">
              <p className="text-blue-600 text-3xl font-bold mb-4">
                {step.number}
              </p>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CV Project Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-blue-300 font-semibold mb-2">For CV Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              A Strong Full Stack Project for Your Resume
            </h2>
            <p className="text-gray-300">
              This project demonstrates frontend development, REST API
              development, database modeling, authentication, authorization,
              CRUD operations, and smart recommendation logic.
            </p>
          </div>

          <div className="bg-white text-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">CV Description</h3>
            <p className="text-gray-600">
              Developed a full stack Smart Job Portal using Next.js,
              TypeScript, Node.js, Express.js, and MongoDB. Implemented
              role-based authentication, job posting, job applications,
              applicant management, admin dashboard, and skill-based job
              recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start Exploring the Job Portal
        </h2>

        <p className="text-gray-600 mb-8">
          Browse jobs, create an account, and test the full project flow.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Browse Jobs
          </Link>

          <Link
            href="/dashboard"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}