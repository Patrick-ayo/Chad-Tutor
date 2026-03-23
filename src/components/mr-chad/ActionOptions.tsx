import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BarChart3, Film, Map } from 'lucide-react';

interface ActionOptionsProps {
  onSelectActions: (actions: ('quiz' | 'recap' | 'roadmap')[]) => void;
  isLoading?: boolean;
}

type ActionType = 'quiz' | 'recap' | 'roadmap';

const ACTION_OPTIONS: Record<ActionType, { label: string; description: string; icon: React.ReactNode }> = {
  quiz: {
    label: 'Generate Quiz/Test',
    description: 'Create a quiz to confirm your skills and identify knowledge gaps',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  recap: {
    label: 'Create Recap Video',
    description: 'Generate a video recap of everything you\'ve studied so far',
    icon: <Film className="w-5 h-5" />,
  },
  roadmap: {
    label: 'Generate Roadmap',
    description: 'Create a personalized roadmap and schedule your learning',
    icon: <Map className="w-5 h-5" />,
  },
};

export function ActionOptions({ onSelectActions, isLoading = false }: ActionOptionsProps) {
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);

  const toggleAction = (action: ActionType) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleConfirm = () => {
    if (selectedActions.length > 0) {
      onSelectActions(selectedActions);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 space-y-4">
      <h3 className="font-semibold text-purple-900">🚀 What would you like to do next?</h3>
      <p className="text-sm text-purple-800">
        Select one or more options to personalize your learning experience:
      </p>

      <div className="space-y-3">
        {(Object.entries(ACTION_OPTIONS) as [ActionType, typeof ACTION_OPTIONS[ActionType]][]).map(
          ([actionKey, actionData]) => (
            <button
              key={actionKey}
              onClick={() => toggleAction(actionKey)}
              disabled={isLoading}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedActions.includes(actionKey)
                  ? 'border-purple-500 bg-purple-100'
                  : 'border-purple-200 bg-white hover:border-purple-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${selectedActions.includes(actionKey) ? 'text-purple-600' : 'text-purple-400'}`}>
                  {selectedActions.includes(actionKey) ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    actionData.icon
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{actionData.label}</p>
                  <p className="text-sm text-gray-600">{actionData.description}</p>
                </div>
              </div>
            </button>
          )
        )}
      </div>

      <div className="bg-white rounded-lg p-3 border border-purple-200">
        <p className="text-xs text-gray-600 mb-3">
          {selectedActions.length === 0
            ? '💡 Select at least one option to proceed'
            : `✓ ${selectedActions.length} option${selectedActions.length !== 1 ? 's' : ''} selected`}
        </p>
        <Button
          onClick={handleConfirm}
          disabled={selectedActions.length === 0 || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? 'Processing...' : 'Proceed with Selected Options'}
        </Button>
      </div>
    </div>
  );
}
