import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meQuery = trpc.admin.me.useQuery(undefined, {
    retry: false,
  });

  const logoutMutation = trpc.admin.logout.useMutation();

  useEffect(() => {
    if (meQuery.isLoading) {
      setLoading(true);
    } else if (meQuery.data) {
      setUser(meQuery.data);
      setLoading(false);
    } else if (meQuery.error) {
      setUser(null);
      setError(meQuery.error.message);
      setLoading(false);
    }
  }, [meQuery.data, meQuery.error, meQuery.isLoading]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
      // Reload page to clear session
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
  };
}
