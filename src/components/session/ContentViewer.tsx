import { useState } from "react";
import { ExternalLink, Play, FileText, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskContent } from "@/types/session";

interface ContentViewerProps {
  content: TaskContent[];
  onContentViewed: (contentId: string) => void;
  viewedContentIds: Set<string>;
}

export function ContentViewer({
  content,
  onContentViewed,
  viewedContentIds,
}: ContentViewerProps) {
  const [activeContentId, setActiveContentId] = useState<string | null>(
    content[0]?.id || null
  );

  const activeContent = content.find((c) => c.id === activeContentId);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleContentSelect = (contentItem: TaskContent) => {
    setActiveContentId(contentItem.id);
    onContentViewed(contentItem.id);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Learning Content</CardTitle>
          <Badge variant="outline">
            {viewedContentIds.size}/{content.length} viewed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Content Tabs */}
        <div className="flex gap-2 border-b border-gray-100 pb-3">
          {content.map((item) => {
            const isActive = activeContentId === item.id;
            const isViewed = viewedContentIds.has(item.id);

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleContentSelect(item)}
                className="relative"
              >
                {item.type === "text" && <FileText className="h-4 w-4 mr-1.5" />}
                {item.type === "video" && <Play className="h-4 w-4 mr-1.5" />}
                {item.type === "link" && <ExternalLink className="h-4 w-4 mr-1.5" />}
                {item.title}
                {item.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                {isViewed && (
                  <Check className="h-3 w-3 ml-1.5 text-green-600" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Content Display */}
        {activeContent && (
          <div className="flex-1 min-h-0">
            {activeContent.type === "text" && (
              <ScrollArea className="h-full pr-4">
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: activeContent.content }}
                />
              </ScrollArea>
            )}

            {activeContent.type === "video" && (
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={activeContent.content}
                    className="w-full h-full"
                    title={activeContent.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {activeContent.duration && (
                  <p className="text-sm text-gray-500">
                    Duration: {formatDuration(activeContent.duration)}
                  </p>
                )}
              </div>
            )}

            {activeContent.type === "link" && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-full">
                  <ExternalLink className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {activeContent.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Opens in a new tab
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(activeContent.content, "_blank");
                    onContentViewed(activeContent.id);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Resource
                </Button>
              </div>
            )}
          </div>
        )}

        {content.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No content available for this task
          </div>
        )}
      </CardContent>
    </Card>
  );
}
