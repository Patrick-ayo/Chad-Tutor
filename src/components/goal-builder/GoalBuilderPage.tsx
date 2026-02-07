import type {
  GoalDefinition,
  GoalConstraints,
  GoalAssessment,
  GoalPreferences,
  Roadmap,
} from "@/types/goal";
import { StepperWizard } from "./StepperWizard";
import { GoalTypeStep, ExamSelectionStep, TopicSelectionStep, VideoPreferencesStep, VideoResultsStep, DeadlineStep, AssessmentStep, PreferenceStep } from "./steps";
import { RoadmapPreview } from "./roadmap";
import { RoadmapControls } from "./RoadmapControls";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { goalOptions } from "@/data/mockGoals";
import { generateRoadmapFromSelection } from "@/utils/roadmapGenerator";
import { useState, useMemo, useCallback } from "react";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type PageView = "wizard" | "roadmap";

const WIZARD_STEPS_EXAM = [
  { id: 1, name: "Goal Type", description: "What are you learning?" },
  { id: 2, name: "Exam Details", description: "University & Subjects" },
  { id: 3, name: "Topics", description: "Select study topics" },
  { id: 4, name: "Video Prefs", description: "How you like videos?" },
  { id: 5, name: "Videos", description: "Select learning content" },
  { id: 6, name: "Timeline", description: "When do you need it?" },
  { id: 7, name: "Assessment", description: "Where are you now?" },
  { id: 8, name: "Preferences", description: "How do you learn?" },
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
  const [originalRoadmap, setOriginalRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Complete wizard and generate roadmap
  const handleComplete = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate personalized roadmap from actual selections
    const generatedRoadmap = generateRoadmapFromSelection(definition as GoalDefinition);
    setRoadmap(generatedRoadmap);
    setOriginalRoadmap(generatedRoadmap); // Store original for restore
    setIsGenerating(false);
    setView("roadmap");
  }, [definition]);

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
      // Exam flow: 2=ExamSelection, 3=Topics, 4=VideoPrefs, 5=Videos, 6=Timeline, 7=Assessment, 8=Preferences
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
          <TopicSelectionStep
            data={definition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 4) {
        return (
          <VideoPreferencesStep
            data={definition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 5) {
        return (
          <VideoResultsStep
            data={definition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 6) {
          // Calculate total study time from selected videos
          const totalVideoSeconds = Array.isArray(definition.videos)
            ? definition.videos.reduce((sum, video) => sum + (video.durationSeconds || 0), 0)
            : 0;
          const totalVideoHours = Math.round(totalVideoSeconds / 3600 * 10) / 10;
          return (
            <DeadlineStep
              data={constraints}
              estimatedHours={totalVideoHours}
              onUpdate={setConstraints}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
      }
      if (currentStep === 7) {
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
      if (currentStep === 8) {
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
    const regeneratedRoadmap = generateRoadmapFromSelection(definition as GoalDefinition);
    setRoadmap(regeneratedRoadmap);
    setOriginalRoadmap(regeneratedRoadmap); // Update original on regenerate
    setIsGenerating(false);
    setHasChanges(false);
  }, [definition]);

  const handleRestore = useCallback(() => {
    if (originalRoadmap) {
      setRoadmap(JSON.parse(JSON.stringify(originalRoadmap))); // Deep copy
      setHasChanges(false);
    }
  }, [originalRoadmap]);

  const handleTaskSchedule = useCallback((taskId: string, date: string | undefined) => {
    if (!roadmap) return;
    
    const updatedRoadmap = { ...roadmap };
    updatedRoadmap.phases = updatedRoadmap.phases.map(phase => ({
      ...phase,
      topics: phase.topics.map(topic => ({
        ...topic,
        tasks: topic.tasks.map(task => 
          task.id === taskId ? { ...task, scheduledDate: date } : task
        )
      }))
    }));
    
    setRoadmap(updatedRoadmap);
    setHasChanges(true);
  }, [roadmap]);

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
                onTaskSchedule={handleTaskSchedule}
                isEditable={true}
              />
            )}

            {/* Controls */}
            <RoadmapControls
              hasChanges={hasChanges}
              onRegenerate={handleRegenerate}
              onRestore={handleRestore}
              onSave={handleSave}
              onBack={handleBackToWizard}
              isRegenerating={isGenerating}
              hasOriginal={!!originalRoadmap}
            />
          </div>
        )}
    </div>
  );
}
