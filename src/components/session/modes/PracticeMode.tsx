import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Lightbulb, Trophy } from "lucide-react";

interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}

interface PracticeModeProps {
  topic: string;
  questions: PracticeQuestion[];
  onComplete?: (score: number) => void;
}

export function PracticeMode({ topic, questions, onComplete }: PracticeModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
    }
    setShowResult(true);
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round(((score + (selectedAnswer === question.correctAnswer ? 1 : 0)) / questions.length) * 100));
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const finalScore = Math.round((score / questions.length) * 100);
    return (
      <Card>
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle>Practice Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-5xl font-bold text-primary">{finalScore}%</div>
          <p className="text-muted-foreground">
            You got {score} out of {questions.length} questions correct
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{topic}</Badge>
            <Badge variant="secondary">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrectWrong = showResult;

            let buttonVariant: "default" | "outline" | "destructive" = "outline";
            let extraClasses = "";

            if (showCorrectWrong) {
              if (isCorrect) {
                buttonVariant = "default";
                extraClasses = "bg-green-500 hover:bg-green-500 text-white border-green-500";
              } else if (isSelected && !isCorrect) {
                buttonVariant = "destructive";
              }
            } else if (isSelected) {
              buttonVariant = "default";
            }

            return (
              <Button
                key={index}
                variant={buttonVariant}
                className={`w-full justify-start text-left h-auto py-3 px-4 ${extraClasses}`}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrectWrong && isCorrect && (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  {showCorrectWrong && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                </span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {question.hint && !showResult && !showHint && (
        <Button
          variant="ghost"
          className="w-full text-blue-600"
          onClick={() => setShowHint(true)}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Show Hint
        </Button>
      )}

      {showHint && !showResult && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-3">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {question.hint}
            </p>
          </CardContent>
        </Card>
      )}

      {showResult && (
        <Card className={selectedAnswer === question.correctAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              {selectedAnswer === question.correctAnswer ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${selectedAnswer === question.correctAnswer ? "text-green-700" : "text-red-700"}`}>
                  {selectedAnswer === question.correctAnswer ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQuestion < questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              "Finish Practice"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}