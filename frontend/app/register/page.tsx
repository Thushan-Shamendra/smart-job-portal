"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { apiRequest, ApiError } from "@/lib/api";
import { getDashboardRoute, persistAuth } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: "jobseeker" | "employer";
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!data.token || !data.user) {
        setError("Invalid registration response received.");
        return;
      }

      persistAuth(data.token, data.user);
      router.push(getDashboardRoute(data.user.role));
    } catch (registerError) {
      setError(
        registerError instanceof ApiError
          ? registerError.message
          : "Unable to create your account right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Get Started"
      title="Create your JobPilot account."
      description="Choose the role that matches how you’ll use the platform. Jobseekers can manage applications, employers can post jobs, and admins have their own secured dashboard."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-700">
            Sign in instead
          </Link>
        </p>
      }
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Register
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Set up your profile
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Create your account, choose your role, and get started with the
          experience that fits you best.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <InputField
          label="Full name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          required
        />

        <InputField
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="text-sm font-medium text-blue-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />
          <span className="mt-2 block text-sm text-slate-500">
            Use at least 6 characters.
          </span>
        </label>

        <SelectField
          label="I want to join as"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="jobseeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </SelectField>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
