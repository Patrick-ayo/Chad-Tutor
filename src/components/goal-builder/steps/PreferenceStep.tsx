import type { GoalPreferences, PaceStyle, FocusStrategy } from "@/types/goal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, Zap, Scale, Leaf, Target, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PreferenceStepProps {
  data: Partial<GoalPreferences>;
  onUpdate: (data: Partial<GoalPreferences>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const paceOptions: { value: PaceStyle; icon: typeof Zap; label: string; description: string; traits: string[] }[] = [
  {
    value: "aggressive",
    icon: Zap,
    label: "Aggressive",
    description: "Maximum pace with minimal breaks",
    traits: ["Shorter deadlines", "Intense daily sessions", "Fewer buffer days"],
  },
  {
    value: "balanced",
    icon: Scale,
    label: "Balanced",
    description: "Sustainable pace with room to breathe",
    traits: ["Reasonable daily load", "Regular breaks", "Built-in buffer"],
  },
  {
    value: "light",
    icon: Leaf,
    label: "Light",
    description: "Gentle pace for busy schedules",
    traits: ["Shorter sessions", "More spread out", "Extra revision time"],
  },
];

const focusOptions: { value: FocusStrategy; icon: typeof Target; label: string; description: string }[] = [
  {
    value: "weakness-first",
    icon: Target,
    label: "Weakness First",
    description: "Prioritize your weak areas early. Harder initially but more effective.",
  },
  {
    value: "coverage-first",
    icon: Layers,
    label: "Coverage First",
    description: "Cover all topics evenly before deep diving. Good for building context.",
  },
];

export function PreferenceStep({ data, onUpdate, onComplete, onBack }: PreferenceStepProps) {
  const [paceStyle, setPaceStyle] = useState<PaceStyle | undefined>(data.paceStyle);
  const [focusStrategy, setFocusStrategy] = useState<FocusStrategy | undefined>(data.focusStrategy);

  const handleComplete = () => {
    if (paceStyle && focusStrategy) {
      onUpdate({ paceStyle, focusStrategy });
      onComplete();
    }
  };

  const canProceed = paceStyle && focusStrategy;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Customize your approach</h3>
        <p className="text-sm text-muted-foreground">
          These preferences shape how your roadmap is generated
        </p>
      </div>

      {/* Pace Style */}
      <div className="space-y-4">
        <Label>Learning Pace</Label>
        <RadioGroup
          value={paceStyle}
          onValueChange={(v) => setPaceStyle(v as PaceStyle)}
          className="grid gap-4 sm:grid-cols-3"
        >
          {paceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = paceStyle === option.value;

            return (
              <Label
                key={option.value}
                htmlFor={`pace-${option.value}`}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`pace-${option.value}`}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                    <ul className="space-y-1">
                      {option.traits.map((trait) => (
                        <li key={trait} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Focus Strategy */}
      <div className="space-y-4">
        <Label>Focus Strategy</Label>
        <RadioGroup
          value={focusStrategy}
          onValueChange={(v) => setFocusStrategy(v as FocusStrategy)}
          className="grid gap-4 sm:grid-cols-2"
        >
          {focusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = focusStrategy === option.value;

            return (
              <Label
                key={option.value}
                htmlFor={`focus-${option.value}`}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`focus-${option.value}`}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Summary Preview */}
      {paceStyle && focusStrategy && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">Your approach: </span>
              <span className="text-muted-foreground">
                {paceStyle === "aggressive" && "Fast-paced learning"}
                {paceStyle === "balanced" && "Steady, sustainable progress"}
                {paceStyle === "light" && "Gentle, flexible schedule"}
                {" with "}
                {focusStrategy === "weakness-first" && "priority on weak areas"}
                {focusStrategy === "coverage-first" && "broad topic coverage first"}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleComplete} disabled={!canProceed} className="gap-2">
          Generate Roadmap
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
