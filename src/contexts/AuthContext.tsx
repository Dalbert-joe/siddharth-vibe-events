import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => string | null;
  signup: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

interface StoredUser {
  name: string;
  email: string;
  password: string;
}

const getUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    return [];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authEmail = localStorage.getItem("auth");
    if (authEmail) {
      const users = getUsers();
      const found = users.find((u) => u.email === authEmail);
      if (found) setUser({ name: found.name, email: found.email });
    }
  }, []);

  const login = (email: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return "Invalid email or password";
    localStorage.setItem("auth", found.email);
    setUser({ name: found.name, email: found.email });
    return null;
  };

  const signup = (name: string, email: string, password: string): string | null => {
    const users = getUsers();
    if (users.some((u) => u.email === email)) return "An account with this email already exists";
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    return null;
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
