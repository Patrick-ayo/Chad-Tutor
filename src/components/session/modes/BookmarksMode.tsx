import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Search, Trash2, ExternalLink, Clock, Tag } from "lucide-react";
import type { Bookmark as BookmarkType } from "@/types/session";

interface BookmarksModeProps {
  bookmarks: BookmarkType[];
  onDeleteBookmark?: (id: string) => void;
  onGoToBookmark?: (bookmark: BookmarkType) => void;
}

export function BookmarksMode({
  bookmarks,
  onDeleteBookmark,
  onGoToBookmark
}: BookmarksModeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "video-timestamp" | "note" | "example" | "question">("all");

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === "all") return matchesSearch;
    return matchesSearch && bookmark.type === filterType;
  });

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getTypeColor = (type: BookmarkType["type"]) => {
    switch (type) {
      case "video-timestamp": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      case "note": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "example": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "question": return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            My Bookmarks
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick access to important moments and concepts
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "video-timestamp" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("video-timestamp")}
              >
                Video
              </Button>
              <Button
                variant={filterType === "note" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("note")}
              >
                Notes
              </Button>
              <Button
                variant={filterType === "example" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("example")}
              >
                Examples
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "No bookmarks match your search" : "No bookmarks yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Bookmark important moments while watching videos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {bookmark.timestamp !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 font-mono"
                      onClick={() => onGoToBookmark?.(bookmark)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(bookmark.timestamp)}
                    </Button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700">{bookmark.content}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={getTypeColor(bookmark.type)}>
                        {bookmark.type.replace("-", " ")}
                      </Badge>
                      {bookmark.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-gray-400">
                        {formatDate(bookmark.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {bookmark.timestamp !== undefined && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onGoToBookmark?.(bookmark)}
                        className="text-blue-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteBookmark?.(bookmark.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}