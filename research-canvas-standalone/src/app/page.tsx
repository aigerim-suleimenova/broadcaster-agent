"use client";

import { CopilotKit } from "@copilotkit/react-core";
import Pipeline from "@/components/Pipeline";
import { GoogleOAuthProvider } from "@/lib/google-oauth-context";
import { BroadcasterProvider } from "@/lib/broadcaster-context";

export default function Home() {
  const agent = "research_agent";
  const runtimeUrl = "/api/copilotkit";

  return (
    <GoogleOAuthProvider>
      <BroadcasterProvider>
        <CopilotKit runtimeUrl={runtimeUrl} showDevConsole={false} agent={agent}>
          <Pipeline />
        </CopilotKit>
      </BroadcasterProvider>
    </GoogleOAuthProvider>
  );
}
