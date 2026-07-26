import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import authService from "@/services/auth/auth.service";
import type { AuthResponse, LoginCredentials } from "@/types/auth/auth.types";
import type { User } from "@/types/user/user.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getAuthUser());
  const [isLoading, setIsLoading] = useState(Boolean(authService.getToken()));

  useEffect(() => {
    if (!authService.getToken()) {
      setIsLoading(false);
      return;
    }
    authService
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);
  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }, []);
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);
  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      isAdmin: Boolean(user?.isAdmin || user?.isSuperUser),
    }),
    [user, isLoading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
