import { cn } from "@/lib/utils";
import { CheckIcon, LoaderCircle, AlertCircle, Lightbulb } from "lucide-react";
import { truncateUrl } from "@/lib/utils";

export function Progress({
  logs,
}: {
  logs: {
    message: string;
    done: boolean;
  }[];
}) {
  if (logs.length === 0) {
    return null;
  }

  const lastLog = logs[logs.length - 1];
  const incompleteLogs = logs.filter((log) => !log.done);
  const completeLogs = logs.filter((log) => log.done);

  return (
    <div data-test-id="progress-steps">
      <div className="border border-white/20 bg-white/5 shadow-md rounded-lg overflow-hidden text-sm backdrop-blur-sm">
        {/* Header with summary */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <div className="flex items-center gap-1">
              {incompleteLogs.length > 0 ? (
                <>
                  <LoaderCircle className="w-3 h-3 text-blue-400 animate-spin" />
                  <span>{incompleteLogs.length} step{incompleteLogs.length > 1 ? "s" : ""} in progress</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-3 h-3 text-emerald-400" />
                  <span>Analysis complete</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="py-2">
          {logs.map((log, index) => (
            <div
              key={index}
              data-test-id="progress-step-item"
              className={`flex px-4 py-2.5 transition-opacity ${
                log.done || index === logs.findIndex((l) => !l.done)
                  ? "opacity-100"
                  : "opacity-40"
              }`}
            >
              <div className="w-8 flex-shrink-0">
                <div
                  className="w-4 h-4 bg-purple-500 flex items-center justify-center rounded-full mt-0.5 ml-2"
                  data-test-id={
                    log.done
                      ? "progress-step-item_done"
                      : "progress-step-item_loading"
                  }
                >
                  {log.done ? (
                    <CheckIcon className="w-3 h-3 text-white" />
                  ) : (
                    <LoaderCircle className="w-3 h-3 text-white animate-spin" />
                  )}
                </div>
                {index < logs.length - 1 && (
                  <div
                    className={cn("h-6 w-[1px] bg-white/20 ml-[14px]")}
                  ></div>
                )}
              </div>
              <div className="flex-1 ml-2">
                <p className="text-white/80 text-sm leading-relaxed">
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Guidance footer */}
        {incompleteLogs.length === 0 && (
          <div className="px-4 py-3 border-t border-white/10 bg-emerald-500/5">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400/70 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-emerald-300/80 mb-1">
                  Next Step
                </p>
                <p className="text-xs text-emerald-200/60">
                  Review the analysis above. Ask the agent to refine any findings or proceed to the compatibility assessment.
                </p>
              </div>
            </div>
          </div>
        )}

        {incompleteLogs.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10 bg-blue-500/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400/70 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-300/80 mb-1">
                  Currently Processing
                </p>
                <p className="text-xs text-blue-200/60">
                  The agent is analyzing your research. You can add more resources or ask for specific insights below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
