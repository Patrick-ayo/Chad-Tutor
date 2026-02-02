import type { Alert as AlertType } from "@/types/dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, ArrowRight } from "lucide-react";

interface AlertsPanelProps {
  alerts: AlertType[];
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    variant: "default" as const,
    className: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
  },
  danger: {
    icon: AlertCircle,
    variant: "destructive" as const,
    className: "",
  },
  info: {
    icon: Info,
    variant: "default" as const,
    className: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20",
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  // Max 2 alerts as per design spec
  const displayedAlerts = alerts.slice(0, 2);

  if (displayedAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <Alert
            key={alert.id}
            variant={config.variant}
            className={config.className}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="font-medium">{alert.message}</AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
              <span className="text-sm">{alert.action}</span>
              {alert.actionLink && (
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  Take Action
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
