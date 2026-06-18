import { useState, useEffect } from 'react';
import { 
  fetchPlannerSnapshot, 
  completeTask as apiCompleteTask, 
  updateTaskProgress as apiUpdateTaskProgress,
  recomputeSchedule as apiRecomputeSchedule
} from './plannerApi';
import type { ScheduledTask, PlannerData } from '@/types/planner';

export interface Roadmap {
  id: string;
  title: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface ScheduleState {
  tasks: ScheduledTask[];
  roadmaps: Roadmap[];
  plannerData: PlannerData | null;
  loading: boolean;
  error: string | null;
}

type Listener = (state: ScheduleState) => void;

class ScheduleStore {
  private state: ScheduleState = {
    tasks: [],
    roadmaps: [],
    plannerData: null,
    loading: false,
    error: null,
  };

  private listeners = new Set<Listener>();

  getState(): ScheduleState {
    return this.state;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private deriveRoadmaps(tasks: ScheduledTask[]): Roadmap[] {
    const roadmapMap = new Map<string, { id: string; title: string; total: number; completed: number }>();

    tasks.forEach((t) => {
      const gId = t.goalId || 'general';
      const existing = roadmapMap.get(gId) || { id: gId, title: t.goalId || 'General Plan', total: 0, completed: 0 };
      existing.total += 1;
      if (t.status === 'completed') {
        existing.completed += 1;
      }
      roadmapMap.set(gId, existing);
    });

    return Array.from(roadmapMap.values()).map((r) => ({
      id: r.id,
      title: r.title,
      totalTasks: r.total,
      completedTasks: r.completed,
      progress: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
    }));
  }

  async load() {
    this.state.loading = true;
    this.notify();

    try {
      const planner = await fetchPlannerSnapshot();
      const allTasks = planner.scheduleDays.flatMap((d) => d.tasks);
      this.state.tasks = allTasks;
      this.state.plannerData = planner;
      this.state.roadmaps = this.deriveRoadmaps(allTasks);
      this.state.error = null;
    } catch (err) {
      console.error('Failed to load scheduleStore:', err);
      this.state.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  async completeTask(taskId: string, input?: any) {
    // 1. Instantly update status of task in state to completed
    const updatedTasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          completedDate: new Date(),
        };
      }
      return t;
    });

    // 2. Auto-activate next task locally for instant response
    const nextPending = updatedTasks.find(
      (t) => t.status === 'pending' && t.id !== taskId
    );
    if (nextPending) {
      nextPending.status = 'in-progress' as const;
    }

    this.state.tasks = updatedTasks;
    this.state.roadmaps = this.deriveRoadmaps(updatedTasks);
    this.notify();

    // 3. Call backend api to complete
    await apiCompleteTask(taskId, input);

    // 4. Trigger recomputation and next task activation
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task && task.goalId) {
      await apiRecomputeSchedule(task.goalId, 'task-complete');
    }

    // 5. Reload full state from backend to stay in sync
    await this.load();
  }

  async updateTaskProgress(taskId: string, watchedMinutes: number, percentComplete: number) {
    // Instantly update local progress
    this.state.tasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: percentComplete >= 100 ? ('completed' as const) : ('in-progress' as const),
          partialProgress: percentComplete,
          actualMinutes: watchedMinutes,
        };
      }
      return t;
    });
    this.state.roadmaps = this.deriveRoadmaps(this.state.tasks);
    this.notify();

    await apiUpdateTaskProgress(taskId, watchedMinutes, percentComplete);
  }
}

export const scheduleStore = new ScheduleStore();

export function useScheduleStore() {
  const [state, setState] = useState(() => scheduleStore.getState());

  useEffect(() => {
    return scheduleStore.subscribe((nextState) => {
      setState({ ...nextState });
    });
  }, []);

  return {
    ...state,
    load: () => scheduleStore.load(),
    completeTask: (taskId: string, input?: any) => scheduleStore.completeTask(taskId, input),
    updateTaskProgress: (taskId: string, watchedMinutes: number, percentComplete: number) => 
      scheduleStore.updateTaskProgress(taskId, watchedMinutes, percentComplete),
  };
}
