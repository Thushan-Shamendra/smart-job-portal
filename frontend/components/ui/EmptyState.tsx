import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <span className="text-lg font-bold">JP</span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
