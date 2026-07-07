import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useScheduleStore } from "@/lib/scheduleStore";

interface ScheduleSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleSettingsModal({
  open,
  onOpenChange,
}: ScheduleSettingsModalProps) {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const { getToken } = useAuth();
  const { load } = useScheduleStore();

  const handleRebuild = async () => {
    try {
      setIsRebuilding(true);
      const token = await getToken();
      if (!token) throw new Error("No token");

      const res = await fetch(`/api/planner/rebuild-schedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to rebuild schedule");
      }

      const data = await res.json();

      alert(`Successfully rescheduled ${data.result.rescheduledCount} sessions based on your latest availability constraints.`);

      // Close modal and sync the newest schedule
      onOpenChange(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("An error occurred while rebuilding your schedule.");
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Schedule Settings
          </DialogTitle>
          <DialogDescription>
            Manage how your study sessions are mapped to your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-col space-y-4 rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Reschedule All Pending Sessions</p>
                <p className="text-xs text-muted-foreground">
                  If you recently changed your daily availability limits or active days, use this to completely rebuild your future timeline.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                  <AlertTriangle className="h-3 w-3" />
                  This will change the scheduled dates of all your uncompleted tasks.
                </div>
              </div>
            </div>
            <Button 
              variant="default" 
              onClick={handleRebuild} 
              disabled={isRebuilding}
              className="w-full"
            >
              {isRebuilding ? "Rebuilding Timeline..." : "Rebuild My Schedule"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
