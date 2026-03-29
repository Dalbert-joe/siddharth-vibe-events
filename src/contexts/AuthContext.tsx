import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  sendLoginLink: (email: string) => Promise<string | null>;
  sendSignupLink: (name: string, email: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  sendLoginLink: async () => null,
  sendSignupLink: async () => null,
  logout: async () => {},
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const actionCodeSettings = {
  url: window.location.origin + "/login",
  handleCodeInApp: true,
};

async function fetchProfile(fbUser: FirebaseUser): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", fbUser.uid));
  if (snap.exists()) {
    const data = snap.data();
    return { name: data.name || "", email: fbUser.email || "" };
  }
  return { name: "", email: fbUser.email || "" };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle email-link sign-in on page load
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation") || "";
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(async (result) => {
            localStorage.removeItem("emailForSignIn");
            const pendingName = localStorage.getItem("pendingSignupName") || "";
            if (pendingName) {
              await setDoc(doc(db, "users", result.user.uid), {
                name: pendingName,
                email: result.user.email,
                createdAt: new Date().toISOString(),
              });
              localStorage.removeItem("pendingSignupName");
            }
            // Clean URL
            window.history.replaceState(null, "", window.location.origin + "/");
          })
          .catch((err) => {
            console.error("Email link sign-in error:", err);
          });
      }
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchProfile(fbUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const sendLoginLink = async (email: string): Promise<string | null> => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("emailForSignIn", email);
      return null;
    } catch (err: any) {
      return err.message || "Failed to send login link";
    }
  };

  const sendSignupLink = async (name: string, email: string): Promise<string | null> => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("emailForSignIn", email);
      localStorage.setItem("pendingSignupName", name);
      return null;
    } catch (err: any) {
      return err.message || "Failed to send signup link";
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendLoginLink, sendSignupLink, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
