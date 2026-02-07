import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  Save,
  Lock,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

interface RoadmapControlsProps {
  hasChanges: boolean;
  onRegenerate: () => void;
  onRestore: () => void;
  onSave: () => void;
  onBack: () => void;
  isRegenerating?: boolean;
  isSaving?: boolean;
  hasOriginal?: boolean;
}

export function RoadmapControls({
  hasChanges,
  onRegenerate,
  onRestore,
  onSave,
  onBack,
  isRegenerating = false,
  isSaving = false,
  hasOriginal = false,
}: RoadmapControlsProps) {
  const [preserveCompleted, setPreserveCompleted] = useState(true);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleRegenerateClick = () => {
    if (!showRegenerateConfirm) {
      setShowRegenerateConfirm(true);
      return;
    }
    onRegenerate();
    setShowRegenerateConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Changes indicator */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You've made changes to the roadmap. Save to keep them, or they'll trigger a
            recalculation prompt.
          </AlertDescription>
        </Alert>
      )}

      {/* Regeneration Confirmation */}
      {showRegenerateConfirm && (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Regenerate Roadmap?</p>
            <p className="text-xs text-muted-foreground">
              This will recalculate your entire roadmap based on current progress and constraints.
            </p>
            
            <div className="flex items-center gap-2">
              <Switch
                id="preserve-completed"
                checked={preserveCompleted}
                onCheckedChange={setPreserveCompleted}
              />
              <Label htmlFor="preserve-completed" className="text-sm">
                Preserve completed tasks
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Confirm Regenerate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Back button */}
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Edit Goal
            </Button>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Restore Original */}
              {hasOriginal && hasChanges && (
                <Button
                  variant="outline"
                  onClick={onRestore}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore Original
                </Button>
              )}

              {/* Regenerate */}
              <Button
                variant="outline"
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>

              {/* Save */}
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Goal
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stability notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Lock className="h-3 w-3" />
        <span>Roadmap changes are explicit. No silent recalculations.</span>
      </div>
    </div>
  );
}
