import { createContext, useContext, useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";
import { useGetCurrentUser, getGetCurrentUserQueryKey, useLogoutUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const queryClient = useQueryClient();
    const [token, setTokenState] = useState(() => localStorage.getItem("foodrush_token"));
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
    const login = (newToken, newUser) => {
        localStorage.setItem("foodrush_token", newToken);
        setTokenState(newToken);
        queryClient.setQueryData(getGetCurrentUserQueryKey(), newUser);
    };
    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        }
        catch (e) {
            // Ignore errors on logout
        }
        localStorage.removeItem("foodrush_token");
        setTokenState(null);
        queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
        queryClient.clear(); // Clear all queries
        window.location.href = "/login";
    };
    return (<AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
