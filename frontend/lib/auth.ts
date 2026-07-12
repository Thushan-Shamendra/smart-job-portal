import type { AuthUser, UserRole } from "@/lib/types";

const AUTH_STATE_EVENT = "jobpilot-auth-changed";

const emitAuthStateChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  }
};

export const getStoredToken = () => localStorage.getItem("token");

export const getStoredUser = (): AuthUser | null => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    return null;
  }
};

export const persistAuth = (token: string, user: AuthUser) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  emitAuthStateChange();
};

export const clearStoredAuth = (emit = true) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (emit) {
    emitAuthStateChange();
  }
};

export const authStateEventName = AUTH_STATE_EVENT;

export const getDashboardRoute = (role?: UserRole) => {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/dashboard";
};

export const getRoleLabel = (role?: UserRole) => {
  if (role === "jobseeker") {
    return "Job Seeker";
  }

  if (role === "employer") {
    return "Employer";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Guest";
};
