import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";
import { useGetCurrentUser, getGetCurrentUserQueryKey, useLogoutUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("foodrush_token"));
  
  // Set the token getter for the API client
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("foodrush_token"));
  }, []);

  const { data: user, isLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetCurrentUserQueryKey()
    }
  });

  const logoutMutation = useLogoutUser();

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("foodrush_token");
      setTokenState(null);
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("foodrush_token", newToken);
    setTokenState(newToken);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), newUser);
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem("foodrush_token");
    setTokenState(null);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear(); // Clear all queries
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
