import { Button } from '@/components/ui/button';

export interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'explore',
    title: 'To explore yourself',
    description: 'Discover your learning style and strengths',
    icon: '🔍',
  },
  {
    id: 'skills',
    title: 'Plan & sharpen skills',
    description: 'Learn specific skills and create tests to evaluate your progress',
    icon: '⚡',
  },
  {
    id: 'roadmap',
    title: 'Goal-based roadmap',
    description: 'Create a structured learning path toward your career goals',
    icon: '🗺️',
  },
];

interface GoalSelectionProps {
  onSelectGoal: (goal: GoalOption) => void;
  isLoading?: boolean;
}

export function GoalSelection({ onSelectGoal, isLoading = false }: GoalSelectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Mr. Chad</h2>
        <p className="text-muted-foreground">
          I'm here to help you achieve your learning goals. What would you like to do?
        </p>
      </div>

      <div className="grid gap-3">
        {GOAL_OPTIONS.map((goal) => (
          <Button
            key={goal.id}
            onClick={() => onSelectGoal(goal)}
            disabled={isLoading}
            variant="outline"
            className="h-auto justify-start p-4 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-start gap-4 w-full">
              <span className="text-2xl flex-shrink-0">{goal.icon}</span>
              <div className="text-left flex-1">
                <div className="font-semibold">{goal.title}</div>
                <div className="text-sm text-muted-foreground">{goal.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
