import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

/**
 * Custom hook to simplify access to Firebase's authenticated user state.
 * Listens to onAuthStateChanged and exposes current user, loading state,
 * as well as integrated Google Sign-In and logout helper methods.
 */
export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state change observer
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firebase useAuth State Observer Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Triggers the Google Sign-In popup flow
   */
  const loginWithGoogle = async (): Promise<User> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setError(null);
      return result.user;
    } catch (err: any) {
      console.error("useAuth Sign-In Error:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers the sign-out flow
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error("useAuth Sign-Out Error:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, loginWithGoogle, logout };
};
