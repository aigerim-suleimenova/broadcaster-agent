import React from "react";
import { Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleOAuth } from "@/lib/google-oauth-context";

interface GoogleOAuthLoginProps {
  clientId: string;
  onTokenReceived: (token: string) => void;
  disabled?: boolean;
}

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function GoogleOAuthLogin({ clientId, onTokenReceived, disabled = false }: GoogleOAuthLoginProps) {
  const { accessToken, userEmail, logout } = useGoogleOAuth();

  const handleOAuthLogin = () => {
    // Get the redirect URI (current origin + callback path)
    const redirectUri = `${window.location.origin}/api/auth/callback`;

    // Build OAuth 2.0 authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: GMAIL_SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Open Google login in popup or redirect
    window.location.href = authUrl;
  };

  // Handle OAuth authorization code from callback
  React.useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const authError = params.get("auth_error");

      if (error || authError) {
        console.error("OAuth error:", error || authError);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && !accessToken) {
        try {
          // Exchange code for token via backend
          const response = await fetch("/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error("Token exchange failed");
          }

          const data = await response.json();
          if (data.access_token) {
            onTokenReceived(data.access_token);
          }
        } catch (err) {
          console.error("Token exchange failed:", err);
        } finally {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleCallback();
  }, [accessToken, onTokenReceived]);

  if (accessToken && userEmail) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-emerald-500/30 rounded-lg">
        <Mail className="w-4 h-4 text-emerald-400" />
        <div className="flex-1">
          <div className="text-xs font-medium text-white">{userEmail}</div>
          <div className="text-xs text-white/60">Gmail connected</div>
        </div>
        <Button
          onClick={logout}
          size="sm"
          variant="ghost"
          className="text-white/60 hover:text-white text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleOAuthLogin}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
    >
      <Mail className="w-4 h-4 mr-2" />
      Connect Gmail
    </Button>
  );
}
