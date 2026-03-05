import { useState } from "react";
import { 
  Play, 
  FileText, 
  Sparkles, 
  Code2, 
  Eye, 
  PenTool,
  TestTube,
  Bookmark,
  StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SessionMode } from "@/types/session";

interface SessionSidebarProps {
  activeMode: SessionMode;
  onModeChange: (mode: SessionMode) => void;
  completedModes: Set<SessionMode>;
  bookmarkCount: number;
  noteCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sidebarSections = [
  {
    title: "CONTENT",
    items: [
      { mode: "video" as SessionMode, label: "Video", icon: Play },
      { mode: "notes" as SessionMode, label: "Notes", icon: FileText },
      { mode: "ai-summary" as SessionMode, label: "AI Summary", icon: Sparkles },
    ]
  },
  {
    title: "UNDERSTAND", 
    items: [
      { mode: "examples" as SessionMode, label: "Examples", icon: Code2 },
      { mode: "visualizer" as SessionMode, label: "Visualizer", icon: Eye, disabled: true },
    ]
  },
  {
    title: "PRACTICE",
    items: [
      { mode: "practice" as SessionMode, label: "Practice Questions", icon: PenTool },
      { mode: "mini-test" as SessionMode, label: "Mini Test", icon: TestTube },
    ]
  },
  {
    title: "PERSONAL",
    items: [
      { mode: "bookmarks" as SessionMode, label: "Bookmarks", icon: Bookmark },
      { mode: "my-notes" as SessionMode, label: "My Notes", icon: StickyNote },
    ]
  }
];

export function SessionSidebar({ 
  activeMode, 
  onModeChange, 
  completedModes, 
  bookmarkCount, 
  noteCount,
  isCollapsed = false,
  onToggleCollapse 
}: SessionSidebarProps) {
  const [hoveredMode, setHoveredMode] = useState<SessionMode | null>(null);

  const getBadgeCount = (mode: SessionMode) => {
    if (mode === "bookmarks") return bookmarkCount;
    if (mode === "my-notes") return noteCount;
    return 0;
  };

  const isCompleted = (mode: SessionMode) => completedModes.has(mode);
  const isActive = (mode: SessionMode) => activeMode === mode;

  return (
    <div className={cn(
      "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200",
      isCollapsed ? "w-16" : "w-56"
    )}>
      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <nav className="py-3 space-y-4">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const badgeCount = getBadgeCount(item.mode);
                  const completed = isCompleted(item.mode);
                  const active = isActive(item.mode);
                  const hovered = hoveredMode === item.mode;

                  return (
                    <Button
                      key={item.mode}
                      variant="ghost"
                      disabled={item.disabled}
                      onClick={() => !item.disabled && onModeChange(item.mode)}
                      onMouseEnter={() => setHoveredMode(item.mode)}
                      onMouseLeave={() => setHoveredMode(null)}
                      className={cn(
                        "w-full justify-start h-10 px-3 relative group text-foreground hover:bg-accent",
                        active && "bg-primary/10 text-primary hover:bg-primary/10",
                        completed && !active && "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30",
                        item.disabled && "opacity-50 cursor-not-allowed",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-3 w-full",
                        isCollapsed && "justify-center"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-primary" : 
                          completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        )} />
                        
                        {!isCollapsed && (
                          <>
                            <span className="font-medium truncate">{item.label}</span>
                            
                            <div className="ml-auto flex items-center gap-1">
                              {badgeCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {badgeCount}
                                </Badge>
                              )}
                              {completed && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (hovered || active) && (
                        <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg whitespace-nowrap border border-border">
                          {item.label}
                          {badgeCount > 0 && ` (${badgeCount})`}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}