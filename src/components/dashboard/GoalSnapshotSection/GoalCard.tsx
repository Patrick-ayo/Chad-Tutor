import type { Goal } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const deadlineDate = parseISO(goal.deadline);
  const daysUntilDeadline = differenceInDays(deadlineDate, new Date());
  const timeDeficit = goal.timeRequiredDays - goal.timeLeftDays;
  const isOnTrack = timeDeficit <= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{goal.name}</CardTitle>
          </div>
          <Badge variant={isOnTrack ? "default" : "destructive"}>
            {isOnTrack ? "On Track" : `${timeDeficit}d behind`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Readiness</span>
            <span className="font-semibold">{goal.readinessPercent}%</span>
          </div>
          <Progress value={goal.readinessPercent} className="h-2" />
        </div>

        {/* Time metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">
                {format(deadlineDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Time Left</p>
              <p className="font-medium">{daysUntilDeadline} days</p>
            </div>
          </div>
        </div>

        {/* Time reality check */}
        {!isOnTrack && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>
              Need {goal.timeRequiredDays} days, but only {goal.timeLeftDays} left
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
