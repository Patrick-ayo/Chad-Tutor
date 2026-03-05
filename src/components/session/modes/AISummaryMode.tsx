import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Lightbulb, Target, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AISummaryModeProps {
  topic: string;
  summary: string;
  keyInsights: string[];
  analogies: string[];
  onSummaryRead?: () => void;
}

export function AISummaryMode({ 
  topic, 
  summary, 
  keyInsights, 
  analogies, 
  onSummaryRead 
}: AISummaryModeProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Summary: {topic}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Condensed explanation focusing on core concepts
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Core Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed text-base">{summary}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>2-3 min read</span>
            <Badge variant="outline" className="ml-2">AI Generated</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simple Analogies</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-world comparisons to make concepts stick
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analogies.map((analogy, index) => (
              <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-foreground leading-relaxed italic">"{analogy}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onSummaryRead} className="bg-purple-600 hover:bg-purple-700">
          Continue to Examples
        </Button>
      </div>
    </div>
  );
}