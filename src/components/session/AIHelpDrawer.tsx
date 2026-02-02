import { useState } from "react";
import {
  MessageCircle,
  X,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Layers,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AIHelpRequest } from "@/types/session";

interface AIHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  aiHelpRequests: AIHelpRequest[];
  onRequestHelp: (type: AIHelpRequest["type"], context: string) => Promise<void>;
  maxHelpCount?: number;
}

const helpOptions = [
  {
    type: "re-explain" as const,
    icon: BookOpen,
    label: "Explain differently",
    description: "Get a different explanation of the concept",
  },
  {
    type: "simpler-analogy" as const,
    icon: Lightbulb,
    label: "Use an analogy",
    description: "Understand through a real-world comparison",
  },
  {
    type: "guiding-question" as const,
    icon: HelpCircle,
    label: "Guide me",
    description: "Get a hint without the answer",
  },
  {
    type: "break-down" as const,
    icon: Layers,
    label: "Break it down",
    description: "See the concept in smaller steps",
  },
];

export function AIHelpDrawer({
  isOpen,
  onClose,
  context,
  aiHelpRequests,
  onRequestHelp,
  maxHelpCount = 5,
}: AIHelpDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeHelpType, setActiveHelpType] = useState<AIHelpRequest["type"] | null>(
    null
  );

  const helpUsedCount = aiHelpRequests.length;
  const canRequestMore = helpUsedCount < maxHelpCount;

  const handleRequestHelp = async (type: AIHelpRequest["type"]) => {
    if (!canRequestMore || isLoading) return;
    
    setIsLoading(true);
    setActiveHelpType(type);
    
    try {
      await onRequestHelp(type, context);
    } finally {
      setIsLoading(false);
      setActiveHelpType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">AI Learning Coach</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={canRequestMore ? "secondary" : "destructive"}
          >
            {helpUsedCount}/{maxHelpCount} used
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Coach Philosophy */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-700">
          🎓 I'm here to guide your learning, not give you answers. I'll help you 
          think through problems and understand concepts more deeply.
        </p>
      </div>

      {/* Context */}
      {context && (
        <div className="px-4 py-3 bg-gray-50 border-b">
          <p className="text-xs text-gray-500 mb-1">You're asking about:</p>
          <p className="text-sm text-gray-700 font-medium line-clamp-2">
            {context}
          </p>
        </div>
      )}

      {/* Help Options */}
      {canRequestMore && (
        <div className="p-4 border-b">
          <p className="text-sm font-medium text-gray-700 mb-3">
            How can I help you?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {helpOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                size="sm"
                className="h-auto py-3 px-3 flex flex-col items-start gap-1"
                onClick={() => handleRequestHelp(option.type)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-1.5">
                  {isLoading && activeHelpType === option.type ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <option.icon className="h-4 w-4" />
                  )}
                  <span className="font-medium text-xs">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500 text-left">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {!canRequestMore && (
        <div className="p-4 border-b bg-yellow-50">
          <p className="text-sm text-yellow-800">
            ⚠️ You've used all your AI help for this session. Try working through 
            the problem on your own or review the learning content again.
          </p>
        </div>
      )}

      {/* Conversation History */}
      <ScrollArea className="flex-1 p-4">
        {aiHelpRequests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No help requests yet</p>
            <p className="text-xs mt-1">
              Select an option above when you need guidance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiHelpRequests.map((request, index) => (
              <div key={index} className="space-y-2">
                {/* User's Request */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Send className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">
                      {helpOptions.find((o) => o.type === request.type)?.label}
                    </p>
                    <p className="text-sm text-gray-700">{request.context}</p>
                  </div>
                </div>

                {/* AI Response */}
                {request.response && (
                  <div className="flex items-start gap-2 ml-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {request.response}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          AI assistance is limited to encourage independent learning
        </p>
      </div>
    </div>
  );
}
