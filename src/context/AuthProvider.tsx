import { useState } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const [user, setAuthUser] = useState<AuthUser | null>(null);

  function logout() {
    localStorage.removeItem("token");
    setAuthUser(null);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setAuthUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
