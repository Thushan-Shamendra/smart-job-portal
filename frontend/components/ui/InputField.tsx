import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export default function InputField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputFieldProps) {
  const inputId = id || props.name;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        id={inputId}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className
        )}
        {...props}
      />

      {error ? (
        <span className="mt-2 block text-sm text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-sm text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
