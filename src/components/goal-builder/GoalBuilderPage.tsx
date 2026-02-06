import type {
  GoalDefinition,
  GoalConstraints,
  GoalAssessment,
  GoalPreferences,
  Roadmap,
} from "@/types/goal";
import { StepperWizard } from "./StepperWizard";
import { GoalTypeStep, ExamSelectionStep, DeadlineStep, AssessmentStep, PreferenceStep } from "./steps";
import { RoadmapPreview } from "./roadmap";
import { RoadmapControls } from "./RoadmapControls";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { goalOptions, generateMockRoadmap } from "@/data/mockGoals";
import { useState, useMemo, useCallback } from "react";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type PageView = "wizard" | "roadmap";

const WIZARD_STEPS_EXAM = [
  { id: 1, name: "Goal Type", description: "What are you learning?" },
  { id: 2, name: "Exam Details", description: "University & Subjects" },
  { id: 3, name: "Timeline", description: "When do you need it?" },
  { id: 4, name: "Assessment", description: "Where are you now?" },
  { id: 5, name: "Preferences", description: "How do you learn?" },
];

const WIZARD_STEPS_OTHER = [
  { id: 1, name: "Goal Type", description: "What are you learning?" },
  { id: 2, name: "Timeline", description: "When do you need it?" },
  { id: 3, name: "Assessment", description: "Where are you now?" },
  { id: 4, name: "Preferences", description: "How do you learn?" },
];

export function GoalBuilderPage() {
  // View state
  const [view, setView] = useState<PageView>("wizard");
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Form data
  const [definition, setDefinition] = useState<Partial<GoalDefinition>>({});
  const [constraints, setConstraints] = useState<Partial<GoalConstraints>>({});
  const [assessment, setAssessment] = useState<Partial<GoalAssessment>>({});
  const [preferences, setPreferences] = useState<Partial<GoalPreferences>>({});

  // Roadmap state
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Complete wizard and generate roadmap
  const handleComplete = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate mock roadmap
    const generatedRoadmap = generateMockRoadmap(definition.goalId!);
    setRoadmap(generatedRoadmap);
    setIsGenerating(false);
    setView("roadmap");
  }, [definition.goalId]);

  // Get selected goal info
  const selectedGoal = useMemo(() => {
    if (!definition.goalId) return null;
    return goalOptions.find((g) => g.id === definition.goalId) ?? null;
  }, [definition.goalId]);

  // Get wizard steps based on goal type
  const wizardSteps = useMemo(() => {
    return definition.type === "exam" ? WIZARD_STEPS_EXAM : WIZARD_STEPS_OTHER;
  }, [definition.type]);

  const maxStep = wizardSteps.length;

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < maxStep) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  }, [currentStep, maxStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((step: number) => {
    if (step < currentStep) {
      setCurrentStep(step as WizardStep);
    }
  }, [currentStep]);

  // Map physical step number to wizard step based on goal type
  const getStepComponent = useCallback(() => {
    const isExam = definition.type === "exam";

    if (currentStep === 1) {
      return (
        <GoalTypeStep
          data={definition}
          onUpdate={setDefinition}
          onNext={handleNext}
        />
      );
    }

    if (isExam) {
      // Exam flow: step 2 = ExamSelection, 3 = Deadline, 4 = Assessment, 5 = Preferences
      if (currentStep === 2) {
        return (
          <ExamSelectionStep
            data={definition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 3) {
        return (
          <DeadlineStep
            data={constraints}
            estimatedHours={0} // Exams don't have estimated hours
            onUpdate={setConstraints}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 4) {
        const examName = typeof definition.university === "string" 
          ? definition.university 
          : (definition.university?.name || "this exam");
        return (
          <AssessmentStep
            data={assessment}
            goalName={examName}
            onUpdate={setAssessment}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 5) {
        return (
          <PreferenceStep
            data={preferences}
            onUpdate={setPreferences}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      }
    } else {
      // Non-exam flow: step 2 = Deadline, 3 = Assessment, 4 = Preferences
      if (currentStep === 2) {
        return (
          <DeadlineStep
            data={constraints}
            estimatedHours={selectedGoal?.estimatedHours ?? 0}
            onUpdate={setConstraints}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 3) {
        return (
          <AssessmentStep
            data={assessment}
            goalName={selectedGoal?.name ?? "this topic"}
            onUpdate={setAssessment}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 4) {
        return (
          <PreferenceStep
            data={preferences}
            onUpdate={setPreferences}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      }
    }

    return null;
  }, [currentStep, definition, constraints, assessment, preferences, selectedGoal, handleNext, handleBack, handleComplete]);

  // Roadmap actions
  const handleTaskDefer = useCallback((taskId: string) => {
    console.log("Defer task:", taskId);
    setHasChanges(true);
    // In real app: update roadmap state
  }, []);

  const handleTaskSkip = useCallback((taskId: string) => {
    console.log("Skip task:", taskId);
    setHasChanges(true);
    // In real app: update roadmap state with warning
  }, []);

  const handleTaskLockToggle = useCallback((taskId: string) => {
    console.log("Toggle lock:", taskId);
    setHasChanges(true);
    // In real app: update task locked status
  }, []);

  const handleRegenerate = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const regeneratedRoadmap = generateMockRoadmap(definition.goalId!);
    setRoadmap(regeneratedRoadmap);
    setIsGenerating(false);
    setHasChanges(false);
  }, [definition.goalId]);

  const handleSave = useCallback(async () => {
    console.log("Saving goal and roadmap...");
    // In real app: POST to /goal/create and /roadmap/generate
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasChanges(false);
    alert("Goal saved successfully!");
  }, []);

  const handleBackToWizard = useCallback(() => {
    setView("wizard");
  }, []);

  // Generating state
  if (isGenerating && view === "wizard") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Generating Your Roadmap</h1>
            <p className="text-muted-foreground">
              Analyzing dependencies, calculating schedule, reserving revision slots...
            </p>
          </div>
          <Card>
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <div className="space-y-3 pt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {view === "wizard" ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Goal</h1>
            <p className="text-muted-foreground mt-1">
              Build a time-bound, dependency-aware execution plan.
            </p>
          </div>

          {/* Stepper */}
          <StepperWizard
            steps={wizardSteps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {getStepComponent()}
            </CardContent>
          </Card>
        </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedGoal?.name ?? "Goal"} Roadmap
              </h1>
              <p className="text-muted-foreground mt-1">
                Your personalized, dependency-aware learning path.
              </p>
            </div>

            {/* Roadmap Preview */}
            {roadmap && (
              <RoadmapPreview
                roadmap={roadmap}
                onTaskDefer={handleTaskDefer}
                onTaskSkip={handleTaskSkip}
                onTaskLockToggle={handleTaskLockToggle}
                isEditable={true}
              />
            )}

            {/* Controls */}
            <RoadmapControls
              hasChanges={hasChanges}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              onBack={handleBackToWizard}
              isRegenerating={isGenerating}
            />
          </div>
        )}
    </div>
  );
}
