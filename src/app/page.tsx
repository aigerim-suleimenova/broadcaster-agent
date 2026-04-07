"use client";
import Pipeline from "@/components/Pipeline";
import { GoogleOAuthProvider } from "@/lib/google-oauth-context";
import { BroadcasterProvider } from "@/lib/broadcaster-context";

export default function Home() {
  return (
    <GoogleOAuthProvider>
      <BroadcasterProvider>
        <Pipeline />
      </BroadcasterProvider>
    </GoogleOAuthProvider>
  );
}
