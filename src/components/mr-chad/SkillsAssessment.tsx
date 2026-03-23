import type { UserContext } from '@/types/chat';
import { getGroundLevelSkills } from '@/utils/chatContextUtils';

interface SkillsAssessmentProps {
  context: UserContext;
}

export function SkillsAssessment({ context }: SkillsAssessmentProps) {
  const groundLevelSkills = getGroundLevelSkills(context);

  if (groundLevelSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 space-y-3">
      <h3 className="font-semibold text-amber-900">🎯 Ground-Level Skills Assessment</h3>
      <p className="text-sm text-amber-800">
        Based on your selected paths, here are the fundamental skills you should focus on:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {groundLevelSkills.map((skill) => (
          <div key={skill} className="bg-white border border-amber-200 rounded p-3 flex items-start gap-2">
            <div className="text-amber-600 text-lg">✓</div>
            <div>
              <p className="text-sm font-medium text-amber-900">{skill}</p>
              <p className="text-xs text-amber-700">Foundation skill</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-100 rounded p-3 text-sm text-amber-900">
        <strong>💡 Start with these basics:</strong> Master these ground-level skills before moving to advanced topics. They form the foundation of your learning path.
      </div>
    </div>
  );
}
