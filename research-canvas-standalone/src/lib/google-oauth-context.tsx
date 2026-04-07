import React, { createContext, useContext, useState, ReactNode } from "react";

interface GoogleOAuthContextType {
  accessToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const GoogleOAuthContext = createContext<GoogleOAuthContextType | undefined>(undefined);

export function useGoogleOAuth(): GoogleOAuthContextType {
  const context = useContext(GoogleOAuthContext);
  if (!context) {
    throw new Error("useGoogleOAuth must be used within GoogleOAuthProvider");
  }
  return context;
}

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

export function GoogleOAuthProvider({ children }: GoogleOAuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify token and get user email
      const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to verify Gmail token");
      }

      const data = await response.json();
      setAccessToken(token);
      setUserEmail(data.emailAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUserEmail(null);
    setError(null);
  };

  return (
    <GoogleOAuthContext.Provider
      value={{
        accessToken,
        userEmail,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </GoogleOAuthContext.Provider>
  );
}
