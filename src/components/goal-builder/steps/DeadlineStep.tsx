import type { GoalConstraints } from "@/types/goal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, CalendarIcon, AlertTriangle, Clock } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DeadlineStepProps {
  data: Partial<GoalConstraints>;
  estimatedHours: number;
  onUpdate: (data: Partial<GoalConstraints>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_DAILY_MINUTES = 180; // 3 hours - realistic cap

export function DeadlineStep({ data, estimatedHours, onUpdate, onNext, onBack }: DeadlineStepProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    data.targetDate ? new Date(data.targetDate) : undefined
  );
  const [daysPerWeek, setDaysPerWeek] = useState(data.daysPerWeek ?? 5);
  const [minutesPerDay, setMinutesPerDay] = useState(data.minutesPerDay ?? 60);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const today = new Date();
  const minDate = addDays(today, 7); // At least a week from now

  const feasibilityAnalysis = useMemo(() => {
    if (!targetDate) return null;

    const totalDays = differenceInDays(targetDate, today);
    const studyDays = Math.floor((totalDays / 7) * daysPerWeek);
    const totalAvailableMinutes = studyDays * minutesPerDay;
    const requiredMinutes = estimatedHours * 60;
    
    const feasibilityPercent = Math.round((totalAvailableMinutes / requiredMinutes) * 100);
    const shortfall = requiredMinutes - totalAvailableMinutes;
    const extraMinutesNeeded = shortfall > 0 ? Math.ceil(shortfall / studyDays) : 0;

    return {
      totalDays,
      studyDays,
      totalAvailableMinutes,
      requiredMinutes,
      feasibilityPercent,
      shortfall,
      extraMinutesNeeded,
      isFeasible: feasibilityPercent >= 100,
      isTight: feasibilityPercent >= 80 && feasibilityPercent < 100,
    };
  }, [targetDate, daysPerWeek, minutesPerDay, estimatedHours]);

  const handleMinutesChange = (value: number[]) => {
    const mins = value[0];
    if (mins > MAX_DAILY_MINUTES) {
      setShowTimeWarning(true);
    } else {
      setShowTimeWarning(false);
    }
    setMinutesPerDay(Math.min(mins, MAX_DAILY_MINUTES));
  };

  const handleNext = () => {
    if (targetDate) {
      onUpdate({
        targetDate: targetDate.toISOString(),
        daysPerWeek,
        minutesPerDay,
        startDate: today.toISOString(),
      });
      onNext();
    }
  };

  const canProceed = targetDate && daysPerWeek > 0 && minutesPerDay > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Set your timeline</h3>
        <p className="text-sm text-muted-foreground">
          Be realistic. We'll tell you if it's achievable.
        </p>
      </div>

      {/* Target Date */}
      <div className="space-y-3">
        <Label>Target Completion Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !targetDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {targetDate ? format(targetDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={targetDate}
              onSelect={setTargetDate}
              disabled={(date) => date < minDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {targetDate && feasibilityAnalysis && (
          <p className="text-xs text-muted-foreground">
            {feasibilityAnalysis.totalDays} days from today ({feasibilityAnalysis.studyDays} study days)
          </p>
        )}
      </div>

      {/* Days per Week */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Days per week</Label>
          <span className="text-sm font-medium">{daysPerWeek} days</span>
        </div>
        <Slider
          value={[daysPerWeek]}
          onValueChange={(v) => setDaysPerWeek(v[0])}
          min={1}
          max={7}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Light (1-2)</span>
          <span>Balanced (3-5)</span>
          <span>Intensive (6-7)</span>
        </div>
      </div>

      {/* Time per Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Time per day</Label>
          <span className="text-sm font-medium">
            {Math.floor(minutesPerDay / 60)}h {minutesPerDay % 60}m
          </span>
        </div>
        <Slider
          value={[minutesPerDay]}
          onValueChange={handleMinutesChange}
          min={15}
          max={240}
          step={15}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15m</span>
          <span>1h</span>
          <span>2h</span>
          <span>3h (max)</span>
        </div>
        
        {showTimeWarning && (
          <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs">
              Most people overestimate their daily capacity. 3+ hours daily is rarely sustainable.
              We've capped this at 3 hours.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Feasibility Analysis */}
      {targetDate && feasibilityAnalysis && (
        <Card className={cn(
          feasibilityAnalysis.isFeasible ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" :
          feasibilityAnalysis.isTight ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20" :
          "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Feasibility</span>
              <span className={cn(
                "font-bold",
                feasibilityAnalysis.isFeasible ? "text-green-600" :
                feasibilityAnalysis.isTight ? "text-yellow-600" : "text-red-600"
              )}>
                {feasibilityAnalysis.feasibilityPercent}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.round(feasibilityAnalysis.totalAvailableMinutes / 60)}h
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Required</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedHours}h
                </p>
              </div>
            </div>

            {!feasibilityAnalysis.isFeasible && (
              <p className="text-xs text-destructive">
                Need {feasibilityAnalysis.extraMinutesNeeded} more min/day, or extend deadline by{" "}
                {Math.ceil(feasibilityAnalysis.shortfall / minutesPerDay / (daysPerWeek / 7))} days
              </p>
            )}
            
            {feasibilityAnalysis.isTight && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Tight schedule. Consider adding buffer days.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
