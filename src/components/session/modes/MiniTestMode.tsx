import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, AlertTriangle, Trophy, RotateCcw } from "lucide-react";

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MiniTestModeProps {
  topic: string;
  questions: TestQuestion[];
  timeLimit?: number;
  passingScore?: number;
  onComplete?: (score: number, passed: boolean) => void;
}

export function MiniTestMode({
  topic,
  questions,
  timeLimit = 300,
  passingScore = 70,
  onComplete
}: MiniTestModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [testState, setTestState] = useState<"intro" | "active" | "review" | "completed">("intro");
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (testState !== "active") return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestState("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const score = calculateScore();
      const passed = score >= passingScore;
      onComplete?.(score, passed);
      setTestState("completed");
    }
  };

  const calculateScore = () => {
    const correct = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    return Math.round((correct / questions.length) * 100);
  };

  const startTest = () => {
    setTestState("active");
    setTimeRemaining(timeLimit);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setTimeRemaining(timeLimit);
    setTestState("intro");
    setShowExplanation(false);
  };

  if (testState === "intro") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Mini Assessment: {topic}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">Test your understanding with this quick assessment</p>
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {Math.floor(timeLimit / 60)} minutes
              </Badge>
              <Badge variant="outline">{questions.length} questions</Badge>
              <Badge variant="outline">Pass: {passingScore}%</Badge>
            </div>
          </div>
          <Button onClick={startTest} size="lg" className="bg-green-600 hover:bg-green-700">
            Start Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (testState === "completed") {
    const score = calculateScore();
    const passed = score >= passingScore;
    const correct = answers.filter((answer, idx) => answer === questions[idx].correctAnswer).length;

    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {passed ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            )}
            Test Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`text-6xl font-bold ${passed ? "text-green-500 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400"}`}>
            {score}%
          </div>
          <Badge className={passed ? "bg-green-500" : "bg-yellow-500"} variant="default">
            {passed ? "PASSED" : "NEEDS REVIEW"}
          </Badge>
          <div className="text-gray-600">
            You answered {correct} out of {questions.length} questions correctly
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={restartTest}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => setTestState("review")}>
              Review Answers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (testState === "review") {
    const score = calculateScore();
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
            <p className="text-sm text-gray-600">Your score: {score}%</p>
          </CardHeader>
        </Card>
        {questions.map((q, idx) => {
          const isCorrect = answers[idx] === q.correctAnswer;
          return (
            <Card key={q.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium mb-2">{q.question}</p>
                    <p className="text-sm text-gray-600">
                      Your answer: {answers[idx] !== null ? q.options[answers[idx]] : "Not answered"}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2 italic">{q.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <div className="flex justify-center">
          <Button onClick={restartTest}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Question {currentQuestion + 1} of {questions.length}
        </Badge>
        <Badge variant={timeRemaining < 60 ? "destructive" : "outline"} className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(timeRemaining)}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = answers[currentQuestion] === idx;
            const isCorrect = idx === question.correctAnswer;
            const showResult = showExplanation && isSelected;

            return (
              <Button
                key={idx}
                variant={isSelected ? (showExplanation ? (isCorrect ? "default" : "destructive") : "default") : "outline"}
                className={`w-full justify-start text-left h-auto py-3 px-4 ${
                  showExplanation && isCorrect ? "bg-green-500 hover:bg-green-500 text-white" : ""
                }`}
                onClick={() => !showExplanation && handleAnswer(idx)}
                disabled={showExplanation}
              >
                <span className="mr-3 font-medium">{String.fromCharCode(65 + idx)}.</span>
                {option}
                {showExplanation && isCorrect && <CheckCircle className="ml-auto h-5 w-5" />}
                {showResult && !isCorrect && <XCircle className="ml-auto h-5 w-5" />}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {showExplanation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </CardContent>
        </Card>
      )}

      {showExplanation && (
        <div className="flex justify-end">
          <Button onClick={nextQuestion}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Test"}
          </Button>
        </div>
      )}
    </div>
  );
}