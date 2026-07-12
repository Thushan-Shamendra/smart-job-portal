import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export const buttonStyles = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" && "px-3.5 py-2 text-sm",
    size === "md" && "px-4 py-2.5 text-sm",
    size === "lg" && "px-5 py-3 text-base",
    variant === "primary" &&
      "bg-blue-600 text-white hover:text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
    variant === "secondary" &&
      "bg-slate-900 text-white hover:text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800",
    variant === "ghost" &&
      "bg-white/70 text-slate-700 hover:bg-white hover:text-slate-950",
    variant === "danger" &&
      "bg-rose-600 text-white hover:text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700",
    variant === "success" &&
      "bg-emerald-600 text-white hover:text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
    variant === "outline" &&
      "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50",
    fullWidth && "w-full",
    className
  );

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({
        variant,
        size,
        fullWidth,
        className,
      })}
      {...props}
    >
      {children}
    </button>
  );
}
