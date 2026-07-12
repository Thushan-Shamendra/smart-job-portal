import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export default function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-slate-800 shadow-sm">
      <h3 className="text-lg font-semibold text-rose-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-700/90">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
