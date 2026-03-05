import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  BookmarkCheck,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import type { ExampleProblem } from "@/types/session";

interface ExamplesModeProps {
  examples: ExampleProblem[];
}

export function ExamplesMode({ examples }: ExamplesModeProps) {
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set());
  const [playingNarration, setPlayingNarration] = useState<string | null>(null);
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set());

  const onBookmarkToggle = (problemId: string) => {
    console.log('Toggling bookmark for:', problemId);
  };

  const onRegenerateProblem = (problemId: string, difficulty: "easy" | "medium" | "hard") => {
    console.log('Regenerating problem:', problemId, difficulty);
  };

  const onExamplesComplete = () => {
    console.log('All examples completed!');
  };

  const toggleExpanded = (problemId: string) => {
    setExpandedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const toggleNarration = (problemId: string) => {
    if (playingNarration === problemId) {
      setPlayingNarration(null);
    } else {
      setPlayingNarration(problemId);
    }
  };

  const markAsComplete = (problemId: string) => {
    setCompletedProblems(prev => {
      const newSet = new Set(prev);
      newSet.add(problemId);
      
      if (newSet.size === examples.length) {
        onExamplesComplete();
      }
      
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy": return "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800";
      case "medium": return "text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800";
      case "hard": return "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Example Problems
            </div>
            <Badge variant="outline">
              {completedProblems.size}/{examples.length} solved
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Problems of increasing difficulty to test your understanding
          </p>
        </CardHeader>
      </Card>

      {/* Problems */}
      <div className="space-y-4">
        {examples.map((problem) => {
          const isExpanded = expandedProblems.has(problem.id);
          const isPlaying = playingNarration === problem.id;
          const isCompleted = completedProblems.has(problem.id);

          return (
            <Card key={problem.id} className={isCompleted ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(problem.difficulty)}
                      >
                        {problem.difficulty.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        Variable time
                      </div>
                      {isCompleted && (
                        <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{problem.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {problem.hasNarration && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNarration(problem.id)}
                        className="p-2"
                      >
                        {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBookmarkToggle(problem.id)}
                      className={`p-2 ${
                        problem.isBookmarked ? "bg-yellow-50 text-yellow-700 border-yellow-300" : ""
                      }`}
                    >
                      {problem.isBookmarked ? 
                        <BookmarkCheck className="h-4 w-4" /> : 
                        <Bookmark className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Expand/Collapse Solution */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpanded(problem.id)}
                    className="w-full justify-between p-4 h-auto bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-medium">
                      {isExpanded ? "Hide" : "Show"} Step-by-Step Solution
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {/* Solution Steps */}
                  {isExpanded && (
                    <div className="space-y-4 border-l-2 border-blue-200 pl-4 ml-2">
                      {problem.stepByStepSolution.map((step) => (
                        <div key={step.step} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {step.step}
                            </div>
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                          </div>
                          <p className="text-gray-700 ml-8 leading-relaxed">
                            {step.explanation}
                          </p>
                          {step.code && (
                            <div className="ml-8">
                              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                                <code>{step.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRegenerateProblem(problem.id, problem.difficulty)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Similar Problem
                      </Button>
                    </div>
                    
                    {!isCompleted && (
                      <Button
                        onClick={() => markAsComplete(problem.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Understood
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Summary */}
      {completedProblems.size === examples.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl">🎉</div>
              <h3 className="font-semibold text-green-800">All Examples Completed!</h3>
              <p className="text-sm text-green-700">
                Great job! You've worked through all the example problems. Ready for practice questions?
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}