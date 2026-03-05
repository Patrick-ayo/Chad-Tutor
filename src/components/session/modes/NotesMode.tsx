import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Target } from "lucide-react";
import type { ConceptTags } from "@/types/session";

interface NotesModeProps {
  conceptTags: ConceptTags;
  structuredNotes: string; // HTML content
  onNotesRead?: () => void;
}

export function NotesMode({ conceptTags, structuredNotes, onNotesRead }: NotesModeProps) {
  return (
    <div className="space-y-6">
      {/* Topic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {conceptTags.topic}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category and Complexity */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {conceptTags.category}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {conceptTags.complexity}
              </Badge>
            </div>

            {/* Key Concepts */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Key Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {conceptTags.concepts.map((concept, index) => (
                  <Badge key={index} variant="outline">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {conceptTags.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Prerequisites</h4>
                <div className="flex flex-wrap gap-2">
                  {conceptTags.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="secondary">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Structured Notes */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Structured Notes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Organized concepts extracted from the video content
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: structuredNotes }}
              onScroll={(e) => {
                // Mark as read when scrolled to bottom
                const element = e.target as HTMLElement;
                if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
                  onNotesRead?.();
                }
              }}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">5-7</div>
              <div className="text-xs text-muted-foreground">min read time</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{conceptTags.concepts.length}</div>
              <div className="text-xs text-muted-foreground">key concepts</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
              <div className="text-xs text-muted-foreground">examples next</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}