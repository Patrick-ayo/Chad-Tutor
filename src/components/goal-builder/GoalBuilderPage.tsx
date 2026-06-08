import type {
  GoalDefinition,
  GoalConstraints,
  GoalAssessment,
  GoalPreferences,
  Topic,
  Roadmap,
} from "@/types/goal";
import type { DetailedRoadmap } from "@/types/planner";
import { StepperWizard } from "./StepperWizard";
import { GoalTypeStep, ExamSelectionStep, TopicSelectionStep, VideoPreferencesStep, VideoResultsStep, DeadlineStep, AssessmentStep, PreferenceStep } from "./steps";
import { RoadmapPreview } from "./roadmap";
import { RoadmapControls } from "./RoadmapControls";
import { DetailedRoadmapView } from "@/components/planner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { goalOptions } from "@/data/mockGoals";
import { roles } from "@/data/roles";
import { convertDetailedRoadmapToRoadmap, generateDetailedRoadmap } from "@/utils/roadmapGenerator";
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
  { id: 2, name: "Course & Library", description: "Free or paid, then choose the library" },
  { id: 3, name: "Videos", description: "Fetch YouTube content" },
  { id: 4, name: "Timeline", description: "When do you need it?" },
  { id: 5, name: "Assessment", description: "Where are you now?" },
  { id: 6, name: "Preferences", description: "How do you learn?" },
];

interface GoalBuilderPageProps {
  onSaveGoalSchedule?: (roadmap: Roadmap, startDate?: string) => void | Promise<void>;
}

