import { useState } from "react";
import {
  FileText,
  ArrowRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScheduleChange } from "@/types/planner";
import { format } from "date-fns";

interface ChangeSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: ScheduleChange[];
  onConfirm: () => void;
  onReject: () => void;
}

function ChangeCard({ change }: { change: ScheduleChange }) {
  const typeStyles = {
    "task-moved": "bg-blue-50 border-blue-200",
    "task-added": "bg-green-50 border-green-200",
    "task-removed": "bg-red-50 border-red-200",
    "buffer-used": "bg-yellow-50 border-yellow-200",
    "deadline-adjusted": "bg-purple-50 border-purple-200",
  };

  const typeBadges = {
    "task-moved": { label: "Moved", color: "bg-blue-100 text-blue-800" },
    "task-added": { label: "Added", color: "bg-green-100 text-green-800" },
    "task-removed": { label: "Removed", color: "bg-red-100 text-red-800" },
    "buffer-used": { label: "Buffer Used", color: "bg-yellow-100 text-yellow-800" },
    "deadline-adjusted": { label: "Deadline", color: "bg-purple-100 text-purple-800" },
  };

  const typeIcons = {
    "task-moved": <ArrowRight className="h-4 w-4" />,
    "task-added": <CheckCircle className="h-4 w-4" />,
    "task-removed": <X className="h-4 w-4" />,
    "buffer-used": <Calendar className="h-4 w-4" />,
    "deadline-adjusted": <Clock className="h-4 w-4" />,
  };

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[change.type]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {typeIcons[change.type]}
          <span className="font-medium">{change.taskTitle}</span>
        </div>
        <Badge className={typeBadges[change.type].color}>
          {typeBadges[change.type].label}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mb-3">{change.reason}</p>

      {/* Before/After */}
      {(change.previousDate || change.newDate) && (
        <div className="flex items-center gap-3 text-sm">
          {change.previousDate && (
            <span className="text-gray-500 line-through">
              {format(new Date(change.previousDate), "MMM d")}
            </span>
          )}
          {change.previousDate && change.newDate && (
            <ArrowRight className="h-4 w-4 text-gray-400" />
          )}
          {change.newDate && (
            <span className="font-medium">
              {format(new Date(change.newDate), "MMM d, yyyy")}
            </span>
          )}
        </div>
      )}

      {/* Impact */}
      {change.impact && (
        <div className="mt-2 pt-2 border-t border-dashed flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-500">{change.impact}</span>
        </div>
      )}
    </div>
  );
}

export function ChangeSummaryModal({
  open,
  onOpenChange,
  changes,
  onConfirm,
  onReject,
}: ChangeSummaryModalProps) {
  const [activeTab, setActiveTab] = useState("all");

  const groupedChanges = {
    all: changes,
    moved: changes.filter((c) => c.type === "task-moved"),
    added: changes.filter((c) => c.type === "task-added"),
    removed: changes.filter((c) => c.type === "task-removed"),
    buffer: changes.filter((c) => c.type === "buffer-used"),
    deadline: changes.filter((c) => c.type === "deadline-adjusted"),
  };

  const getCounts = () => {
    const counts: string[] = [];
    if (groupedChanges.moved.length > 0)
      counts.push(`${groupedChanges.moved.length} moved`);
    if (groupedChanges.added.length > 0)
      counts.push(`${groupedChanges.added.length} added`);
    if (groupedChanges.removed.length > 0)
      counts.push(`${groupedChanges.removed.length} removed`);
    if (groupedChanges.buffer.length > 0)
      counts.push(`${groupedChanges.buffer.length} buffers used`);
    if (groupedChanges.deadline.length > 0)
      counts.push(`${groupedChanges.deadline.length} deadlines adjusted`);
    return counts.join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Schedule Changes Summary
          </DialogTitle>
          <DialogDescription>
            {changes.length} changes proposed: {getCounts()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">
              All ({changes.length})
            </TabsTrigger>
            {groupedChanges.moved.length > 0 && (
              <TabsTrigger value="moved">
                Moved ({groupedChanges.moved.length})
              </TabsTrigger>
            )}
            {groupedChanges.added.length > 0 && (
              <TabsTrigger value="added">
                Added ({groupedChanges.added.length})
              </TabsTrigger>
            )}
            {groupedChanges.removed.length > 0 && (
              <TabsTrigger value="removed">
                Removed ({groupedChanges.removed.length})
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="all" className="space-y-3 m-0">
              {groupedChanges.all.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </TabsContent>
            <TabsContent value="moved" className="space-y-3 m-0">
              {groupedChanges.moved.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </TabsContent>
            <TabsContent value="added" className="space-y-3 m-0">
              {groupedChanges.added.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </TabsContent>
            <TabsContent value="removed" className="space-y-3 m-0">
              {groupedChanges.removed.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Transparency Note */}
        <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-600">
          <p className="font-medium mb-1">Why are we showing this?</p>
          <p className="text-xs">
            Every schedule change is logged and explained. We never silently
            modify your plan. You have full control to accept, reject, or
            customize these changes.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReject}>
            Reject All
          </Button>
          <Button onClick={onConfirm}>Apply {changes.length} Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
