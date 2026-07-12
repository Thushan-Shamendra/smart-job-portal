"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Button, { buttonStyles } from "@/components/ui/Button";
import { clearStoredAuth, getDashboardRoute, getRoleLabel } from "@/lib/auth";
import { useAppSession } from "@/hooks/useAppSession";
import { cn, getInitials } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
];

const jobseekerLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/recommended-jobs", label: "Recommended Jobs" },
  { href: "/my-applications", label: "My Applications" },
  { href: "/my-profile", label: "My Profile" },
];

const employerLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employer/add-job", label: "Post Job" },
  { href: "/employer/my-jobs", label: "My Jobs" },
];

const adminLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Admin Dashboard" },
  { href: "/admin/users", label: "Manage Users" },
  { href: "/admin/jobs", label: "Manage Jobs" },
  { href: "/admin/applications", label: "Applications" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { loading: sessionLoading, user } = useAppSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (!user) {
      return publicLinks;
    }

    if (user.role === "jobseeker") {
      return jobseekerLinks;
    }

    if (user.role === "employer") {
      return employerLinks;
    }

    return adminLinks;
  }, [user]);

  const handleLogout = () => {
    clearStoredAuth();
    setMobileOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/jobpilot-icon.png"
            alt="JobPilot logo"
            width={42}
            height={42}
            className="rounded-xl"
          />
          <div>
            <p className="text-lg font-semibold text-slate-950">JobPilot</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Smart Job Portal
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {sessionLoading ? null : user ? (
            <>
              <Link
                href={getDashboardRoute(user.role)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {getInitials(user.name)}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-slate-900">
                    {user.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {getRoleLabel(user.role)}
                  </span>
                </span>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-700 lg:hidden"
        >
          <span className="text-xl">{mobileOpen ? "x" : "="}</span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium transition",
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
            {sessionLoading ? null : user ? (
              <>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout} fullWidth>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={buttonStyles({
                    variant: "ghost",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={buttonStyles({
                    variant: "primary",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
