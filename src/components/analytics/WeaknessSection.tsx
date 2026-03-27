import {
  Target,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WeakConcept } from "@/types/analytics";

interface WeaknessSectionProps {
  weakConcepts: WeakConcept[];
}

function WeakConceptList({ concepts }: { concepts: WeakConcept[] }) {
  const getImpactBadge = (impact: WeakConcept["goalImpact"]) => {
    switch (impact) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
    }
  };

  // Sort by impact priority
  const sortedConcepts = [...concepts].sort((a, b) => {
    const priority = { critical: 0, high: 1, medium: 2, low: 3 };
    return priority[a.goalImpact] - priority[b.goalImpact];
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Weak Concepts
          </CardTitle>
          <Badge variant="destructive">
            {concepts.filter((c) => c.goalImpact === "critical").length} critical
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedConcepts.map((concept) => (
            <div
              key={concept.conceptId}
              className={`p-3 rounded-lg border ${
                concept.goalImpact === "critical"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{concept.conceptName}</p>
                  <p className="text-xs text-gray-500">
                    Accuracy: {concept.accuracy}%
                  </p>
                </div>
                {getImpactBadge(concept.goalImpact)}
              </div>

              {/* Why it's weak */}
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Why:</span> {concept.reason}
              </p>

              {/* Downstream impact */}
              {concept.affectedDownstream.length > 0 && (
                <div className="text-xs mb-2">
                  <span className="font-medium text-red-700">Affects:</span>{" "}
                  <span className="text-red-600">
                    {concept.affectedDownstream.join(", ")}
                  </span>
                </div>
              )}

              {/* Suggested action */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-700">
                  💡 {concept.suggestedAction}
                </p>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  Fix <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}

          {concepts.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No weak concepts detected</p>
              <p className="text-xs">Keep up the good work!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function WeaknessSection({
  weakConcepts,
}: WeaknessSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Weak Areas & Diagnosis</h2>
        <p className="text-sm text-gray-500">Where to focus next</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <WeakConceptList concepts={weakConcepts} />
      </div>
    </section>
  );
}
