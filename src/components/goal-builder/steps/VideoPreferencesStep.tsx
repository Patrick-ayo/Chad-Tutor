import { useState } from "react";
import { Video, ListVideo, Shuffle, Eye, Star, Clock, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { GoalDefinition, VideoPreferences } from "@/types/goal";

interface VideoPreferencesStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function VideoPreferencesStep({ data, onUpdate, onNext, onBack }: VideoPreferencesStepProps) {
  const [preferences, setPreferences] = useState<VideoPreferences>(
    data.videoPreferences || {
      sourceType: "mixed",
      sortBy: "relevance",
      includeOneShot: false,
      preferredLanguage: "en",
    }
  );

  const handleNext = () => {
    onUpdate({
      ...data,
      videoPreferences: preferences,
    });
    onNext();
  };

  const updatePreference = <K extends keyof VideoPreferences>(
    key: K,
    value: VideoPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Video Preferences</h2>
        <p className="text-muted-foreground mt-2">
          Tell us how you'd like your study videos to be organized
        </p>
      </div>

      {/* Source Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="h-5 w-5" />
            Video Source
          </CardTitle>
          <CardDescription>
            How should we organize your learning content?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.sourceType}
            onValueChange={(value) =>
              updatePreference("sourceType", value as VideoPreferences["sourceType"])
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="single-playlist" id="single-playlist" />
              <Label htmlFor="single-playlist" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <ListVideo className="h-4 w-4 text-primary" />
                  <span className="font-medium">Single Playlist</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  All videos from one complete course/playlist for consistency
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="mixed" id="mixed" />
              <Label htmlFor="mixed" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-primary" />
                  <span className="font-medium">Mixed Sources</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Best videos from multiple channels for each topic
                </p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Sort Preference
          </CardTitle>
          <CardDescription>
            How should we rank and select videos?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.sortBy}
            onValueChange={(value) =>
              updatePreference("sortBy", value as VideoPreferences["sortBy"])
            }
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="relevance" id="relevance" />
              <Label htmlFor="relevance" className="cursor-pointer">
                <span className="font-medium">Most Relevant</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="views" id="views" />
              <Label htmlFor="views" className="cursor-pointer flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="font-medium">Most Views</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="rating" id="rating" />
              <Label htmlFor="rating" className="cursor-pointer flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span className="font-medium">Best Rated</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="date" id="date" />
              <Label htmlFor="date" className="cursor-pointer flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Latest</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* One-Shot Lectures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            One-Shot Lectures
          </CardTitle>
          <CardDescription>
            Include comprehensive single-video lectures that cover entire topics?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Include One-Shot Videos</p>
              <p className="text-sm text-muted-foreground">
                Great for quick revision or last-minute prep
              </p>
            </div>
            <Switch
              checked={preferences.includeOneShot}
              onCheckedChange={(checked) => updatePreference("includeOneShot", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Your Selection</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll find{" "}
                <span className="text-primary font-medium">
                  {preferences.sourceType === "single-playlist"
                    ? "a complete playlist"
                    : "the best videos from multiple sources"}
                </span>{" "}
                sorted by{" "}
                <span className="text-primary font-medium">
                  {preferences.sortBy === "views"
                    ? "view count"
                    : preferences.sortBy === "rating"
                    ? "ratings"
                    : preferences.sortBy === "date"
                    ? "upload date"
                    : "relevance"}
                </span>
                {preferences.includeOneShot && (
                  <>
                    , including{" "}
                    <span className="text-primary font-medium">one-shot lectures</span>
                  </>
                )}
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Find Videos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
