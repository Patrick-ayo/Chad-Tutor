import { useState } from "react";
import { Shield, Download, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PrivacyActions } from "@/types/settings";
import { format } from "date-fns";

interface PrivacySectionProps {
  privacy: PrivacyActions;
  onExportData: () => void;
  onResetProgress: () => void;
  onDeleteAccount: () => void;
}

export function PrivacySection({
  privacy,
  onExportData,
  onResetProgress,
  onDeleteAccount,
}: PrivacySectionProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleResetProgress = () => {
    onResetProgress();
    setShowResetDialog(false);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "DELETE") {
      onDeleteAccount();
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Your data, your control. Export, reset, or delete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Your Data
              </p>
              <p className="text-xs text-gray-500">
                Download all your learning data as JSON
              </p>
              {privacy.lastExportDate && (
                <p className="text-xs text-gray-400">
                  Last exported: {format(new Date(privacy.lastExportDate), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onExportData}>
              Export
            </Button>
          </div>

          {/* Data Retention */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Data Retention</p>
              <p className="text-xs text-gray-500">
                How long we keep your detailed session logs
              </p>
            </div>
            <Badge variant="outline">{privacy.dataRetentionDays} days</Badge>
          </div>

          {/* Reset Progress */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2 text-orange-700">
                <RotateCcw className="h-4 w-4" />
                Reset All Progress
              </p>
              <p className="text-xs text-gray-500">
                Clear all learning progress but keep settings
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
              onClick={() => setShowResetDialog(true)}
            >
              Reset
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2 text-red-700">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Progress Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Reset All Progress?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 my-4">
            <li>All completed sessions and practice history</li>
            <li>All analytics and progress data</li>
            <li>All goal completion status</li>
            <li>All roadmap progress</li>
          </ul>
          <p className="text-sm text-gray-600">
            Your settings, goals, and account will remain. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleResetProgress}
            >
              Reset Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and ALL associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <Label className="text-sm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
