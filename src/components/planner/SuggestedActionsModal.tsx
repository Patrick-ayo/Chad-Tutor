import { CheckCircle2, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SuggestedAction } from "@/types/planner";

interface SuggestedActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: SuggestedAction[];
  sourceLabel?: string;
  onConfirmAction: (action: SuggestedAction) => void;
}

const actionLabels: Record<SuggestedAction["type"], string> = {
  "increase-budget": "Increase budget",
  "extend-deadline": "Extend deadline",
  "drop-low-priority": "Drop low priority",
};

export function SuggestedActionsModal({
  open,
  onOpenChange,
  actions,
  sourceLabel = "planner",
  onConfirmAction,
}: SuggestedActionsModalProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Suggested next steps
          </DialogTitle>
          <DialogDescription>
            The {sourceLabel} returned {actions.length} suggestion{actions.length > 1 ? "s" : ""} to help keep your plan stable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {actions.map((action) => (
            <Alert key={`${action.type}-${action.label}`} className="border-amber-200 bg-amber-50/70">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTitle className="m-0 text-sm font-semibold">{action.label}</AlertTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      {actionLabels[action.type]}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm text-muted-foreground">
                    {action.details}
                  </AlertDescription>
                  <div>
                    <Button size="sm" onClick={() => onConfirmAction(action)}>
                      Confirm
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
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