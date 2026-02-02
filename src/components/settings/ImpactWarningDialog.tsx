import { AlertTriangle, RefreshCw, Calendar, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SettingImpact } from "@/types/settings";

interface ImpactWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  impacts: SettingImpact[];
  settingName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const impactDetails: Record<SettingImpact, { label: string; icon: React.ReactNode; description: string }> = {
  roadmap: {
    label: "Roadmap",
    icon: <RefreshCw className="h-4 w-4" />,
    description: "Your learning roadmap will be regenerated based on new constraints",
  },
  schedule: {
    label: "Schedule",
    icon: <Calendar className="h-4 w-4" />,
    description: "Your daily/weekly schedule will be recalculated",
  },
  analytics: {
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Analytics baselines will be reset for accurate comparison",
  },
  none: {
    label: "None",
    icon: null,
    description: "",
  },
};

export function ImpactWarningDialog({
  open,
  onOpenChange,
  impacts,
  settingName,
  onConfirm,
  onCancel,
}: ImpactWarningDialogProps) {
  const relevantImpacts = impacts.filter((i) => i !== "none");

  if (relevantImpacts.length === 0) {
    // No warning needed, auto-confirm
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            This Change Has Impact
          </DialogTitle>
          <DialogDescription>
            Changing <strong>{settingName}</strong> will trigger recalculations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <p className="text-sm font-medium text-gray-700">What will be affected:</p>
          <div className="space-y-2">
            {relevantImpacts.map((impact) => (
              <div
                key={impact}
                className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="p-1.5 bg-orange-100 rounded">
                  {impactDetails[impact].icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{impactDetails[impact].label}</p>
                  <p className="text-xs text-gray-600">{impactDetails[impact].description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
          <p className="font-medium mb-1">Why are we asking?</p>
          <p className="text-xs text-gray-600">
            Silent recalculations break trust. We always tell you when something
            will change so you can make an informed decision.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Proceed with Recalculation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
