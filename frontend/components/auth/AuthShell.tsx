import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="page-shell flex min-h-[calc(100vh-10rem)] items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_30px_60px_rgba(15,23,42,0.22)] md:px-10">
          <Image
            src="/images/hero-job.png"
            alt="JobPilot workspace"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/88 to-blue-950/80" />

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-4">
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <Image
                  src="/images/jobpilot-logo-full.png"
                  alt="JobPilot logo"
                  width={96}
                  height={96}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  {eyebrow}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  A streamlined hiring experience for candidates, employers, and
                  platform admins.
                </p>
              </div>
            </div>

            <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
              {description}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-lg font-semibold">Role-based experience</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Sign in securely and access the tools that match your role,
                  whether you are hiring or applying.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-lg font-semibold">Built for momentum</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Move from discovery to application with a cleaner, more
                  focused workflow.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
              <Link href="/jobs" className="underline-offset-4 hover:underline">
                Browse open jobs
              </Link>
              <span>&middot;</span>
              <Link href="/" className="underline-offset-4 hover:underline">
                Back to home
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          {children}
          <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
            {footer}
          </div>
        </section>
      </div>
    </div>
  );
}
