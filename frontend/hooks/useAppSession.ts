"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authStateEventName,
  clearStoredAuth,
  getDashboardRoute,
  getStoredToken,
  getStoredUser,
} from "@/lib/auth";
import type { AuthUser, UserRole } from "@/lib/types";

type UseAppSessionOptions = {
  required?: boolean;
  allowedRoles?: UserRole[];
};

type SessionState = {
  loading: boolean;
  token: string | null;
  user: AuthUser | null;
};

export const useAppSession = (options: UseAppSessionOptions = {}) => {
  const { required = false, allowedRoles } = options;
  const router = useRouter();
  const allowedRolesKey = allowedRoles?.join("|") || "";

  const [state, setState] = useState<SessionState>({
    loading: true,
    token: null,
    user: null,
  });

  useEffect(() => {
    const syncSessionState = () => {
      const normalizedAllowedRoles = allowedRolesKey
        ? (allowedRolesKey.split("|") as UserRole[])
        : null;
      const token = getStoredToken();
      const user = getStoredUser();

      if (!token || !user) {
        clearStoredAuth(false);
        setState({
          loading: false,
          token: null,
          user: null,
        });

        if (required) {
          router.push("/login");
        }

        return;
      }

      if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(user.role)) {
        setState({
          loading: false,
          token,
          user,
        });
        router.push(getDashboardRoute(user.role));
        return;
      }

      setState({
        loading: false,
        token,
        user,
      });
    };

    Promise.resolve().then(syncSessionState);

    const handleStorageChange = () => {
      syncSessionState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(authStateEventName, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(authStateEventName, handleStorageChange);
    };
  }, [allowedRolesKey, required, router]);

  return state;
};
