import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
