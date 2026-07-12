import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export default function SelectField({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: SelectFieldProps) {
  const selectId = id || props.name;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        id={selectId}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className
        )}
        {...props}
      >
        {children}
      </select>

      {error ? (
        <span className="mt-2 block text-sm text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-sm text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
