"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  return useMemo(() => ({
    session,
    user,
    isAuthenticated,
    isLoading,
    status
  }), [session, user, isAuthenticated, isLoading, status]);
}
