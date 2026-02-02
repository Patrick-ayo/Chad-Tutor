import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Skull,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  AccuracyDataPoint,
  AccuracyInterpretation,
  TopicMastery,
  TrendDirection,
} from "@/types/analytics";

interface AccuracySectionProps {
  accuracyTrend: AccuracyDataPoint[];
  interpretation: AccuracyInterpretation;
  topicMastery: TopicMastery[];
}

function TrendIcon({ trend, size = 4 }: { trend: TrendDirection; size?: number }) {
  const className = `h-${size} w-${size}`;
  switch (trend) {
    case "up":
      return <TrendingUp className={`${className} text-green-600`} />;
    case "down":
      return <TrendingDown className={`${className} text-red-600`} />;
    default:
      return <Minus className={`${className} text-gray-400`} />;
  }
}

function AccuracyTrendChart({
  data,
  interpretation,
}: {
  data: AccuracyDataPoint[];
  interpretation: AccuracyInterpretation;
}) {
  const getPatternColor = () => {
    switch (interpretation.pattern) {
      case "mastery":
        return "bg-green-50 border-green-200 text-green-800";
      case "learning":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "plateau":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "confusion":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "disengagement":
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  const patternLabels = {
    mastery: "📈 Mastery Pattern",
    learning: "📚 Active Learning",
    plateau: "⚠️ Plateau Detected",
    confusion: "🤔 Confusion Pattern",
    disengagement: "⚠️ Disengagement Risk",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Accuracy Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#94a3b8"
                strokeWidth={1}
                dot={{ r: 2 }}
                name="Raw"
              />
              <Line
                type="monotone"
                dataKey="smoothedAccuracy"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Trend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation */}
        <div className={`mt-4 p-3 rounded-lg border ${getPatternColor()}`}>
          <p className="font-semibold text-sm mb-1">
            {patternLabels[interpretation.pattern]}
          </p>
          <p className="text-xs opacity-80 mb-2">{interpretation.description}</p>
          <p className="text-xs font-medium">
            💡 {interpretation.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TopicMasteryTable({ topics }: { topics: TopicMastery[] }) {
  const getStatusBadge = (topic: TopicMastery) => {
    switch (topic.status) {
      case "mastered":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mastered
          </Badge>
        );
      case "learning":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <TrendingUp className="h-3 w-3 mr-1" />
            Learning
          </Badge>
        );
      case "struggling":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Struggling
          </Badge>
        );
      case "dangerous":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Skull className="h-3 w-3 mr-1" />
            Dangerous
          </Badge>
        );
    }
  };

  // Sort by priority: dangerous first, then struggling, etc.
  const sortedTopics = [...topics].sort((a, b) => {
    const priority = { dangerous: 0, struggling: 1, learning: 2, mastered: 3 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Topic Mastery</CardTitle>
          <p className="text-xs text-gray-500">
            {topics.filter((t) => t.status === "dangerous").length} dangerous topics
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedTopics.map((topic) => (
            <div
              key={topic.topicId}
              className={`p-3 rounded-lg border ${
                topic.confidenceMismatch
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{topic.topicName}</p>
                  {topic.parentTopic && (
                    <p className="text-xs text-gray-500">{topic.parentTopic}</p>
                  )}
                </div>
                {getStatusBadge(topic)}
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Accuracy</p>
                  <p className="font-semibold">{topic.accuracy}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Confidence</p>
                  <p className="font-semibold capitalize">{topic.confidence}</p>
                </div>
                <div>
                  <p className="text-gray-500">Attempts</p>
                  <p className="font-semibold">{topic.attemptCount}</p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-gray-500">Trend</p>
                  <TrendIcon trend={topic.trend} size={3} />
                </div>
              </div>

              {topic.confidenceMismatch && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-700">
                  <AlertCircle className="h-3 w-3" />
                  High confidence but low accuracy — review needed
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AccuracySection({
  accuracyTrend,
  interpretation,
  topicMastery,
}: AccuracySectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Accuracy & Mastery</h2>
        <p className="text-sm text-gray-500">Learning, not activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccuracyTrendChart data={accuracyTrend} interpretation={interpretation} />
        <TopicMasteryTable topics={topicMastery} />
      </div>
    </section>
  );
}
