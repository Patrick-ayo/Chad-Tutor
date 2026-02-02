import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { Question, AnswerSubmission } from "@/types/session";

interface PracticeSectionProps {
  questions: Question[];
  answers: AnswerSubmission[];
  onAnswerSubmit: (
    questionId: string,
    answer: string | number,
    isCorrect: boolean,
    timeSpent: number,
    attempts: number
  ) => void;
  onRequestHelp: (questionId: string, questionText: string) => void;
}

interface QuestionState {
  selectedAnswer: string | number | null;
  showResult: boolean;
  attempts: number;
  startTime: number;
}

export function PracticeSection({
  questions,
  answers,
  onAnswerSubmit,
  onRequestHelp,
}: PracticeSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<
    Record<string, QuestionState>
  >({});

  const currentQuestion = questions[currentIndex];
  const answeredQuestions = answers.map((a) => a.questionId);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  const getQuestionState = (questionId: string): QuestionState => {
    return (
      questionStates[questionId] || {
        selectedAnswer: null,
        showResult: false,
        attempts: 0,
        startTime: Date.now(),
      }
    );
  };

  const updateQuestionState = (
    questionId: string,
    updates: Partial<QuestionState>
  ) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...getQuestionState(questionId),
        ...updates,
      },
    }));
  };

  const handleSelectAnswer = (answer: string | number) => {
    if (!currentQuestion) return;
    const state = getQuestionState(currentQuestion.id);
    if (state.showResult) return; // Already answered

    updateQuestionState(currentQuestion.id, {
      selectedAnswer: answer,
      startTime: state.startTime || Date.now(),
    });
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    const state = getQuestionState(currentQuestion.id);
    if (state.selectedAnswer === null) return;

    const isCorrect =
      state.selectedAnswer === currentQuestion.correctAnswer ||
      (typeof currentQuestion.correctAnswer === "string" &&
        typeof state.selectedAnswer === "string" &&
        state.selectedAnswer.toLowerCase().trim() ===
          currentQuestion.correctAnswer.toLowerCase().trim());

    const timeSpent = Math.round((Date.now() - state.startTime) / 1000);
    const attempts = state.attempts + 1;

    updateQuestionState(currentQuestion.id, {
      showResult: true,
      attempts,
    });

    onAnswerSubmit(
      currentQuestion.id,
      state.selectedAnswer,
      isCorrect,
      timeSpent,
      attempts
    );
  };

  const handleRetry = () => {
    if (!currentQuestion) return;
    const state = getQuestionState(currentQuestion.id);
    updateQuestionState(currentQuestion.id, {
      selectedAnswer: null,
      showResult: false,
      attempts: state.attempts,
      startTime: Date.now(),
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderMCQ = (question: Question, state: QuestionState) => {
    const previousAnswer = answers.find((a) => a.questionId === question.id);

    return (
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = state.selectedAnswer === index;
          const isCorrect = question.correctAnswer === index;
          const showResult = state.showResult || previousAnswer;

          let optionClass =
            "p-3 border rounded-lg cursor-pointer transition-all ";

          if (showResult) {
            if (isCorrect) {
              optionClass += "border-green-500 bg-green-50";
            } else if (isSelected && !isCorrect) {
              optionClass += "border-red-500 bg-red-50";
            } else {
              optionClass += "border-gray-200 bg-gray-50 opacity-60";
            }
          } else if (isSelected) {
            optionClass += "border-blue-500 bg-blue-50";
          } else {
            optionClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          }

          return (
            <div
              key={index}
              className={optionClass}
              onClick={() => !showResult && handleSelectAnswer(index)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    isSelected
                      ? showResult
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderShortAnswer = (question: Question, state: QuestionState) => {
    const previousAnswer = answers.find((a) => a.questionId === question.id);
    const showResult = state.showResult || previousAnswer;

    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor="answer">Your Answer</Label>
          <Input
            id="answer"
            value={(state.selectedAnswer as string) || ""}
            onChange={(e) =>
              !showResult && handleSelectAnswer(e.target.value)
            }
            placeholder="Type your answer..."
            disabled={!!showResult}
            className="mt-1"
          />
        </div>
        {showResult && (
          <div
            className={`p-3 rounded-lg ${
              previousAnswer?.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {previousAnswer?.isCorrect ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-sm text-gray-600">
              Expected answer: <strong>{question.correctAnswer}</strong>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderExplain = (question: Question, state: QuestionState) => {
    const previousAnswer = answers.find((a) => a.questionId === question.id);
    const showResult = state.showResult || previousAnswer;

    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor="explanation">Your Explanation</Label>
          <textarea
            id="explanation"
            value={(state.selectedAnswer as string) || ""}
            onChange={(e) =>
              !showResult && handleSelectAnswer(e.target.value)
            }
            placeholder="Explain your understanding..."
            disabled={!!showResult}
            className="mt-1 w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {showResult && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium mb-1">Sample Explanation:</p>
            <p className="text-sm text-gray-600">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No practice questions available
        </CardContent>
      </Card>
    );
  }

  const state = getQuestionState(currentQuestion.id);
  const isAnswered = answeredQuestions.includes(currentQuestion.id);
  const progressPercent = (answeredQuestions.length / questions.length) * 100;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Practice Questions</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {correctCount}/{answeredQuestions.length} correct
            </Badge>
            <Badge>
              {currentIndex + 1}/{questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Question */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <Badge
              variant="outline"
              className={
                currentQuestion.difficulty === "easy"
                  ? "text-green-700"
                  : currentQuestion.difficulty === "medium"
                  ? "text-yellow-700"
                  : "text-red-700"
              }
            >
              {currentQuestion.difficulty}
            </Badge>
            <span className="text-sm text-gray-500">
              {currentQuestion.points} points
            </span>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer Area */}
        <div className="flex-1 min-h-0">
          {currentQuestion.type === "mcq" &&
            renderMCQ(currentQuestion, state)}
          {currentQuestion.type === "short-answer" &&
            renderShortAnswer(currentQuestion, state)}
          {currentQuestion.type === "explain" &&
            renderExplain(currentQuestion, state)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onRequestHelp(currentQuestion.id, currentQuestion.question)
              }
            >
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Need Help
            </Button>
            {isAnswered && !answers.find((a) => a.questionId === currentQuestion.id)?.isCorrect && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Retry
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {!isAnswered ? (
              <Button
                size="sm"
                onClick={handleSubmitAnswer}
                disabled={state.selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                All Done
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
