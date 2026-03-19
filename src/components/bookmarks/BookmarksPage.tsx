import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Search, Trash2, Clock, Tag, Play, FileText, Code2, HelpCircle } from "lucide-react";
import { mockBookmarks } from "@/data/mockSessionData";
import type { Bookmark as BookmarkType } from "@/types/session";

type FilterType = "all" | "video-timestamp" | "note" | "example" | "question";

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(mockBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === "all") return matchesSearch;
    return matchesSearch && bookmark.type === filterType;
  });

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleGoToBookmark = (bookmark: BookmarkType) => {
    // In real app, navigate to session with timestamp
    console.log("Navigate to bookmark:", bookmark);
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getTypeIcon = (type: BookmarkType["type"]) => {
    switch (type) {
      case "video-timestamp": return Play;
      case "note": return FileText;
      case "example": return Code2;
      case "question": return HelpCircle;
      default: return Bookmark;
    }
  };

  const getTypeColor = (type: BookmarkType["type"]) => {
    switch (type) {
      case "video-timestamp": return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      case "note": return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      case "example": return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      case "question": return "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const bookmarkStats = {
    total: bookmarks.length,
    video: bookmarks.filter(b => b.type === "video-timestamp").length,
    notes: bookmarks.filter(b => b.type === "note").length,
    examples: bookmarks.filter(b => b.type === "example").length,
    questions: bookmarks.filter(b => b.type === "question").length,
  };

  return (
    <div className="py-8 px-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-primary" />
          Bookmarks
        </h1>
        <p className="text-muted-foreground mt-2">
          Quick access to saved moments and important concepts from your learning sessions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-primary">{bookmarkStats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bookmarkStats.video}</div>
            <div className="text-xs text-muted-foreground">Video</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{bookmarkStats.notes}</div>
            <div className="text-xs text-muted-foreground">Notes</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{bookmarkStats.examples}</div>
            <div className="text-xs text-muted-foreground">Examples</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{bookmarkStats.questions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks by content or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "video-timestamp", "note", "example", "question"] as FilterType[]).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type === "all" ? "All" : type === "video-timestamp" ? "Video" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks List */}
      <ScrollArea className="h-[calc(100vh-450px)] md:h-[calc(100vh-420px)]">
        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No bookmarks match your search" : "No bookmarks yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Bookmark important moments while learning to quickly revisit them later
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark) => {
              const TypeIcon = getTypeIcon(bookmark.type);
              return (
                <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(bookmark.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground leading-relaxed">{bookmark.content}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {bookmark.type.replace("-", " ")}
                          </Badge>
                          {bookmark.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(bookmark.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                        {bookmark.timestamp !== undefined && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGoToBookmark(bookmark)}
                            className="font-mono"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {formatTimestamp(bookmark.timestamp)}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bookmark.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {filteredBookmarks.length} of {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
