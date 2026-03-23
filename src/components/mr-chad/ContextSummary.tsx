import type { UserContext } from '@/types/chat';

interface ContextSummaryProps {
  context: UserContext;
}

export function ContextSummary({ context }: ContextSummaryProps) {
  const hasContext = Object.values(context).some(arr => arr.length > 0);

  if (!hasContext) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
      <h3 className="font-semibold text-blue-900">📚 Your Learning Context</h3>
      
      {context.languages.length > 0 && (
        <div>
          <p className="text-sm font-medium text-blue-800">Languages:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {context.languages.map((lang) => (
              <span key={lang} className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {context.jobCourses.length > 0 && (
        <div>
          <p className="text-sm font-medium text-blue-800">Job/Courses:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {context.jobCourses.map((course) => (
              <span key={course} className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded">
                {course}
              </span>
            ))}
          </div>
        </div>
      )}

      {context.positions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-blue-800">Positions:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {context.positions.map((pos) => (
              <span key={pos} className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded">
                {pos}
              </span>
            ))}
          </div>
        </div>
      )}

      {context.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-blue-800">Skills:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {context.skills.map((skill) => (
              <span key={skill} className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