export function GoalBuilderPage({ onSaveGoalSchedule }: GoalBuilderPageProps) {
  // View state
  const [view, setView] = useState<PageView>("wizard");
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Form data
  const [definition, setDefinition] = useState<Partial<GoalDefinition>>({});
  const [constraints, setConstraints] = useState<Partial<GoalConstraints>>({});
  const [assessment, setAssessment] = useState<Partial<GoalAssessment>>({});
  const [preferences, setPreferences] = useState<Partial<GoalPreferences>>({});

  // Roadmap state
  const [detailedRoadmap, setDetailedRoadmap] = useState<DetailedRoadmap | null>(null);
  const [originalDetailedRoadmap, setOriginalDetailedRoadmap] = useState<DetailedRoadmap | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [originalRoadmap, setOriginalRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const focusTopics = useMemo<Topic[]>(() => {
    if (definition.type === "exam") {
      return definition.topics || [];
    }

    if (definition.type === "skill") {
      return (definition.selectedSkills || []).map((selection, index) => ({
        id: selection.skillId,
        name: selection.name,
        subjectId: selection.skillId,
        module: "Skill Library",
        difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
        estimatedHours: selection.includeSubskills ? 14 : 8,
      }));
    }

    if (definition.type === "role") {
      return (definition.selectedRoles || []).map((roleId, index) => {
        const role = roles.find((item) => item.id === roleId);
        return {
          id: roleId,
          name: role?.name || roleId,
          subjectId: roleId,
          module: "Role Library",
          difficulty: index % 3 === 0 ? "medium" : "hard",
          estimatedHours: 20,
        };
      });
    }

    return [];
  }, [definition.type, definition.topics, definition.selectedSkills, definition.selectedRoles]);

  const planningDefinition = useMemo<Partial<GoalDefinition>>(() => ({
    ...definition,
    topics: focusTopics,
  }), [definition, focusTopics]);

  const selectedVideoHours = useMemo(() => {
    if (!Array.isArray(planningDefinition.videos)) {
      return 0;
    }

    const totalSeconds = planningDefinition.videos.reduce((sum, video) => sum + (video.durationSeconds || 0), 0);
    return Math.round((totalSeconds / 3600) * 10) / 10;
  }, [planningDefinition.videos]);

  // Complete wizard and generate roadmap
  const handleComplete = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generatedDetailedRoadmap = await generateDetailedRoadmap(planningDefinition as GoalDefinition);
      const generatedRoadmap = convertDetailedRoadmapToRoadmap(generatedDetailedRoadmap);

      setDetailedRoadmap(generatedDetailedRoadmap);
      setOriginalDetailedRoadmap(JSON.parse(JSON.stringify(generatedDetailedRoadmap)) as DetailedRoadmap);
      setRoadmap(generatedRoadmap);
      setOriginalRoadmap(JSON.parse(JSON.stringify(generatedRoadmap)) as Roadmap);
      setView("roadmap");
    } finally {
      setIsGenerating(false);
    }
  }, [planningDefinition]);

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
            data={planningDefinition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 5) {
        return (
          <VideoResultsStep
            data={planningDefinition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 6) {
          return (
            <DeadlineStep
              data={constraints}
              estimatedHours={selectedVideoHours || 0}
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
      // Skill/role flow: 2=VideoPrefs, 3=Videos, 4=Timeline, 5=Assessment, 6=Preferences
      if (currentStep === 2) {
        return (
          <VideoPreferencesStep
            data={planningDefinition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 3) {
        return (
          <VideoResultsStep
            data={planningDefinition}
            onUpdate={setDefinition}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 4) {
        return (
          <DeadlineStep
            data={constraints}
            estimatedHours={selectedVideoHours > 0 ? selectedVideoHours : (selectedGoal?.estimatedHours ?? 0)}
            onUpdate={setConstraints}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 5) {
        return (
          <AssessmentStep
            data={assessment}
            goalName={selectedGoal?.name ?? definition.customName ?? planningDefinition.topics?.[0]?.name ?? "this topic"}
            onUpdate={setAssessment}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      if (currentStep === 6) {
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
  }, [currentStep, definition, planningDefinition, constraints, assessment, preferences, selectedGoal, selectedVideoHours, handleNext, handleBack, handleComplete]);

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
    try {
      const regeneratedDetailedRoadmap = await generateDetailedRoadmap(planningDefinition as GoalDefinition);
      const regeneratedRoadmap = convertDetailedRoadmapToRoadmap(regeneratedDetailedRoadmap);

      setDetailedRoadmap(regeneratedDetailedRoadmap);
      setOriginalDetailedRoadmap(JSON.parse(JSON.stringify(regeneratedDetailedRoadmap)) as DetailedRoadmap);
      setRoadmap(regeneratedRoadmap);
      setOriginalRoadmap(JSON.parse(JSON.stringify(regeneratedRoadmap)) as Roadmap);
      setHasChanges(false);
    } finally {
      setIsGenerating(false);
    }
  }, [planningDefinition]);

  const handleRestore = useCallback(() => {
    if (originalDetailedRoadmap && originalRoadmap) {
      setDetailedRoadmap(JSON.parse(JSON.stringify(originalDetailedRoadmap)) as DetailedRoadmap);
      setRoadmap(JSON.parse(JSON.stringify(originalRoadmap))); // Deep copy
      setHasChanges(false);
    }
  }, [originalDetailedRoadmap, originalRoadmap]);

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
    const roadmapToSave = detailedRoadmap
      ? convertDetailedRoadmapToRoadmap(detailedRoadmap)
      : roadmap;

    if (!roadmapToSave) {
      return;
    }

    console.log("Saving goal and roadmap...");
    // Session-only save for development: no backend persistence.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await onSaveGoalSchedule?.(roadmapToSave);
    setHasChanges(false);
    alert("Goal saved for this session. Check Schedule tab.");
  }, [detailedRoadmap, onSaveGoalSchedule, roadmap]);

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
                {selectedGoal?.name ?? definition.customName ?? "Goal"} Roadmap
              </h1>
              <p className="text-muted-foreground mt-1">
                Your personalized, dependency-aware learning path.
              </p>
            </div>

              {/* Roadmap Preview */}
              {detailedRoadmap ? (
                <DetailedRoadmapView roadmap={detailedRoadmap} />
              ) : roadmap ? (
              <RoadmapPreview
                roadmap={roadmap}
                onTaskDefer={handleTaskDefer}
                onTaskSkip={handleTaskSkip}
                onTaskLockToggle={handleTaskLockToggle}
                onTaskSchedule={handleTaskSchedule}
                isEditable={true}
              />
              ) : null}

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
