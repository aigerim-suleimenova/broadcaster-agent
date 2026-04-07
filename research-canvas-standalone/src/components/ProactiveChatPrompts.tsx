import { Button } from "@/components/ui/button";
import { MessageCircle, Zap } from "lucide-react";

export interface QuickAction {
  label: string;
  emoji: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    emoji: "📄",
    label: "Fetch ads.txt",
    description: "Analyze ad server and SSP partnerships",
  },
  {
    emoji: "🔍",
    label: "Search for Contacts",
    description: "Find decision makers and key people",
  },
  {
    emoji: "⚙️",
    label: "Check Compatibility",
    description: "Assess smartclip fit and migration risk",
  },
  {
    emoji: "📊",
    label: "Market Analysis",
    description: "Research market size and growth trends",
  },
];

interface ProactiveChatPromptsProps {
  onActionClick?: (action: string) => void;
  isLoading?: boolean;
}

export function ProactiveChatPrompts({
  onActionClick,
  isLoading,
}: ProactiveChatPromptsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
        <Zap className="w-4 h-4 text-yellow-500/70" />
        <span>Quick Actions</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {QUICK_ACTIONS.map((action, idx) => (
          <Button
            key={idx}
            variant="ghost"
            className="justify-start gap-3 h-auto py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-left group"
            onClick={() => onActionClick?.(action.label)}
            disabled={isLoading}
          >
            <span className="text-lg">{action.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-white/90 group-hover:text-white">
                {action.label}
              </div>
              <div className="text-xs text-white/50 group-hover:text-white/60">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-white/40">
          👋 Or type &quot;help me&quot; in the chat for guidance
        </p>
      </div>
    </div>
  );
}
