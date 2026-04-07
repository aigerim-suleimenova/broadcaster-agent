import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Edit2, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EmailCompositionProps {
  toEmail: string;
  toName: string;
  toTitle: string;
  broadcasterName: string;
  subject: string;
  body: string;
  onSend: (updatedSubject: string, updatedBody: string) => Promise<void>;
  isSending?: boolean;
  onCancel?: () => void;
}

export function EmailComposition({
  toEmail,
  toName,
  toTitle,
  broadcasterName,
  subject,
  body,
  onSend,
  isSending = false,
  onCancel,
}: EmailCompositionProps) {
  const [editMode, setEditMode] = useState(true);
  const [editedSubject, setEditedSubject] = useState(subject);
  const [editedBody, setEditedBody] = useState(body);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    if (!editedSubject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!editedBody.trim()) {
      setError("Body is required");
      return;
    }

    try {
      await onSend(editedSubject, editedBody);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-white/5 to-transparent rounded-lg">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-white/10 px-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Email Outreach</h3>
        </div>
        <div className="text-sm text-white/60">
          To: <span className="font-medium text-white">{toName}</span> ({toEmail})<br />
          <span className="text-xs text-white/50">{toTitle} at {broadcasterName}</span>
        </div>
        </motion.div>
      </div>

      {/* Email Editor */}
      {editMode ? (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
          {/* Subject Input */}
          <div>
            <label className="text-xs font-semibold text-white/70 mb-2 block">Subject</label>
            <Input
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder="Email subject..."
              className="bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-cyan-500/50 h-10 text-sm"
            />
          </div>

          {/* Body Textarea */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-semibold text-white/70 mb-2 block">Message</label>
            <Textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              placeholder="Write your outreach email..."
              className="bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-cyan-500/50 text-sm flex-1 resize-none min-h-40"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-300">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                setEditMode(false);
              }}
              className="flex-1 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 hover:from-cyan-500/60 hover:to-blue-500/60 text-white gap-2 border border-cyan-500/30 font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Email"}
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
          </motion.div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
          {/* Subject Preview */}
          <div>
            <label className="text-xs font-semibold text-white/70 mb-2 block">Subject</label>
            <div className="bg-white/5 border border-white/15 rounded px-3 py-2 text-white text-sm font-medium">
              {editedSubject}
            </div>
          </div>

          {/* Body Preview */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-semibold text-white/70 mb-2 block">Message Preview</label>
            <div className="bg-white/5 border border-white/15 rounded px-4 py-3 text-white/80 text-sm whitespace-pre-wrap break-words flex-1 overflow-y-auto font-mono">
              {editedBody}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setEditMode(true)}
              className="flex-1 bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 text-white gap-2 border border-amber-600/30 font-medium text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Approve & Send"}
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
