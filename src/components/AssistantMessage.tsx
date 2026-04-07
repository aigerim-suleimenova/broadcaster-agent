import { AssistantMessageProps } from "@copilotkit/react-ui";
import { Markdown } from "@copilotkit/react-ui";
import { Loader } from "lucide-react";
export const CustomAssistantMessage = (props: AssistantMessageProps) => {
  const { message, isLoading, subComponent } = props;

  return (
    <div className="pb-4">
      {(message || isLoading) && (
        <div >
          <div>
            <Markdown content={message?.content || ""} />
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-blue-500">
                <Loader className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {subComponent && <div>{subComponent}</div>}
    </div>
  );
};
