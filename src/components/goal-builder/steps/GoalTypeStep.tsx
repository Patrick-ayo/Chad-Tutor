import type { GoalDefinition, GoalType, GoalOption } from "@/types/goal";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { goalOptions } from "@/data/mockGoals";
import { GraduationCap, Sparkles, Briefcase, ArrowRight, Clock } from "lucide-react";
import { useMemo, useState } from "react";

interface GoalTypeStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
}

const goalTypeConfig: Record<GoalType, { icon: typeof GraduationCap; label: string; description: string }> = {
  exam: {
    icon: GraduationCap,
    label: "Exam",
    description: "Prepare for a specific test or certification",
  },
  skill: {
    icon: Sparkles,
    label: "Skill",
    description: "Master a specific technology or concept",
  },
  role: {
    icon: Briefcase,
    label: "Role",
    description: "Prepare for a job role (combines multiple skills)",
  },
};

export function GoalTypeStep({ data, onUpdate, onNext }: GoalTypeStepProps) {
  const [selectedType, setSelectedType] = useState<GoalType | undefined>(data.type);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(data.goalId);

  const filteredGoals = useMemo(() => {
    if (!selectedType) return [];
    return goalOptions.filter((g) => g.type === selectedType);
  }, [selectedType]);

  const groupedGoals = useMemo(() => {
    const groups: Record<string, GoalOption[]> = {};
    filteredGoals.forEach((goal) => {
      if (!groups[goal.category]) {
        groups[goal.category] = [];
      }
      groups[goal.category].push(goal);
    });
    return groups;
  }, [filteredGoals]);

  const handleTypeChange = (type: GoalType) => {
    setSelectedType(type);
    setSelectedGoalId(undefined);
    onUpdate({ type, goalId: undefined });
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId);
    onUpdate({ ...data, type: selectedType, goalId });
  };

  const canProceed = selectedType && selectedGoalId;

  return (
    <div className="space-y-6">
      {/* Step 1: Select Goal Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">What are you working towards?</h3>
          <p className="text-sm text-muted-foreground">
            Select the type of goal you want to achieve
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.entries(goalTypeConfig) as [GoalType, typeof goalTypeConfig.exam][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              const isSelected = selectedType === type;

              return (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div
                      className={`rounded-full p-3 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mt-3 font-semibold">{config.label}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Step 2: Select Specific Goal */}
      {selectedType && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Choose your goal</h3>
            <p className="text-sm text-muted-foreground">
              Select from predefined goals for accurate planning
            </p>
          </div>

          <RadioGroup value={selectedGoalId} onValueChange={handleGoalSelect}>
            {Object.entries(groupedGoals).map(([category, goals]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <Label
                      key={goal.id}
                      htmlFor={goal.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
                        selectedGoalId === goal.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={goal.id} id={goal.id} className="mt-1" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-tight">{goal.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>~{goal.estimatedHours} hours</span>
                        </div>
                        {goal.skillIds && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {goal.skillIds.slice(0, 2).map((skillId) => {
                              const skill = goalOptions.find((g) => g.id === skillId);
                              return skill ? (
                                <Badge key={skillId} variant="secondary" className="text-xs">
                                  {skill.name}
                                </Badge>
                              ) : null;
                            })}
                            {goal.skillIds.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{goal.skillIds.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
