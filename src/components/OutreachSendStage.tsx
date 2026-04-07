import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Clock, AlertCircle } from "lucide-react";
import { useGoogleOAuth } from "@/lib/google-oauth-context";
import { sendEmailViaGmail } from "@/lib/gmail-client";
import { EmailComposition } from "@/components/EmailComposition";
import { GoogleOAuthLogin } from "@/components/GoogleOAuthLogin";
import { Button } from "@/components/ui/button";

interface OutreachSendStageProps {
  status: "pending" | "active" | "complete";
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  broadcasterName: string;
  draftSubject: string;
  draftBody: string;
  onEmailSent?: (messageId: string, subject: string, to: string) => void;
  onCancel?: () => void;
}

export function OutreachSendStage({
  status,
  contactName,
  contactEmail,
  contactTitle,
  broadcasterName,
  draftSubject,
  draftBody,
  onEmailSent,
  onCancel,
}: OutreachSendStageProps) {
  const { accessToken, login } = useGoogleOAuth();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentInfo, setSentInfo] = useState<{ messageId: string; timestamp: string } | null>(null);

  const handleSend = async (subject: string, body: string) => {
    if (!accessToken) {
      setError("Gmail is not authenticated. Please connect your Gmail account first.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await sendEmailViaGmail(accessToken, {
        to: contactEmail,
        subject,
        body,
      });

      setSentInfo({
        messageId: result.messageId,
        timestamp: new Date().toLocaleString(),
      });

      if (onEmailSent) {
        onEmailSent(result.messageId, subject, contactEmail);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send email";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Gmail Authentication Required</h3>
          <p className="text-sm text-white/60 mb-6">
            Connect your Gmail account to send outreach emails. This requires the &quot;Send emails&quot; permission.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left mb-6">
            <p className="text-xs text-white/70 mb-2 font-medium">Required scope:</p>
            <p className="text-xs font-mono text-cyan-300">https://www.googleapis.com/auth/gmail.send</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-300 mb-4">
              {error}
            </div>
          )}
          <GoogleOAuthLogin
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
            onTokenReceived={login}
          />
          </motion.div>
        </div>
      </div>
    );
  }

  if (sentInfo) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Email Sent Successfully! 🎉</h3>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left mb-6">
            <div className="flex items-center gap-2 mb-3 text-xs text-white/70">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Message Details</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-white/50">To:</span> <span className="text-white">{contactName}</span>
              </div>
              <div>
                <span className="text-white/50">Email:</span> <span className="font-mono text-cyan-300 text-xs">{contactEmail}</span>
              </div>
              <div>
                <span className="text-white/50">Sent:</span> <span className="text-white/70">{sentInfo.timestamp}</span>
              </div>
              <div>
                <span className="text-white/50">Message ID:</span> <span className="font-mono text-white/60 text-xs">{sentInfo.messageId}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 text-left">
            <h4 className="text-xs font-semibold text-blue-300 mb-2">📋 Next Steps</h4>
            <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
              <li>Monitor for response (typically within 2-3 business days)</li>
              <li>Schedule follow-up if no response after one week</li>
              <li>Note: Respect their communication preferences</li>
            </ol>
          </div>

          {onCancel && (
            <Button
              onClick={onCancel}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm"
            >
              Complete and Continue
            </Button>
          )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <EmailComposition
      toEmail={contactEmail}
      toName={contactName}
      toTitle={contactTitle}
      broadcasterName={broadcasterName}
      subject={draftSubject}
      body={draftBody}
      onSend={handleSend}
      isSending={isSending}
      onCancel={onCancel}
    />
  );
}
