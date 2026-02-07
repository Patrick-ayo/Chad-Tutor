import { useState, useEffect } from "react";
import { BookOpen, CheckSquare, BarChart, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { GoalDefinition, Topic } from "@/types/goal";

interface TopicSelectionStepProps {
  data: Partial<GoalDefinition>;
  onUpdate: (data: Partial<GoalDefinition>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TopicSelectionStep({ data, onUpdate, onNext, onBack }: TopicSelectionStepProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(data.topics || []);
  const [selectedSubtopics, setSelectedSubtopics] = useState<{ [topicId: string]: string[] }>({});
  const [expandedTopics, setExpandedTopics] = useState<{ [topicId: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // Fetch topics when subjects are available
  useEffect(() => {
    if (!data.subjects || data.subjects.length === 0) {
      setTopics([]);
      return;
    }

    const fetchTopics = async () => {
      setLoading(true);
      try {
        const subjectIds = data.subjects!.map(s => s.id).join(',');
        const response = await fetch(
          `http://localhost:3001/api/exam/topics?subjects=${encodeURIComponent(subjectIds)}`
        );
        const result = await response.json();
        setTopics(result.topics || []);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [data.subjects]);

  const toggleExpanded = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleTopicToggle = (topic: Topic) => {
    setSelectedTopics((prev) => {
      const exists = prev.find((t) => t.id === topic.id);
      if (exists) {
        // Deselect topic — remove subtopics & collapse
        setSelectedSubtopics((subPrev) => {
          const updated = { ...subPrev };
          delete updated[topic.id];
          return updated;
        });
        setExpandedTopics((prev) => ({ ...prev, [topic.id]: false }));
        return prev.filter((t) => t.id !== topic.id);
      }
      // Select topic — auto-select all subtopics & expand dropdown
      const subs = topic.subtopics ?? [];
      if (subs.length > 0) {
        setSelectedSubtopics((subPrev) => ({
          ...subPrev,
          [topic.id]: subs.map(st => st.id)
        }));
        setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }));
      }
      return [...prev, topic];
    });
  };

  const handleSubtopicToggle = (topicId: string, subtopicId: string) => {
    setSelectedSubtopics((prev) => {
      const current = prev[topicId] || [];
      if (current.includes(subtopicId)) {
        return { ...prev, [topicId]: current.filter(id => id !== subtopicId) };
      }
      return { ...prev, [topicId]: [...current, subtopicId] };
    });
  };

  const handleNext = () => {
    if (selectedTopics.length === 0) return;
    onUpdate({ ...data, topics: selectedTopics });
    onNext();
  };

  // Group topics by subject and module
  const topicsBySubjectAndModule = topics.reduce((acc, topic) => {
    const subjectName = data.subjects?.find(s => s.id === topic.subjectId)?.name || topic.subjectId;
    if (!acc[subjectName]) acc[subjectName] = {};
    if (!acc[subjectName][topic.module]) acc[subjectName][topic.module] = [];
    acc[subjectName][topic.module].push(topic);
    return acc;
  }, {} as { [subject: string]: { [module: string]: Topic[] } });

  const totalSubtopicsSelected = Object.values(selectedSubtopics).reduce((sum, arr) => sum + arr.length, 0);
  const canProceed = selectedTopics.length > 0;

  if (!data.subjects || data.subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Select Topics</h2>
          <p className="text-muted-foreground mt-2">
            Please select subjects first before choosing topics to study.
          </p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back to Subjects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Topics to Study</h2>
        <p className="text-muted-foreground mt-2">
          Choose topics and drill into subtopics for detailed study planning
        </p>
      </div>

      {/* Selected subjects overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Selected Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.subjects!.map((subject) => (
              <Badge key={subject.id} variant="secondary" className="px-3 py-1">
                {subject.name} ({subject.code})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading topics...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic selection by subject and module */}
      {!loading && Object.keys(topicsBySubjectAndModule).map((subject) => (
        <Card key={subject}>
          <CardHeader>
            <CardTitle className="text-lg">{subject}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(topicsBySubjectAndModule[subject]).map((module, modIdx, modArr) => (
              <div key={module}>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {module}
                </h4>
                <div className="grid gap-2 ml-4">
                  {topicsBySubjectAndModule[subject][module].map((topic) => {
                    const isSelected = !!selectedTopics.find(t => t.id === topic.id);
                    const isExpanded = !!expandedTopics[topic.id];
                    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
                    const selectedCount = selectedSubtopics[topic.id]?.length ?? 0;
                    const totalSubs = topic.subtopics?.length ?? 0;

                    return (
                      <div
                        key={topic.id}
                        className={`border rounded-lg transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Topic row */}
                        <div
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          onClick={() => handleTopicToggle(topic)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleTopicToggle(topic)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{topic.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <BarChart className="h-3 w-3" />
                                <span className={`capitalize ${
                                  topic.difficulty === 'easy' ? 'text-green-500' :
                                  topic.difficulty === 'medium' ? 'text-yellow-500' :
                                  'text-red-500'
                                }`}>
                                  {topic.difficulty}
                                </span>
                              </span>
                              {hasSubtopics && isSelected && (
                                <span className="text-primary font-medium">
                                  {selectedCount}/{totalSubs} subtopics
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Expand/collapse button for subtopics */}
                          {hasSubtopics && (
                            <button
                              className="p-1 rounded hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(topic.id);
                              }}
                              aria-label={isExpanded ? "Collapse subtopics" : "Expand subtopics"}
                            >
                              {isExpanded
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              }
                            </button>
                          )}
                        </div>

                        {/* Subtopics dropdown */}
                        {hasSubtopics && isExpanded && (
                          <div className="border-t border-border bg-muted/30 rounded-b-lg">
                            <div className="px-4 py-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Subtopics
                              </p>
                              <div className="space-y-1">
                                {topic.subtopics!.map((subtopic) => {
                                  const isSubSelected = selectedSubtopics[topic.id]?.includes(subtopic.id) ?? false;
                                  return (
                                    <div
                                      key={subtopic.id}
                                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                        isSubSelected
                                          ? "bg-primary/10"
                                          : "hover:bg-accent"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Auto-select the parent topic if not already selected
                                        if (!isSelected) {
                                          handleTopicToggle(topic);
                                        }
                                        handleSubtopicToggle(topic.id, subtopic.id);
                                      }}
                                    >
                                      <Checkbox
                                        checked={isSubSelected}
                                        onCheckedChange={() => {
                                          if (!isSelected) handleTopicToggle(topic);
                                          handleSubtopicToggle(topic.id, subtopic.id);
                                        }}
                                      />
                                      <span className="text-sm flex-1">{subtopic.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {modIdx < modArr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      {selectedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              Study Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{selectedTopics.length}</p>
                <p className="text-sm text-muted-foreground">Topics</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{totalSubtopicsSelected}</p>
                <p className="text-sm text-muted-foreground">Subtopics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Subjects
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="min-w-[120px]"
        >
          {canProceed ? "Continue" : "Select Topics"}
        </Button>
      </div>
    </div>
  );
}