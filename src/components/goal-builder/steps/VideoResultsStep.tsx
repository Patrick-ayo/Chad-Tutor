import { useState, useEffect } from "react";
import { Video, Eye, ThumbsUp, ExternalLink, Loader2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, ChevronDown, ChevronRight, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { GoalDefinition, VideoResult, Playlist } from "@/types/goal";

interface VideoResultsStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function VideoResultsStep({ data, onUpdate, onNext, onBack }: VideoResultsStepProps) {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<VideoResult[]>(data.videos || []);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const isPlaylistMode = data.videoPreferences?.sourceType === 'single-playlist';

  // Fetch videos when component mounts
  useEffect(() => {
    if (!data.topics || data.topics.length === 0) {
      setError("No topics selected. Please go back and select topics.");
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build full exam context for highly relevant search queries
        const examContext: {
          university?: string;
          course?: string;
          semester?: string;
          subjects?: string[];
          level?: string; // e.g., "engineering", "degree", "college"
        } = {};
        
        // University context
        if (data.university) {
          examContext.university = typeof data.university === 'string' 
            ? data.university 
            : data.university.name;
        }
        
        // Course/Program context (important to distinguish engineering vs arts vs commerce)
        if (data.course) {
          examContext.course = typeof data.course === 'string'
            ? data.course
            : data.course.name;
          // Detect level from course name
          const courseLower = examContext.course.toLowerCase();
          if (courseLower.includes('engineering') || courseLower.includes('b.tech') || courseLower.includes('btech') || courseLower.includes('b.e')) {
            examContext.level = 'engineering';
          } else if (courseLower.includes('b.sc') || courseLower.includes('bsc')) {
            examContext.level = 'bsc degree';
          } else if (courseLower.includes('b.com') || courseLower.includes('bcom')) {
            examContext.level = 'commerce degree';
          } else if (courseLower.includes('b.a') || courseLower.includes('ba ')) {
            examContext.level = 'arts degree';
          } else if (courseLower.includes('mba')) {
            examContext.level = 'mba';
          } else if (courseLower.includes('m.tech') || courseLower.includes('mtech')) {
            examContext.level = 'mtech';
          }
        }
        
        // Semester context (to distinguish M1 from M3, etc.)
        if (data.semester) {
          examContext.semester = typeof data.semester === 'string'
            ? data.semester
            : data.semester.name;
        }
        
        // Subject names for context
        if (data.subjects && data.subjects.length > 0) {
          examContext.subjects = data.subjects.map(s => s.name);
        }
        
        const response = await fetch("http://localhost:3001/api/videos/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: data.topics,
            preferences: data.videoPreferences || {
              sourceType: "mixed",
              sortBy: "relevance",
              includeOneShot: false,
            },
            examContext,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch videos");
        }

        setVideos(result.videos || []);
        setPlaylists(result.playlists || []);
        setMeta(result.meta);
        
        // Auto-select based on mode
        if (result.playlists && result.playlists.length > 0) {
          // Playlist mode: auto-select all playlists
          const allPlaylistIds = new Set<string>(result.playlists.map((p: Playlist) => p.id));
          setSelectedPlaylistIds(allPlaylistIds);
          
          // Select all videos from all playlists
          const allVideosFromPlaylists = result.playlists.flatMap((p: Playlist) => p.videos);
          setSelectedVideos(allVideosFromPlaylists);
        } else {
          // Mixed mode: auto-select all videos
          setSelectedVideos(result.videos || []);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [data.topics, data.videoPreferences]);

  const handleVideoToggle = (video: VideoResult) => {
    setSelectedVideos((prev) => {
      const exists = prev.find((v) => v.id === video.id);
      if (exists) {
        return prev.filter((v) => v.id !== video.id);
      }
      return [...prev, video];
    });
  };

  const handlePlaylistToggle = (playlist: Playlist) => {
    setSelectedPlaylistIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playlist.id)) {
        // Deselect playlist and its videos
        newSet.delete(playlist.id);
        setSelectedVideos((prevVideos) => 
          prevVideos.filter((v) => v.playlistId !== playlist.id)
        );
      } else {
        // Select playlist and its videos
        newSet.add(playlist.id);
        setSelectedVideos((prevVideos) => {
          const existingIds = new Set(prevVideos.map(v => v.id));
          const newVideos = playlist.videos.filter(v => !existingIds.has(v.id));
          return [...prevVideos, ...newVideos];
        });
      }
      return newSet;
    });
  };

  const togglePlaylistExpand = (playlistId: string) => {
    setExpandedPlaylists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (isPlaylistMode && playlists.length > 0) {
      // Select all playlists
      setSelectedPlaylistIds(new Set(playlists.map(p => p.id)));
      setSelectedVideos(playlists.flatMap(p => p.videos));
    } else {
      // Select all videos
      setSelectedVideos([...videos]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedVideos([]);
    setSelectedPlaylistIds(new Set());
  };

  const handleNext = () => {
    onUpdate({
      ...data,
      videos: selectedVideos,
    });
    onNext();
  };

  // Group videos by topic
  const videosByTopic = videos.reduce((acc, video) => {
    const topicName = video.topicName || video.topicId;
    if (!acc[topicName]) acc[topicName] = [];
    acc[topicName].push(video);
    return acc;
  }, {} as { [topic: string]: VideoResult[] });

  // Calculate totals
  const totalDuration = selectedVideos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const totalHours = Math.round(totalDuration / 3600 * 10) / 10;
  const totalMinutes = Math.round(totalDuration / 60);

  const canProceed = selectedVideos.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Finding Videos</h2>
          <p className="text-muted-foreground mt-2">
            Searching YouTube for the best learning content...
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Fetching videos for {data.topics?.length || 0} topics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Video Search</h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isPlaylistMode ? "Your Study Playlists" : "Your Study Videos"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isPlaylistMode 
            ? `We found ${playlists.length} playlists with ${videos.length} total videos. Select the playlists you want to study.`
            : `We found ${videos.length} videos for your topics. Select the ones you want to study.`
          }
        </p>
      </div>

      {/* Meta info */}
      {meta && meta.cacheHit && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            These results were cached from a previous search with the same filters!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {isPlaylistMode ? selectedPlaylistIds.size : selectedVideos.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPlaylistMode ? "Playlists Selected" : "Videos Selected"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {totalHours > 1 ? `${totalHours}h` : `${totalMinutes}m`}
              </p>
              <p className="text-sm text-muted-foreground">Total Duration</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {isPlaylistMode ? playlists.length : Object.keys(videosByTopic).length}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPlaylistMode ? "Total Playlists" : "Topics Covered"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleSelectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={handleDeselectAll}>
          Deselect All
        </Button>
      </div>

      {/* Playlist mode: Show playlists with expandable videos */}
      {isPlaylistMode && playlists.length > 0 && (
        <div className="space-y-4">
          {playlists.map((playlist) => {
            const isSelected = selectedPlaylistIds.has(playlist.id);
            const isExpanded = expandedPlaylists.has(playlist.id);
            
            return (
              <Card key={playlist.id} className={isSelected ? "border-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handlePlaylistToggle(playlist)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{playlist.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        {playlist.channelName} • {playlist.videoCount} videos • {playlist.totalDurationFormatted}
                      </CardDescription>
                      {playlist.subtopicName && (
                        <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {playlist.subtopicName}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlaylistExpand(playlist.id)}
                      className="gap-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Hide Videos
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4" />
                          Show Videos
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    {playlist.videos.map((video, idx) => (
                      <div
                        key={video.id}
                        className="flex gap-3 p-2 border rounded text-sm hover:bg-accent/50"
                      >
                        <span className="text-muted-foreground min-w-[2rem]">{idx + 1}.</span>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-2 text-sm">{video.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{video.duration}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatViewCount(video.viewCount)}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`https://youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-accent rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Mixed mode: Show videos by topic */}
      {!isPlaylistMode && Object.entries(videosByTopic).map(([topicName, topicVideos]) => (
        <Card key={topicName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5" />
              {topicName}
            </CardTitle>
            <CardDescription>
              {topicVideos.length} videos found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topicVideos.map((video) => {
              const isSelected = selectedVideos.some((v) => v.id === video.id);
              return (
                <div
                  key={video.id}
                  className={`flex gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleVideoToggle(video)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleVideoToggle(video)}
                    className="mt-1"
                  />
                  
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute bottom-1 right-1 text-xs bg-black/80 text-white"
                    >
                      {video.duration}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{video.channelName}</p>
                    {video.subtopicName && (
                      <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200">
                        {video.subtopicName}
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatViewCount(video.viewCount)}
                      </span>
                      {video.likeCount && video.likeCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatViewCount(video.likeCount)}
                        </span>
                      )}
                      {video.isOneShot && (
                        <Badge variant="outline" className="text-xs">
                          One-Shot
                        </Badge>
                      )}
                      {video.playlistTitle && (
                        <Badge variant="secondary" className="text-xs">
                          Playlist
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* External link */}
                  <a
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 hover:bg-accent rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Errors warning */}
      {meta?.errors && meta.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some topics couldn't be searched: {meta.errors.join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2">
          Continue with {selectedVideos.length} Videos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
