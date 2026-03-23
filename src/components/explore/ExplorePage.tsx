/**
 * ExplorePage Component
 * 
 * Displays roadmap blocks that can be clicked to reveal a flowchart
 * showing the skill hierarchy and relationships.
 */

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, BookOpen, Layers } from 'lucide-react';
import { RoadmapFlowchart } from './RoadmapFlowchart';

// Types for roadmap data
interface RoadmapNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: string;
  sortOrder: number;
}

interface RoadmapEdge {
  sourceId: string;
  targetId: string;
  edgeType: string;
}

interface RoadmapGraph {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

interface Roadmap {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  nodeCount: number;
}

export function ExplorePage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [expandedRoadmap, setExpandedRoadmap] = useState<Roadmap | null>(null);
  const [graphData, setGraphData] = useState<RoadmapGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch roadmaps from API on mount
  useEffect(() => {
    async function fetchRoadmaps() {
      setLoadingRoadmaps(true);
      try {
        const response = await fetch('/api/roadmaps');
        if (response.ok) {
          const data = await response.json();
          setRoadmaps(data);
        }
      } catch (error) {
        console.error('Failed to fetch roadmaps:', error);
      } finally {
        setLoadingRoadmaps(false);
      }
    }
    fetchRoadmaps();
  }, []);

  const handleRoadmapClick = async (roadmap: Roadmap) => {
    setExpandedRoadmap(roadmap);
    setLoading(true);
    try {
      const response = await fetch(`/api/roadmaps/${roadmap.slug}`);
      if (response.ok) {
        const data = await response.json();
        setGraphData({ nodes: data.nodes, edges: data.edges });
      } else {
        setGraphData(null);
      }
    } catch (error) {
      console.error('Failed to fetch roadmap graph:', error);
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setExpandedRoadmap(null);
    setGraphData(null);
  };

  // Filter roadmaps by search
  const filteredRoadmaps = roadmaps.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Top Nav */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Explore Roadmaps</h1>
        <div className="flex items-center gap-4">
          {!expandedRoadmap && (
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="px-4 py-2 rounded-lg border border-border bg-background text-base w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          {expandedRoadmap && (
            <button
              className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
              onClick={handleBack}
            >
              Back
            </button>
          )}
        </div>
      </div>

      {!expandedRoadmap ? (
        loadingRoadmaps ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground text-lg">Loading roadmaps...</span>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No roadmaps found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try a different search term.' : 'Roadmaps will appear here once they are added.'}
            </p>
          </Card>
        ) : (
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl">
            {filteredRoadmaps.map((roadmap) => (
              <Card
                key={roadmap.id}
                className="flex flex-col items-center justify-between h-[400px] w-full max-w-[400px] mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] shadow-none cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleRoadmapClick(roadmap)}
              >
                {/* Icon at top */}
                <div className="flex flex-col items-center mt-8">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-4 bg-[rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: `${roadmap.color}20` }}
                  >
                    {roadmap.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-center mb-2">{roadmap.name}</CardTitle>
                  <p className="text-base text-muted-foreground text-center whitespace-pre-line mb-2">
                    {roadmap.description}
                  </p>
                </div>
                {/* Badge at bottom */}
                <div className="flex flex-col items-center mb-6 mt-auto">
                  {roadmap.nodeCount > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-2 px-6 py-2 rounded-full text-base font-medium">
                      <Layers className="h-5 w-5" />
                      {roadmap.nodeCount} topics
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
        )
      ) : (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-start overflow-auto">
          {/* Top nav inside expanded view */}
          <div className="w-full flex items-center justify-between px-8 py-6 border-b bg-background sticky top-0 z-10">
            <h2 className="text-2xl font-bold">{expandedRoadmap.name} Roadmap</h2>
            <button
              className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
          <div className="w-full max-w-5xl mx-auto px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading roadmap...</span>
              </div>
            ) : graphData ? (
              <RoadmapFlowchart
                nodes={graphData.nodes}
                edges={graphData.edges}
                roadmapId={expandedRoadmap.slug}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No graph data available for this roadmap yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {roadmaps.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No roadmaps available</h3>
          <p className="text-muted-foreground">
            Roadmaps will appear here once they are added to the system.
          </p>
        </Card>
      )}
    </div>
  );
}

export default ExplorePage;
