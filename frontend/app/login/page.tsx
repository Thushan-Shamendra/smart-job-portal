"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { apiRequest, ApiError } from "@/lib/api";
import { getDashboardRoute, persistAuth } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!data.token || !data.user) {
        setError("Invalid login response received.");
        return;
      }

      persistAuth(data.token, data.user);
      router.push(getDashboardRoute(data.user.role));
    } catch (loginError) {
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : "Unable to sign you in right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to continue with JobPilot."
      description="Use your existing account to browse jobs, manage applications, post new roles, or access admin tools based on your role."
      footer={
        <p>
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-blue-700">
            Create one now
          </Link>
        </p>
      }
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Login
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Access your account
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your session uses JWT authentication and role-aware navigation.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
