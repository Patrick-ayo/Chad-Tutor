import {
  AlertTriangle,
  Skull,
  Target,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WeakConcept, ConfidenceMatrixItem } from "@/types/analytics";

interface WeaknessSectionProps {
  weakConcepts: WeakConcept[];
  confidenceMatrix: ConfidenceMatrixItem[];
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

function ConfidenceMatrix({ items }: { items: ConfidenceMatrixItem[] }) {
  // Group by quadrant
  const quadrants = {
    "confident-correct": items.filter((i) => i.quadrant === "confident-correct"),
    "confident-wrong": items.filter((i) => i.quadrant === "confident-wrong"),
    "unsure-correct": items.filter((i) => i.quadrant === "unsure-correct"),
    "unsure-wrong": items.filter((i) => i.quadrant === "unsure-wrong"),
  };

  const QuadrantBox = ({
    title,
    items,
    bgColor,
    icon: Icon,
    description,
    isDangerous = false,
  }: {
    title: string;
    items: ConfidenceMatrixItem[];
    bgColor: string;
    icon: typeof CheckCircle2;
    description: string;
    isDangerous?: boolean;
  }) => (
    <div
      className={`p-3 rounded-lg border ${bgColor} ${
        isDangerous && items.length > 0 ? "ring-2 ring-red-500" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="outline" className="ml-auto text-xs">
          {items.length}
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      
      {items.length > 0 ? (
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.conceptId}
              className="text-xs flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
            >
              <span className="truncate">{item.conceptName}</span>
              <span className="text-gray-500 ml-2">
                {item.competence}%
              </span>
            </div>
          ))}
          {items.length > 5 && (
            <p className="text-xs text-gray-500">+{items.length - 5} more</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">None</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Confidence vs Competence</CardTitle>
          {quadrants["confident-wrong"].length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              <Skull className="h-3 w-3 mr-1" />
              {quadrants["confident-wrong"].length} dangerous
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Top Row: High Confidence */}
          <QuadrantBox
            title="Confident + Correct"
            items={quadrants["confident-correct"]}
            bgColor="bg-green-50 border-green-200"
            icon={CheckCircle2}
            description="Mastered concepts"
          />
          <QuadrantBox
            title="Confident + Wrong"
            items={quadrants["confident-wrong"]}
            bgColor="bg-red-50 border-red-200"
            icon={Skull}
            description="DANGEROUS — blind spots"
            isDangerous
          />

          {/* Bottom Row: Low Confidence */}
          <QuadrantBox
            title="Unsure + Correct"
            items={quadrants["unsure-correct"]}
            bgColor="bg-blue-50 border-blue-200"
            icon={HelpCircle}
            description="Underestimating yourself"
          />
          <QuadrantBox
            title="Unsure + Wrong"
            items={quadrants["unsure-wrong"]}
            bgColor="bg-yellow-50 border-yellow-200"
            icon={AlertTriangle}
            description="Needs work — you know it"
          />
        </div>

        {quadrants["confident-wrong"].length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">Priority Alert</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              You have {quadrants["confident-wrong"].length} concepts where you
              think you're good but you're not. These are the most dangerous
              gaps — address them first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeaknessSection({
  weakConcepts,
  confidenceMatrix,
}: WeaknessSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Weak Areas & Diagnosis</h2>
        <p className="text-sm text-gray-500">Where to focus next</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeakConceptList concepts={weakConcepts} />
        <ConfidenceMatrix items={confidenceMatrix} />
      </div>
    </section>
  );
}
