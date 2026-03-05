import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface VisualizerModeProps {
  topic: string;
  description?: string;
}

export function VisualizerMode({ topic, description }: VisualizerModeProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Algorithm Visualizer: {topic}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {description || "Interactive visualization to help you understand the concept"}
          </p>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-slate-900 h-80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                {[30, 50, 20, 60, 40].map((height, index) => (
                  <div
                    key={index}
                    className="w-12 bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${height * 2}px` }}
                  />
                ))}
              </div>
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                Visualization Preview
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Play
            </Button>
            <Button variant="outline" size="icon">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="outline">Speed: 1x</Badge>
            <Badge variant="outline">Step: 0/10</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <CardContent className="py-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm text-center">
            Full interactive visualizations coming soon. This is a preview of the visualization interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}