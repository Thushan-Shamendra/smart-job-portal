"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import InputField from "@/components/ui/InputField";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import PageHeader from "@/components/ui/PageHeader";
import SelectField from "@/components/ui/SelectField";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppSession } from "@/hooks/useAppSession";
import { apiRequest, isUnauthorizedError } from "@/lib/api";
import type { UserRole, UsersResponse, UserSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type UserRow = UserSummary & {
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

type PendingAction =
  | { type: "toggle"; user: UserRow }
  | { type: "delete"; user: UserRow }
  | null;

export default function AdminUsersPage() {
  const router = useRouter();
  const { loading: sessionLoading, token, user } = useAppSession({
    required: true,
    allowedRoles: ["admin"],
  });

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (sessionLoading || !token || !user) {
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<UsersResponse>("/admin/users", { token });
        setUsers(data.users as UserRow[]);
      } catch (loadError) {
        if (isUnauthorizedError(loadError)) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [router, sessionLoading, token, user]);

  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter ? item.role === roleFilter : true;
        return matchesSearch && matchesRole;
      }),
    [roleFilter, search, users]
  );

  const confirmAction = async () => {
    if (!token || !pendingAction) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      if (pendingAction.type === "toggle") {
        const nextStatus = !pendingAction.user.isActive;

        await apiRequest(`/admin/users/${pendingAction.user._id}/status`, {
          method: "PUT",
          token,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        });

        setUsers((current) =>
          current.map((item) =>
            item._id === pendingAction.user._id
              ? { ...item, isActive: nextStatus }
              : item
          )
        );
      }

      if (pendingAction.type === "delete") {
        await apiRequest(`/admin/users/${pendingAction.user._id}`, {
          method: "DELETE",
          token,
        });

        setUsers((current) =>
          current.filter((item) => item._id !== pendingAction.user._id)
        );
      }

      setPendingAction(null);
    } catch (actionError) {
      if (isUnauthorizedError(actionError)) {
        router.push("/login");
        return;
      }

      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to complete this admin action."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton className="h-10 w-72" />
        <LoadingSkeleton className="mt-8 h-24 w-full rounded-[28px]" />
        <div className="mt-8 space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40 w-full rounded-[28px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Admin"
        title="Manage platform users"
        description="Search accounts, filter by role, and manage access across the platform."
        />

      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <InputField
            label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
          />
          <SelectField
            label="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="jobseeker">Jobseeker</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </SelectField>
        </div>
      </div>

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} />
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users match your filters"
            description="Try broadening the search or clearing the role filter."
          />
        ) : (
          filteredUsers.map((item) => (
            <article
              key={item._id}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{item.email}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.phone && item.phone.trim() !== ""
                      ? item.phone
                      : "Phone not provided"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 capitalize">
                    {item.role}
                  </span>
                  <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Created</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">User ID</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {item._id}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: "toggle", user: item })}
                  className={
                    item.isActive
                      ? "inline-flex items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                      : "inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  }
                >
                  {item.isActive ? "Deactivate User" : "Activate User"}
                </button>

                <button
                  type="button"
                  onClick={() => setPendingAction({ type: "delete", user: item })}
                  className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete User
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        title={
          pendingAction?.type === "delete"
            ? "Delete this user?"
            : pendingAction?.user.isActive
            ? "Deactivate this user?"
            : "Activate this user?"
        }
        description={
          pendingAction?.type === "delete"
            ? `This will permanently remove ${pendingAction.user.name}'s account.`
            : pendingAction?.user.isActive
            ? `This will block ${pendingAction.user.name} from signing in until the account is reactivated.`
            : `This will allow ${pendingAction?.user.name} to sign in again.`
        }
        confirmLabel={
          pendingAction?.type === "delete"
            ? "Delete User"
            : pendingAction?.user.isActive
            ? "Deactivate User"
            : "Activate User"
        }
        tone={pendingAction?.type === "delete" ? "danger" : "primary"}
        busy={processing}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
