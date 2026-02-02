import { useState } from "react";
import { CheckCircle2, AlertTriangle, Ban, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { EndSessionData, TaskCompletionStatus } from "@/types/session";

interface EndSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: EndSessionData) => void;
  taskName: string;
  questionsCorrect: number;
  questionsTotal: number;
  timeSpentMinutes: number;
}

const completionOptions: {
  value: TaskCompletionStatus;
  icon: typeof CheckCircle2;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "completed",
    icon: CheckCircle2,
    label: "Completed",
    description: "I finished all the learning material and practice",
    color: "border-green-500 bg-green-50 text-green-700",
  },
  {
    value: "partial",
    icon: AlertTriangle,
    label: "Partial",
    description: "I made progress but didn't finish everything",
    color: "border-yellow-500 bg-yellow-50 text-yellow-700",
  },
  {
    value: "blocked",
    icon: Ban,
    label: "Blocked",
    description: "I couldn't continue due to an issue",
    color: "border-red-500 bg-red-50 text-red-700",
  },
];

export function EndSessionDialog({
  isOpen,
  onClose,
  onConfirm,
  taskName,
  questionsCorrect,
  questionsTotal,
  timeSpentMinutes,
}: EndSessionDialogProps) {
  const [completionStatus, setCompletionStatus] = useState<TaskCompletionStatus | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number>(0);
  const [blockerReason, setBlockerReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (!completionStatus || confidenceRating === 0) return;

    onConfirm({
      completionStatus,
      confidenceRating,
      blockerReason: completionStatus === "blocked" ? blockerReason : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const canSubmit = completionStatus !== null && confidenceRating > 0 &&
    (completionStatus !== "blocked" || blockerReason.trim().length > 0);

  const accuracyPercent = questionsTotal > 0 
    ? Math.round((questionsCorrect / questionsTotal) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>End Learning Session</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your learning before ending
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">{taskName}</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {timeSpentMinutes}
                </p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {questionsCorrect}/{questionsTotal}
                </p>
                <p className="text-xs text-gray-500">correct</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${
                  accuracyPercent >= 80 ? "text-green-600" :
                  accuracyPercent >= 60 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {accuracyPercent}%
                </p>
                <p className="text-xs text-gray-500">accuracy</p>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div>
            <Label className="text-sm font-medium">Did you finish?</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {completionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCompletionStatus(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    completionStatus === option.value
                      ? option.color + " border-2"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option.icon className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
            {completionStatus && (
              <p className="text-xs text-gray-500 mt-2">
                {completionOptions.find((o) => o.value === completionStatus)?.description}
              </p>
            )}
          </div>

          {/* Blocker Reason (if blocked) */}
          {completionStatus === "blocked" && (
            <div>
              <Label htmlFor="blocker">What blocked you?</Label>
              <Input
                id="blocker"
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                placeholder="e.g., Need prerequisite knowledge, confusing content..."
                className="mt-1"
              />
            </div>
          )}

          {/* Confidence Rating */}
          <div>
            <Label className="text-sm font-medium">
              How confident are you with this material?
            </Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setConfidenceRating(rating)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    confidenceRating === rating
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Star
                      className={`h-5 w-5 ${
                        confidenceRating >= rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                    <span className="text-xs text-gray-600">{rating}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <Label htmlFor="notes">Any notes for yourself? (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Things to review later, aha moments..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Continue Session
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            End Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
