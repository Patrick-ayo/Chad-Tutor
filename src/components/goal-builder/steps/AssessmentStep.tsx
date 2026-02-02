import type { GoalAssessment } from "@/types/goal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AssessmentStepProps {
  data: Partial<GoalAssessment>;
  goalName: string;
  onUpdate: (data: Partial<GoalAssessment>) => void;
  onNext: () => void;
  onBack: () => void;
}

const selfRatingOptions = [
  { value: 1, label: "Complete Beginner", description: "Never touched this topic" },
  { value: 2, label: "Some Exposure", description: "Seen it, but can't apply it" },
  { value: 3, label: "Familiar", description: "Can solve basic problems" },
  { value: 4, label: "Competent", description: "Comfortable with most concepts" },
  { value: 5, label: "Advanced", description: "Just need polish" },
];

// Mock diagnostic questions for DSA
const diagnosticQuestions = [
  {
    id: "q1",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
  },
  {
    id: "q2",
    question: "Which data structure uses LIFO (Last In, First Out)?",
    options: ["Queue", "Stack", "Heap", "Tree"],
    correct: 1,
  },
  {
    id: "q3",
    question: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 2,
  },
  {
    id: "q4",
    question: "Which traversal visits the root before children?",
    options: ["Inorder", "Preorder", "Postorder", "Level-order"],
    correct: 1,
  },
  {
    id: "q5",
    question: "Hash table average lookup time is:",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
  },
];

export function AssessmentStep({ data, goalName, onUpdate, onNext, onBack }: AssessmentStepProps) {
  const [selfRating, setSelfRating] = useState<number | undefined>(data.selfRating);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);

  const diagnosticScore = useMemo(() => {
    if (!diagnosticComplete) return undefined;
    const correct = diagnosticQuestions.filter(
      (q) => answers[q.id] === q.correct
    ).length;
    return Math.round((correct / diagnosticQuestions.length) * 100);
  }, [answers, diagnosticComplete]);

  const confidenceMismatch = useMemo(() => {
    if (!selfRating || diagnosticScore === undefined) return false;
    // Map self-rating to expected score range
    const expectedRange = {
      1: [0, 20],
      2: [15, 40],
      3: [35, 60],
      4: [55, 80],
      5: [75, 100],
    };
    const [min, max] = expectedRange[selfRating as keyof typeof expectedRange];
    return diagnosticScore < min || diagnosticScore > max;
  }, [selfRating, diagnosticScore]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setDiagnosticComplete(true);
    }
  };

  const handleNext = () => {
    onUpdate({
      selfRating,
      diagnosticScore,
      confidenceMismatch,
    });
    onNext();
  };

  const canProceed = selfRating !== undefined;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Assess your current level</h3>
        <p className="text-sm text-muted-foreground">
          Honest assessment = accurate roadmap. We compare self-rating with a quick test.
        </p>
      </div>

      {/* Self Rating */}
      <div className="space-y-4">
        <Label>How confident are you with {goalName}?</Label>
        <RadioGroup
          value={selfRating?.toString()}
          onValueChange={(v) => setSelfRating(parseInt(v))}
          className="grid gap-3"
        >
          {selfRatingOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={`rating-${option.value}`}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                selfRating === option.value && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem value={option.value.toString()} id={`rating-${option.value}`} />
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i < option.value ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Diagnostic Test */}
      {selfRating !== undefined && !showDiagnostic && !diagnosticComplete && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quick Diagnostic (Optional but Recommended)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              5 quick questions to verify your level. This helps us create a more accurate plan.
            </p>
            <Button onClick={() => setShowDiagnostic(true)} variant="outline">
              Take Quick Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Questions */}
      {showDiagnostic && !diagnosticComplete && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Question {currentQuestion + 1} of {diagnosticQuestions.length}
              </CardTitle>
              <Progress
                value={((currentQuestion + 1) / diagnosticQuestions.length) * 100}
                className="w-24 h-2"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{diagnosticQuestions[currentQuestion].question}</p>
            <RadioGroup
              value={answers[diagnosticQuestions[currentQuestion].id]?.toString()}
              onValueChange={(v) =>
                handleAnswer(diagnosticQuestions[currentQuestion].id, parseInt(v))
              }
              className="grid gap-2"
            >
              {diagnosticQuestions[currentQuestion].options.map((option, i) => (
                <Label
                  key={i}
                  htmlFor={`opt-${i}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50",
                    answers[diagnosticQuestions[currentQuestion].id] === i && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
            <Button
              onClick={handleNextQuestion}
              disabled={answers[diagnosticQuestions[currentQuestion].id] === undefined}
              className="w-full"
            >
              {currentQuestion < diagnosticQuestions.length - 1 ? "Next Question" : "Finish"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      {diagnosticComplete && (
        <Card className={cn(
          confidenceMismatch
            ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20"
            : "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Diagnostic Score</span>
              <span className="text-2xl font-bold">{diagnosticScore}%</span>
            </div>
            
            {confidenceMismatch ? (
              <Alert className="border-yellow-500/50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Confidence Mismatch Detected</AlertTitle>
                <AlertDescription className="text-sm">
                  Your self-rating doesn't match the diagnostic. We'll use both to create a
                  more accurate roadmap with extra support in areas you might be overconfident about.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Your self-assessment aligns with the diagnostic</span>
              </div>
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
