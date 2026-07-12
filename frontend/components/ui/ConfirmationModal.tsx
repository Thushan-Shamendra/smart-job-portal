"use client";

import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmationModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
