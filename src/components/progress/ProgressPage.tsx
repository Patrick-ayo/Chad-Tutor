import { useEffect, useState } from "react";
import { fetchProgressSummary, type ProgressSummary } from "@/lib/plannerApi";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Clock, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

import { useAuth } from "@clerk/clerk-react";

export function ProgressPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // Detect dark mode for recharts
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    // Setup observer for class changes on html
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const loadData = async () => {
    try {
      const summary = await fetchProgressSummary();
      if (summary) {
        setData(summary);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    
    loadData();

    const onFocus = () => {
      loadData();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isLoaded]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-500 dark:text-slate-400">Loading progress...</div>;
  }

  if (!data || data.totalMinutes === 0) {
    return (
      <div className="flex flex-col flex-1 h-full w-full bg-slate-50 dark:bg-[#0B0C10] text-slate-800 dark:text-slate-200 overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto p-6 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-2xl p-8 max-w-lg text-center shadow-sm dark:shadow-xl">
            <BarChart3 className="w-16 h-16 mx-auto mb-6 text-slate-300 dark:text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No progress data yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              There is nothing here yet! Start a learning session, build a goal roadmap, or complete some tasks to see your progress build up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default">
                <Link to="/goals">Build a Goal</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/schedule">View Schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lastActualDate = data.dailyActivity.length > 0 
    ? new Date(data.dailyActivity[data.dailyActivity.length - 1].date)
    : new Date();
    
  // Find start date from 90 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  
  const endDate = new Date(Math.max(
    new Date(data.projectedCompletion.originalDeadline).getTime(),
    new Date(data.projectedCompletion.projectedDate).getTime(),
    lastActualDate.getTime()
  ));
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const totalDaysToDeadline = Math.max(1, Math.ceil((new Date(data.projectedCompletion.originalDeadline).getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const plannedDailyIncrement = data.totalMinutes / totalDaysToDeadline;

  const fullGraphData = [];
  let runningActual = 0;
  let runningPlanned = 0;
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const historyDay = data.dailyActivity.find(d => d.date === dateStr);
    
    if (historyDay) {
      runningActual += historyDay.completedMinutes;
    } else if (currentDate > lastActualDate) {
      runningActual += data.pace.actualPerDay;
    }
    
    runningPlanned = Math.min(data.totalMinutes, Math.round(plannedDailyIncrement * i));
    
    const isPastProjected = runningActual >= data.totalMinutes && currentDate > new Date(data.projectedCompletion.projectedDate);
    const isPastDeadline = runningPlanned >= data.totalMinutes && currentDate > new Date(data.projectedCompletion.originalDeadline);
    
    fullGraphData.push({
      date: dateStr,
      planned: runningPlanned,
      actual: Math.min(data.totalMinutes, Math.round(runningActual)),
      isFuture: currentDate > lastActualDate
    });
    
    if (isPastProjected && isPastDeadline) {
      if (i > totalDaysToDeadline + 5) break; 
    }
  }

  const getPaceColor = (trend: string) => {
    switch (trend) {
      case 'ahead': return 'text-green-600 dark:text-green-500';
      case 'on_track': return 'text-blue-600 dark:text-blue-500';
      case 'behind': return 'text-amber-600 dark:text-yellow-500';
      case 'critical': return 'text-red-600 dark:text-red-500';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getPaceBgColor = (trend: string) => {
    switch (trend) {
      case 'ahead': return 'bg-green-500';
      case 'on_track': return 'bg-blue-500';
      case 'behind': return 'bg-amber-500 dark:bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getSubjectColor = (percent: number) => {
    if (percent < 25) return 'bg-red-500';
    if (percent < 50) return 'bg-orange-500 dark:bg-amber-500';
    if (percent < 75) return 'bg-amber-400 dark:bg-yellow-500';
    if (percent < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getHeatmapClass = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-100 dark:bg-[#1a1a2e]';
      case 1: return 'bg-red-200 dark:bg-[#8b0000]';
      case 2: return 'bg-red-400 dark:bg-[#ff6b6b]';
      case 3: return 'bg-amber-400 dark:bg-[#ffd93d]';
      case 4: return 'bg-green-500 dark:bg-[#6bcb77]';
      case 5: return ''; 
      default: return 'bg-slate-100 dark:bg-[#1a1a2e]';
    }
  };

  const monthsMap = new Map<string, { label: string; year: number; month: number; days: any[] }>();

  if (data?.dailyActivity?.length > 0) {
    data.dailyActivity.forEach(day => {
      const [yearStr, monthStr] = day.date.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1; 
      
      const yearMonthKey = `${year}-${monthIndex}`;
      const dObj = new Date(year, monthIndex, 1);
      const monthLabel = dObj.toLocaleDateString('en-US', { month: 'short' });

      if (!monthsMap.has(yearMonthKey)) {
        monthsMap.set(yearMonthKey, {
          label: monthLabel,
          year,
          month: monthIndex,
          days: []
        });
      }
      monthsMap.get(yearMonthKey)!.days.push(day);
    });
  }

  const monthsList = Array.from(monthsMap.values());

  const todayStr = new Date().toISOString().split('T')[0];
  const expectedToDate = data?.dailyActivity
    .filter(d => d.date <= todayStr)
    .reduce((sum, d) => sum + d.plannedMinutes, 0) || 0;
  const expectedPercent = data?.totalMinutes > 0 ? Math.min(100, (expectedToDate / data.totalMinutes) * 100) : 0;
  const actualPercent = Math.min(100, Math.max(0, data?.overallPercent || 0));

  const gridColor = isDark ? "#ffffff10" : "#00000010";
  const axisColor = isDark ? "#ffffff40" : "#00000040";
  const tickColor = isDark ? "#ffffff60" : "#00000060";

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-50 dark:bg-[#0B0C10] text-slate-800 dark:text-slate-200 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto p-6 space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Progress Dashboard</h1>
        </div>

        {/* SECTION 1: OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Video size={18} />
              <span className="font-medium">Videos</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.watchedVideos} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {data.totalVideos}</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500 mt-auto">watched</div>
          </div>

          <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock size={18} />
              <span className="font-medium">Hours</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(data.completedMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {(data.totalMinutes / 60).toFixed(1)} hrs</span>
            </div>
            <div className="text-sm text-slate-500 mt-auto">completed</div>
          </div>

          <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingUp size={18} />
              <span className="font-medium">Pace</span>
            </div>
            <div className={`text-2xl font-bold capitalize ${getPaceColor(data.pace.trend)}`}>
              {data.pace.trend.replace('_', ' ')}
            </div>
            <div className="text-sm text-slate-500 mt-auto">
              {data.pace.ratio >= 1 
                ? `+${Math.round((data.pace.ratio - 1) * 100)}% faster` 
                : `${Math.round((1 - data.pace.ratio) * 100)}% slower`}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar size={18} />
              <span className="font-medium">On Track</span>
            </div>
            <div className={`text-2xl font-bold ${data.projectedCompletion.onTrack ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {new Date(data.projectedCompletion.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-slate-500 mt-auto">
              projected completion
            </div>
          </div>
        </div>

        {/* SECTION 2: OVERALL PROGRESS BAR */}
        <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Overall Progress</h2>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{actualPercent}%</span>
              <span className="text-xs text-slate-500 ml-2 font-medium">({Math.round(expectedPercent)}% expected)</span>
            </div>
          </div>
          <div className="h-4 w-full bg-slate-100 dark:bg-[#0B0C10] rounded-full overflow-hidden border border-slate-200 dark:border-white/5 relative">
            
            {/* Projected progress background (Light Red) */}
            <div 
              className="absolute top-0 left-0 h-full bg-red-200 dark:bg-red-900/40 z-10 transition-all duration-1000 ease-out"
              style={{ width: `${expectedPercent}%` }}
            />

            {/* Actual progress */}
            {actualPercent <= expectedPercent ? (
              <div 
                className={`absolute top-0 left-0 h-full z-20 transition-all duration-1000 ease-out rounded-r-md ${
                  actualPercent < expectedPercent * 0.5 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${actualPercent}%` }}
              />
            ) : (
              <>
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 z-20 transition-all duration-1000 ease-out"
                  style={{ width: `${expectedPercent}%` }}
                />
                <div 
                  className="absolute top-0 h-full z-30 transition-all duration-1000 ease-out rounded-r-md"
                  style={{ 
                    left: `${expectedPercent}%`, 
                    width: `${actualPercent - expectedPercent}%`,
                    background: 'radial-gradient(circle at 30% 30%, #fff 0%, #fbbf24 30%, #b45309 100%)',
                    boxShadow: '0 0 4px #fbbf24'
                  }}
                />
              </>
            )}
          </div>
          <div className="flex justify-between mt-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{data.completedMinutes}min of {data.totalMinutes}min completed</span>
            <span>{data.watchedVideos} of {data.totalVideos} videos watched</span>
          </div>
        </div>

        {/* SECTION 3: ACTIVITY HEATMAP */}
        <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Activity</h2>
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { label: "No task", intensity: 0 },
                { label: "Missed tasks", intensity: 1 },
                { label: "Not completed", intensity: 2 },
                { label: "Pending", intensity: 3 },
                { label: "Completed", intensity: 4 },
                { label: "Pushed limits! ✨", intensity: 5 },
              ].map(({ label, intensity }) => {
                const isGolden = intensity === 5;
                const goldenStyle = {
                  background: 'radial-gradient(circle at 30% 30%, #fff 0%, #fbbf24 30%, #b45309 100%)',
                  boxShadow: '0 0 4px #fbbf24'
                };
                return (
                  <div 
                    key={intensity} 
                    className={`w-4 h-4 rounded-sm relative group cursor-help ${isGolden ? '' : getHeatmapClass(intensity)} ${isGolden ? '' : 'border border-black/5 dark:border-transparent'}`}
                    style={isGolden ? goldenStyle : undefined}
                  >
                    {isGolden && <span className="absolute -top-1 -right-1 text-[8px] pointer-events-none">✨</span>}
                    
                    <div className="absolute bottom-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mb-2 w-max px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-800 dark:text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-200 dark:border-white/10">
                      {label}
                      <div className="absolute top-full right-2 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-800 drop-shadow"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex overflow-x-auto pb-4 custom-scrollbar gap-4">
            {/* Day labels column */}
            <div className="flex flex-col gap-1.5 pt-6 text-[10px] text-slate-400 dark:text-slate-500 font-medium pr-1 sticky left-0 bg-white dark:bg-[#1C1D24] z-10">
              <div className="h-4 flex items-center">Sun</div>
              <div className="h-4 flex items-center">Mon</div>
              <div className="h-4 flex items-center">Tue</div>
              <div className="h-4 flex items-center">Wed</div>
              <div className="h-4 flex items-center">Thu</div>
              <div className="h-4 flex items-center">Fri</div>
              <div className="h-4 flex items-center">Sat</div>
            </div>

            {(() => {
              // Filter out months that have no activity, keeping at least the current month
              const currentYearMonth = `${new Date().getFullYear()}-${new Date().getMonth()}`;
              const filteredMonths = monthsList.filter(m => {
                if (`${m.year}-${m.month}` === currentYearMonth) return true;
                return m.days.some(d => d.intensity > 0 || d.plannedMinutes > 0 || d.completedMinutes > 0);
              });

              return filteredMonths.map((m, idx) => {
                const firstDayOffset = new Date(m.year, m.month, 1).getDay();
                const totalDays = new Date(m.year, m.month + 1, 0).getDate();
                const totalCells = Math.ceil((firstDayOffset + totalDays) / 7) * 7;
                
                const cells = Array.from({ length: totalCells }, (_, i) => {
                  if (i < firstDayOffset || i >= firstDayOffset + totalDays) return null; // padding
                  const dayOfMonth = i - firstDayOffset + 1;
                  const d = m.days.find(x => {
                    const [, , dStr] = x.date.split('-');
                    return parseInt(dStr, 10) === dayOfMonth;
                  });
                  return d || { empty: true, date: `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}` };
                });

                const weeks = [];
                for (let i = 0; i < cells.length; i += 7) {
                  weeks.push(cells.slice(i, i + 7));
                }

                return (
                  <div key={idx} className="flex flex-col gap-1 min-w-max">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{m.label}</span>
                    <div className="flex gap-1.5">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1.5">
                          {week.map((cell, cIdx) => {
                            if (!cell) return <div key={cIdx} className="w-4 h-4 bg-transparent" />;
                            
                            const isGolden = cell.intensity === 5;
                            const goldenStyle = {
                              background: 'radial-gradient(circle at 30% 30%, #fff 0%, #fbbf24 30%, #b45309 100%)',
                              boxShadow: '0 0 6px #fbbf24, inset 0 0 2px #fff'
                            };

                            const isTopHalf = cIdx < 3;

                            return (
                              <div 
                                key={cIdx} 
                                className={`w-4 h-4 rounded-sm cursor-pointer transition-all relative group ${
                                  cell.empty ? '' : 'hover:ring-1 hover:ring-slate-400 dark:hover:ring-white/50'
                                } ${isGolden ? 'animate-pulse' : ''} ${!isGolden && !cell.empty ? getHeatmapClass(cell.intensity) : ''} ${cell.empty ? 'bg-slate-50 dark:bg-[#111218] border border-slate-100 dark:border-transparent' : 'border border-black/5 dark:border-transparent'}`}
                                style={isGolden ? goldenStyle : undefined}
                              >
                                {!cell.empty && (
                                  <div className={`absolute left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-200 dark:border-white/10 ${isTopHalf ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                                    <div className="font-semibold mb-1">
                                      {(() => {
                                        const [y, mStr, dStr] = cell.date.split('-');
                                        return new Date(parseInt(y), parseInt(mStr)-1, parseInt(dStr)).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                                      })()}
                                    </div>
                                    <div>Planned: {cell.plannedMinutes} min</div>
                                    <div>Completed: {cell.completedMinutes} min</div>
                                    <div className="mt-1 font-medium capitalize opacity-80 text-[10px]">
                                      {cell.intensity === 0 && "No task scheduled"}
                                      {cell.intensity === 1 && "Missed tasks"}
                                      {cell.intensity === 2 && "Not completed"}
                                      {cell.intensity === 3 && "Pending"}
                                      {cell.intensity === 4 && "Completed"}
                                      {cell.intensity === 5 && "Pushed limits! ✨"}
                                    </div>
                                    <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent drop-shadow ${isTopHalf ? 'bottom-full border-b-white dark:border-b-slate-800' : 'top-full border-t-white dark:border-t-slate-800'}`}></div>
                                  </div>
                                )}
                                
                                {isGolden && (
                                  <span className="absolute -top-1 -right-1 text-[8px] pointer-events-none">✨</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* SECTION 4: SUBJECT PROGRESS */}
        <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Subject Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.subjects.map(subject => (
              <div key={subject.topicId} className="bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/5 rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group">
                <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 dark:opacity-10 transition-opacity group-hover:opacity-30 dark:group-hover:opacity-20 ${getSubjectColor(subject.percent)}`}></div>
                
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-4" title={subject.topicName}>{subject.topicName}</h3>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{subject.percent}%</span>
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {subject.watchedVideos}/{subject.totalVideos} videos
                </div>
                
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full ${getSubjectColor(subject.percent)} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, subject.percent))}%` }}
                  />
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase tracking-wider">
                    {subject.status.replace('_', ' ')}
                  </span>
                  
                  <button disabled className="text-sm font-medium text-slate-400 dark:text-slate-500 transition-colors cursor-not-allowed flex items-center gap-1">
                    Manage <span className="text-[10px]">▸</span>
                  </button>
                </div>
              </div>
            ))}
            
            {data.subjects.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                No subjects found. Start scheduling tasks to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: PROJECTED SCHEDULE GRAPH */}
        <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Projected Schedule</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fullGraphData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke={axisColor} 
                  tick={{ fill: tickColor, fontSize: 12 }} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  minTickGap={30}
                />
                <YAxis 
                  stroke={axisColor} 
                  tick={{ fill: tickColor, fontSize: 12 }} 
                  tickFormatter={(val) => `${Math.round(val / 60)}h`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1C1D24' : '#ffffff', 
                    borderColor: isDark ? '#ffffff20' : '#e2e8f0', 
                    color: isDark ? '#fff' : '#0f172a', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                  }}
                  labelFormatter={(val) => new Date(val as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  formatter={(value: number, name: string) => [`${Math.round(value)} min`, name === 'planned' ? 'Planned Trajectory' : 'Actual Trajectory']}
                />
                <ReferenceLine 
                  y={data.totalMinutes} 
                  stroke={axisColor} 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'Target Goal', fill: tickColor, fontSize: 12 }} 
                />
                <ReferenceLine 
                  x={new Date().toISOString().split('T')[0]} 
                  stroke={axisColor} 
                  label={{ position: 'insideTopLeft', value: 'Today', fill: tickColor, fontSize: 12 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                  name="planned"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke={data.projectedCompletion.onTrack ? '#22c55e' : '#ef4444'} 
                  strokeWidth={3} 
                  dot={false}
                  name="actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 6: PACE INDICATOR */}
        <div className="bg-white dark:bg-[#1C1D24] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Your Learning Pace</h2>
          
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span>Planned: {data.pace.plannedPerDay} min/day</span>
            <span>Actual: {data.pace.actualPerDay} min/day</span>
          </div>
          
          <div className="relative h-6 w-full bg-slate-100 dark:bg-[#0B0C10] rounded-full overflow-hidden border border-slate-200 dark:border-white/5 mb-2">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-white/20 z-10"></div>
            
            <div 
              className={`absolute left-0 top-0 bottom-0 ${getPaceBgColor(data.pace.trend)} opacity-80 transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(100, (data.pace.ratio / 2) * 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-6 px-1">
            <span>0</span>
            <span className="text-slate-600 dark:text-slate-300">Target</span>
            <span>2x</span>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/5">
            {data.pace.trend === 'ahead' && <CheckCircle className="text-green-500 shrink-0" size={24} />}
            {data.pace.trend === 'on_track' && <CheckCircle className="text-blue-500 shrink-0" size={24} />}
            {data.pace.trend === 'behind' && <AlertTriangle className="text-amber-500 dark:text-yellow-500 shrink-0" size={24} />}
            {data.pace.trend === 'critical' && <AlertCircle className="text-red-500 shrink-0" size={24} />}
            
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {data.pace.trend === 'ahead' && "You're ahead of schedule! 🏆"}
              {data.pace.trend === 'on_track' && "You're on track. Keep it up! ✅"}
              {data.pace.trend === 'behind' && "You're falling behind. Consider increasing daily study time. ⚠️"}
              {data.pace.trend === 'critical' && "Critical: At this pace you will miss your deadline. ❗"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
