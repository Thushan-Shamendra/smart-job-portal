export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          Smart Job Portal
        </h1>

        <p className="text-gray-600 mb-6">
          Find jobs, apply online, and get skill-based job recommendations.
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Get Started
          </a>

          <a
            href="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50"
          >
            Login
          </a>

          <a
            href="/jobs"
            className="border border-green-600 text-green-600 px-6 py-3 rounded hover:bg-green-50"
          >
            Browse Jobs
          </a>
        </div>
      </div>
    </main>
  );
}