import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <Image
              src="/images/jobpilot-icon.png"
              alt="JobPilot logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <p className="text-lg font-semibold text-slate-950">JobPilot</p>
              <p className="text-sm text-slate-500">
                Smart hiring and job discovery for modern teams and candidates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-sm text-slate-500">
          © 2026 JobPilot. Built with Next.js, Express, and MongoDB.
        </p>
      </div>
    </footer>
  );
}
