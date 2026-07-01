"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = "jobseeker" | "employer" | "admin";

type LoggedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
};

type UsersResponse = {
  success: boolean;
  message?: string;
  users: User[];
};

type StatusResponse = {
  success: boolean;
  message?: string;
  user?: User;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const loggedUser: LoggedUser | null = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token) {
        router.push("/login");
        return;
      }

      if (loggedUser?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: UsersResponse = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch users");
          return;
        }

        setUsers(data.users);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        }
      );

      const data: StatusResponse = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update user status");
        return;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isActive: !currentStatus }
            : user
        )
      );

      alert(data.message || "User status updated successfully");
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: DeleteResponse = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete user");
        return;
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));

      alert(data.message || "User deleted successfully");
    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-6">Loading users...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-1">
              View, activate, deactivate, or delete users.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="text-purple-600">
              Admin Dashboard
            </Link>

            <Link href="/dashboard" className="text-blue-600">
              Main Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        {users.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-4 font-medium">{user.name}</td>

                    <td className="p-4">{user.email}</td>

                    <td className="p-4 capitalize">{user.role}</td>

                    <td className="p-4">
                      {user.phone && user.phone.trim() !== ""
                        ? user.phone
                        : "Not provided"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(user._id, user.isActive)
                          }
                          className={`px-3 py-2 rounded text-white text-sm ${
                            user.isActive
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}