import { useState } from "react";
import { 
  Play, 
  FileText, 
  Sparkles, 
  Code2, 
  PenTool,
  TestTube,
  StickyNote,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { SessionMode } from "@/types/session";

interface SessionMobileNavProps {
  activeMode: SessionMode;
  onModeChange: (mode: SessionMode) => void;
  noteCount: number;
  disabledModes?: Set<SessionMode>;
  disabled?: boolean;
}

const quickAccessModes = [
  { mode: "video" as SessionMode, label: "Video", icon: Play },
  { mode: "notes" as SessionMode, label: "Notes", icon: FileText },
  { mode: "practice" as SessionMode, label: "Practice", icon: PenTool },
  { mode: "my-notes" as SessionMode, label: "My Notes", icon: StickyNote },
];

const allModes = [
  { mode: "video" as SessionMode, label: "Video", icon: Play, section: "Content" },
  { mode: "notes" as SessionMode, label: "Notes", icon: FileText, section: "Content" },
  { mode: "ai-summary" as SessionMode, label: "AI Summary", icon: Sparkles, section: "Content" },
  { mode: "examples" as SessionMode, label: "Examples", icon: Code2, section: "Understand" },
  { mode: "practice" as SessionMode, label: "Practice", icon: PenTool, section: "Practice" },
  { mode: "mini-test" as SessionMode, label: "Mini Test", icon: TestTube, section: "Practice" },
  { mode: "my-notes" as SessionMode, label: "My Notes", icon: StickyNote, section: "Personal" },
];

export function SessionMobileNav({ 
  activeMode, 
  onModeChange, 
  noteCount,
  disabledModes,
  disabled = false,
}: SessionMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeChange = (mode: SessionMode) => {
    if (disabled) {
      return;
    }
    onModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-2 py-1">
      {/* Quick access buttons */}
      {quickAccessModes.map((item) => {
        const Icon = item.icon;
        const isActive = activeMode === item.mode;
        const showBadge = item.mode === "my-notes" && noteCount > 0;
        const isModeDisabled = disabled || Boolean(disabledModes?.has(item.mode));

        return (
          <Button
            key={item.mode}
            variant="ghost"
            disabled={isModeDisabled}
            size="sm"
            onClick={() => handleModeChange(item.mode)}
            className={cn(
              "flex-1 flex-col h-11 gap-0.5 rounded-lg",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <div className="relative">
              <Icon className="h-4 w-4" />
              {showBadge && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-3 h-4 min-w-4 text-[10px] px-1"
                >
                  {noteCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Button>
        );
      })}

      {/* More modes sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            disabled={disabled}
            size="sm"
            className="flex-1 flex-col h-11 gap-0.5 rounded-lg"
          >
            <ChevronUp className="h-4 w-4" />
            <span className="text-[10px] font-medium">More</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
          <SheetTitle className="text-center mb-4">Learning Modes</SheetTitle>
          <div className="grid grid-cols-3 gap-3 p-4">
            {allModes.map((item) => {
              const Icon = item.icon;
              const isActive = activeMode === item.mode;
              const showBadge = item.mode === "my-notes" && noteCount > 0;
              const isModeDisabled = disabled || Boolean(disabledModes?.has(item.mode));

              return (
                <Button
                  key={item.mode}
                  variant="ghost"
                  disabled={isModeDisabled}
                  onClick={() => handleModeChange(item.mode)}
                  className={cn(
                    "flex-col h-20 gap-2 rounded-xl border",
                    isActive && "bg-primary/10 text-primary border-primary"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {showBadge && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-3 h-4 min-w-4 text-[10px] px-1"
                      >
                        {noteCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
