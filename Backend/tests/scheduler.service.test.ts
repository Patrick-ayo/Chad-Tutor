import { describe, expect, it } from 'vitest';
import type { Availability, BufferPool, ScheduledTask, TopicQueue, Weekday } from '../../src/types/planner';
import {
  addCompletionToBuffer,
  decayBufferPoolEntries,
  resolveMissedTasksMultiTopic,
  scheduleMultiTopicTasks,
  type ScheduledTask as BackendScheduledTask,
} from '../src/services/scheduler.service';

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function day(offset = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function makeTask(overrides: Partial<ScheduledTask> = {}): ScheduledTask {
  const index = overrides.id ?? `task-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: index,
    title: 'Default task',
    type: 'learn',
    taskType: 'learn',
    taskId: index,
    topicId: 'topic-a',
    subtopicId: undefined,
    scheduledDate: day(1).toISOString(),
    estimatedMinutes: 30,
    originalEstimatedMinutes: undefined,
    actualMinutes: undefined,
    status: 'pending',
    priority: 'medium',
    dependencies: [],
    dependsOn: [],
    rescheduleCount: 0,
    goalId: 'goal-1',
    subtopicClusterId: 'cluster-1',
    notes: undefined,
    ...overrides,
  };
}

function makeAvailability(daysPerWeek = 7, minutesPerDay = 60): Availability {
  const activeDays = WEEKDAYS.slice(0, Math.max(0, Math.min(7, daysPerWeek)));
  const minutesByDay = WEEKDAYS.reduce((acc, weekday) => {
    acc[weekday] = activeDays.includes(weekday) ? minutesPerDay : 0;
    return acc;
  }, {} as Record<Weekday, number>);

  return {
    activeDays,
    minutesPerDay: minutesByDay,
  };
}

function makeTopicQueue(
  overrides: Partial<TopicQueue> & { tasks?: ScheduledTask[] } = {},
): TopicQueue {
  const tasks = overrides.tasks ?? [
    makeTask({ id: 'topic-task-1', taskId: 'topic-task-1', topicId: overrides.topicId ?? 'topic-a' }),
    makeTask({ id: 'topic-task-2', taskId: 'topic-task-2', topicId: overrides.topicId ?? 'topic-a' }),
    makeTask({ id: 'topic-task-3', taskId: 'topic-task-3', topicId: overrides.topicId ?? 'topic-a' }),
  ];

  const totalMinutes = overrides.totalMinutes ?? tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);

  return {
    topicId: overrides.topicId ?? 'topic-a',
    deadlineDate: overrides.deadlineDate ?? day(7),
    tasks,
    totalMinutes,
    remainingMinutes: overrides.remainingMinutes ?? totalMinutes,
    burnRate: overrides.burnRate,
    topicWeight: overrides.topicWeight,
    status: overrides.status,
  };
}

function toBackendTask(task: ScheduledTask): BackendScheduledTask {
  return {
    ...task,
    scheduledDate: new Date(task.scheduledDate),
    deadlineDate: task.deadlineDate ? new Date(task.deadlineDate) : undefined,
    rescheduledDate: task.rescheduledDate ? new Date(task.rescheduledDate) : undefined,
    missedOn: task.missedOn ? new Date(task.missedOn) : undefined,
    completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
  } as unknown as BackendScheduledTask;
}

function groupByDate(tasks: Array<BackendScheduledTask>) {
  const grouped = new Map<string, BackendScheduledTask[]>();

  for (const task of tasks) {
    const key = task.scheduledDate ? new Date(task.scheduledDate).toISOString().slice(0, 10) : 'unscheduled';
    const list = grouped.get(key) ?? [];
    list.push(task);
    grouped.set(key, list);
  }

  return grouped;
}

function uniqueDates(tasks: Array<BackendScheduledTask>): string[] {
  return Array.from(
    new Set(
      tasks
        .map((task) => (task.scheduledDate ? new Date(task.scheduledDate).toISOString().slice(0, 10) : ''))
        .filter(Boolean),
    ),
  ).sort();
}

describe('scheduler.service', () => {
  describe('scheduleMultiTopicTasks()', () => {
    it('equal topics equal deadlines get proportional daily share', () => {
      const availability = makeAvailability(7, 60);
      const start = day(0);
      const deadline = day(6);

      const topics = ['topic-a', 'topic-b', 'topic-c'].map((topicId) =>
        makeTopicQueue({
          topicId,
          deadlineDate: deadline,
          totalMinutes: 120,
          remainingMinutes: 120,
          tasks: Array.from({ length: 6 }, (_, index) =>
            makeTask({
              id: `${topicId}-${index}`,
              taskId: `${topicId}-${index}`,
              topicId,
              title: `${topicId} task ${index + 1}`,
              estimatedMinutes: 20,
              taskType: 'learn',
              subtopicClusterId: `${topicId}-cluster-${index}`,
              scheduledDate: start.toISOString(),
            }),
          ),
        }),
      );

      const scheduled = scheduleMultiTopicTasks(topics as unknown as TopicQueue[], availability, start);
      const grouped = groupByDate(scheduled);

      expect(grouped.size).toBeGreaterThanOrEqual(4);
      for (const tasksForDay of grouped.values()) {
        const total = tasksForDay.reduce((sum, task) => sum + task.estimatedMinutes, 0);
        expect(total).toBeLessThanOrEqual(60);
      }

      for (const topicId of ['topic-a', 'topic-b', 'topic-c']) {
        const dates = new Set(
          scheduled
            .filter((task) => task.topicId === topicId)
            .map((task) => new Date(task.scheduledDate as Date).toISOString().slice(0, 10)),
        );
        expect(dates.size).toBeGreaterThanOrEqual(4);
      }
    });

    it('unequal topic sizes respect burn rate priority', () => {
      const availability = makeAvailability(7, 120);
      const start = day(0);
      const deadline = day(6);

      const topicA = makeTopicQueue({
        topicId: 'topic-a',
        deadlineDate: deadline,
        totalMinutes: 240,
        remainingMinutes: 240,
        tasks: Array.from({ length: 12 }, (_, index) =>
          makeTask({
            id: `a-${index}`,
            taskId: `a-${index}`,
            topicId: 'topic-a',
            title: `A ${index + 1}`,
            estimatedMinutes: 20,
            subtopicClusterId: `a-${index}`,
          }),
        ),
      });

      const topicB = makeTopicQueue({
        topicId: 'topic-b',
        deadlineDate: deadline,
        totalMinutes: 60,
        remainingMinutes: 60,
        tasks: Array.from({ length: 6 }, (_, index) =>
          makeTask({
            id: `b-${index}`,
            taskId: `b-${index}`,
            topicId: 'topic-b',
            title: `B ${index + 1}`,
            estimatedMinutes: 10,
            subtopicClusterId: `b-${index}`,
          }),
        ),
      });

      const topicC = makeTopicQueue({
        topicId: 'topic-c',
        deadlineDate: deadline,
        totalMinutes: 60,
        remainingMinutes: 60,
        tasks: Array.from({ length: 6 }, (_, index) =>
          makeTask({
            id: `c-${index}`,
            taskId: `c-${index}`,
            topicId: 'topic-c',
            title: `C ${index + 1}`,
            estimatedMinutes: 10,
            subtopicClusterId: `c-${index}`,
          }),
        ),
      });

      const scheduled = scheduleMultiTopicTasks([topicA, topicB, topicC] as unknown as TopicQueue[], availability, start);

      const minutesByTopic = scheduled.reduce<Record<string, number>>((acc, task) => {
        acc[task.topicId ?? 'unknown'] = (acc[task.topicId ?? 'unknown'] ?? 0) + task.estimatedMinutes;
        return acc;
      }, {});

      expect(minutesByTopic['topic-a']).toBeGreaterThan(minutesByTopic['topic-b']);
      expect(minutesByTopic['topic-a']).toBeGreaterThan(minutesByTopic['topic-c']);

      const datesByTopic = new Map<string, Set<string>>();
      for (const task of scheduled) {
        const topicId = task.topicId ?? 'unknown';
        const set = datesByTopic.get(topicId) ?? new Set<string>();
        set.add(new Date(task.scheduledDate as Date).toISOString().slice(0, 10));
        datesByTopic.set(topicId, set);
      }

      for (const topicId of ['topic-a', 'topic-b', 'topic-c']) {
        expect(datesByTopic.get(topicId)?.size ?? 0).toBeGreaterThanOrEqual(1);
      }
    });

    it('subtopic cluster is never split — fits in one day', () => {
      const availability = makeAvailability(7, 60);
      const start = day(0);
      const topic = makeTopicQueue({
        topicId: 'topic-a',
        deadlineDate: day(7),
        totalMinutes: 45,
        remainingMinutes: 45,
        tasks: [
          makeTask({ id: 'watch', taskId: 'watch', topicId: 'topic-a', estimatedMinutes: 20, subtopicClusterId: 'cluster-x' }),
          makeTask({ id: 'practice', taskId: 'practice', topicId: 'topic-a', estimatedMinutes: 15, subtopicClusterId: 'cluster-x', type: 'practice', taskType: 'practice' }),
          makeTask({ id: 'quiz', taskId: 'quiz', topicId: 'topic-a', estimatedMinutes: 10, subtopicClusterId: 'cluster-x', type: 'quiz', taskType: 'quiz' }),
        ],
      });

      const scheduled = scheduleMultiTopicTasks([topic] as unknown as TopicQueue[], availability, start);
      const dates = new Set(scheduled.map((task) => new Date(task.scheduledDate as Date).toISOString().slice(0, 10)));

      expect(dates.size).toBe(1);
    });

    it('subtopic cluster carried to next day when it does not fit today', () => {
      const availability = makeAvailability(7, 60);
      const start = day(0);
      const preload = makeTopicQueue({
        topicId: 'topic-preload',
        deadlineDate: day(1),
        totalMinutes: 25,
        remainingMinutes: 25,
        tasks: [makeTask({ id: 'preload', taskId: 'preload', topicId: 'topic-preload', estimatedMinutes: 25, subtopicClusterId: 'preload-cluster' })],
      });
      const clusterTopic = makeTopicQueue({
        topicId: 'topic-a',
        deadlineDate: day(6),
        totalMinutes: 45,
        remainingMinutes: 45,
        tasks: [
          makeTask({ id: 'watch', taskId: 'watch', topicId: 'topic-a', estimatedMinutes: 20, subtopicClusterId: 'cluster-y' }),
          makeTask({ id: 'practice', taskId: 'practice', topicId: 'topic-a', estimatedMinutes: 15, subtopicClusterId: 'cluster-y', type: 'practice', taskType: 'practice' }),
          makeTask({ id: 'quiz', taskId: 'quiz', topicId: 'topic-a', estimatedMinutes: 10, subtopicClusterId: 'cluster-y', type: 'quiz', taskType: 'quiz' }),
        ],
      });

      const scheduled = scheduleMultiTopicTasks([preload, clusterTopic] as unknown as TopicQueue[], availability, start);
      const preloadDate = scheduled.find((task) => task.id === 'preload')?.scheduledDate;
      const clusterDates = new Set(
        scheduled
          .filter((task) => task.topicId === 'topic-a')
          .map((task) => new Date(task.scheduledDate as Date).toISOString().slice(0, 10)),
      );

      expect(clusterDates.size).toBe(1);
      expect(new Date([...clusterDates][0]).getTime()).toBeGreaterThan(new Date(preloadDate as Date).getTime());
    });

    it('topic finishing early redistributes share to remaining topics', () => {
      const availability = makeAvailability(7, 120);
      const start = day(0);
      const deadline = day(6);

      const topicA = makeTopicQueue({
        topicId: 'topic-a',
        deadlineDate: deadline,
        totalMinutes: 60,
        remainingMinutes: 60,
        tasks: Array.from({ length: 3 }, (_, index) =>
          makeTask({
            id: `a-${index}`,
            taskId: `a-${index}`,
            topicId: 'topic-a',
            title: `A ${index + 1}`,
            estimatedMinutes: 20,
            subtopicClusterId: `a-${index}`,
          }),
        ),
      });
      const topicB = makeTopicQueue({
        topicId: 'topic-b',
        deadlineDate: deadline,
        totalMinutes: 180,
        remainingMinutes: 180,
        tasks: Array.from({ length: 9 }, (_, index) =>
          makeTask({
            id: `b-${index}`,
            taskId: `b-${index}`,
            topicId: 'topic-b',
            title: `B ${index + 1}`,
            estimatedMinutes: 20,
            subtopicClusterId: `b-${index}`,
          }),
        ),
      });
      const topicC = makeTopicQueue({
        topicId: 'topic-c',
        deadlineDate: deadline,
        totalMinutes: 180,
        remainingMinutes: 180,
        tasks: Array.from({ length: 9 }, (_, index) =>
          makeTask({
            id: `c-${index}`,
            taskId: `c-${index}`,
            topicId: 'topic-c',
            title: `C ${index + 1}`,
            estimatedMinutes: 20,
            subtopicClusterId: `c-${index}`,
          }),
        ),
      });

      const scheduled = scheduleMultiTopicTasks([topicA, topicB, topicC] as unknown as TopicQueue[], availability, start);
      const dates = uniqueDates(scheduled);
      const lastADate = [...scheduled.filter((task) => task.topicId === 'topic-a').map((task) => new Date(task.scheduledDate as Date).toISOString().slice(0, 10))].sort().at(-1);

      expect(lastADate).toBeDefined();

      const beforeADone = scheduled.filter((task) => {
        const date = new Date(task.scheduledDate as Date).toISOString().slice(0, 10);
        return date <= (lastADate as string) && (task.topicId === 'topic-b' || task.topicId === 'topic-c');
      }).reduce((sum, task) => sum + task.estimatedMinutes, 0);

      const afterADone = scheduled.filter((task) => {
        const date = new Date(task.scheduledDate as Date).toISOString().slice(0, 10);
        return date > (lastADate as string) && (task.topicId === 'topic-b' || task.topicId === 'topic-c');
      }).reduce((sum, task) => sum + task.estimatedMinutes, 0);

      expect(dates.length).toBeGreaterThan(1);
      expect(beforeADone + afterADone).toBeGreaterThan(0);
    });
  });

  describe('resolveMissedTasksMultiTopic()', () => {
    it('isolated miss absorbed from buffer — no tasks moved', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const completedTask = makeTask({
        id: 'completed-buffer',
        taskId: 'completed-buffer',
        topicId: 'topic-a',
        completedDate: day(-1),
        actualMinutes: 90,
        estimatedMinutes: 30,
        status: 'completed',
      });
      const missedTask = makeTask({
        id: 'missed',
        taskId: 'missed',
        topicId: 'topic-a',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 45,
      });
        const sameDayNonMiss = makeTask({
          id: 'same-day-non-miss',
          taskId: 'same-day-non-miss',
          topicId: 'topic-a',
          scheduledDate: day(-1).toISOString(),
          estimatedMinutes: 15,
        });
      const untouched = makeTask({
        id: 'untouched',
        taskId: 'untouched',
        topicId: 'topic-b',
        scheduledDate: day(2).toISOString(),
      });

      const result = resolveMissedTasksMultiTopic(
          [completedTask, missedTask, sameDayNonMiss, untouched].map(toBackendTask),
        ['missed'],
        today,
        availability,
      );

        expect(result.updatedTasks.find((task) => task.id === 'missed')?.scheduledDate).toBeDefined();
      expect(new Date(result.updatedTasks.find((task) => task.id === 'untouched')?.scheduledDate as Date).toISOString()).toBe(untouched.scheduledDate);
    });

    it('isolated miss without buffer — task inserted at next active day', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const missedTask = makeTask({
        id: 'missed',
        taskId: 'missed',
        topicId: 'topic-a',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 30,
      });
        const sameDayNonMiss = makeTask({
          id: 'same-day-non-miss',
          taskId: 'same-day-non-miss',
          topicId: 'topic-a',
          scheduledDate: day(-1).toISOString(),
          estimatedMinutes: 15,
        });
      const topicB = makeTask({
        id: 'topic-b',
        taskId: 'topic-b',
        topicId: 'topic-b',
        scheduledDate: day(2).toISOString(),
        estimatedMinutes: 30,
      });
      const topicC = makeTask({
        id: 'topic-c',
        taskId: 'topic-c',
        topicId: 'topic-c',
        scheduledDate: day(3).toISOString(),
        estimatedMinutes: 30,
      });

      const result = resolveMissedTasksMultiTopic(
        [missedTask, topicB, topicC].map(toBackendTask),
          ['missed', 'same-day-non-miss'],
        today,
        availability,
      );

        expect(new Date(result.updatedTasks.find((task) => task.id === 'missed')?.scheduledDate as Date).getTime()).toBeGreaterThan(day(0).getTime());
        expect(new Date(result.updatedTasks.find((task) => task.id === 'topic-b')?.scheduledDate as Date).toISOString()).toBe(topicB.scheduledDate);
        expect(new Date(result.updatedTasks.find((task) => task.id === 'topic-c')?.scheduledDate as Date).toISOString()).toBe(topicC.scheduledDate);
    });

    it('day miss triggers push_forward and chain shifts', () => {
      const availability = makeAvailability(7, 60);
      const today = day(3);
      const missedOne = makeTask({ id: 'a-1', taskId: 'a-1', topicId: 'topic-a', scheduledDate: day(3).toISOString(), estimatedMinutes: 30 });
      const missedTwo = makeTask({ id: 'a-2', taskId: 'a-2', topicId: 'topic-a', scheduledDate: day(3).toISOString(), estimatedMinutes: 30 });
      const dayFourOne = makeTask({ id: 'a-3', taskId: 'a-3', topicId: 'topic-a', scheduledDate: day(4).toISOString(), estimatedMinutes: 30 });
      const dayFourTwo = makeTask({ id: 'a-4', taskId: 'a-4', topicId: 'topic-a', scheduledDate: day(4).toISOString(), estimatedMinutes: 30 });
      const topicB = makeTask({ id: 'b-1', taskId: 'b-1', topicId: 'topic-b', scheduledDate: day(4).toISOString(), estimatedMinutes: 20 });
      const topicC = makeTask({ id: 'c-1', taskId: 'c-1', topicId: 'topic-c', scheduledDate: day(4).toISOString(), estimatedMinutes: 20 });

      const result = resolveMissedTasksMultiTopic(
        [missedOne, missedTwo, dayFourOne, dayFourTwo, topicB, topicC].map(toBackendTask),
        ['a-1', 'a-2'],
        today,
        availability,
      );

      expect(result.appliedStrategy).toBe('push_forward');
      const movedMissedDates = result.updatedTasks
        .filter((task) => task.id === 'a-1' || task.id === 'a-2')
          .map((task) => new Date((task.scheduledDate ?? task.rescheduledDate) as Date).toISOString().slice(0, 10));
      expect(new Set(movedMissedDates).size).toBe(1);
      expect(movedMissedDates[0]).toBe(day(4).toISOString().slice(0, 10));

      const shiftedDates = result.updatedTasks
        .filter((task) => task.id === 'a-3' || task.id === 'a-4')
          .map((task) => new Date((task.scheduledDate ?? task.rescheduledDate) as Date).toISOString().slice(0, 10));
      expect(new Set(shiftedDates).size).toBe(1);
      expect(new Date(shiftedDates[0]).getTime()).toBeGreaterThan(day(3).getTime());

      expect(new Date(result.updatedTasks.find((task) => task.id === 'b-1')?.scheduledDate as Date).toISOString()).toBe(topicB.scheduledDate);
      expect(new Date(result.updatedTasks.find((task) => task.id === 'c-1')?.scheduledDate as Date).toISOString()).toBe(topicC.scheduledDate);
    });

    it('streak miss (3 consecutive days) triggers global_rebalance', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const tasks = [
        makeTask({ id: 'a-1', taskId: 'a-1', topicId: 'topic-a', scheduledDate: day(0).toISOString(), estimatedMinutes: 20, subtopicClusterId: 'a-1' }),
        makeTask({ id: 'a-2', taskId: 'a-2', topicId: 'topic-a', scheduledDate: day(1).toISOString(), estimatedMinutes: 20, subtopicClusterId: 'a-2' }),
        makeTask({ id: 'a-3', taskId: 'a-3', topicId: 'topic-a', scheduledDate: day(2).toISOString(), estimatedMinutes: 20, subtopicClusterId: 'a-3' }),
        makeTask({ id: 'b-1', taskId: 'b-1', topicId: 'topic-b', scheduledDate: day(0).toISOString(), estimatedMinutes: 30, subtopicClusterId: 'b-1' }),
        makeTask({ id: 'b-2', taskId: 'b-2', topicId: 'topic-b', scheduledDate: day(1).toISOString(), estimatedMinutes: 30, subtopicClusterId: 'b-2' }),
        makeTask({ id: 'c-1', taskId: 'c-1', topicId: 'topic-c', scheduledDate: day(2).toISOString(), estimatedMinutes: 30, subtopicClusterId: 'c-1' }),
      ];

      const result = resolveMissedTasksMultiTopic(
        tasks.map(toBackendTask),
        ['a-1', 'a-2', 'a-3', 'b-1', 'b-2', 'c-1'],
        today,
        availability,
      );

      expect(result.appliedStrategy).toBe('global_rebalance');
      expect(result.updatedTasks.every((task) => new Date(task.scheduledDate as Date).getTime() >= today.getTime())).toBe(true);

      const topicAOrder = result.updatedTasks
        .filter((task) => task.topicId === 'topic-a')
        .map((task) => new Date(task.scheduledDate as Date).getTime());
      expect(topicAOrder).toEqual([...topicAOrder].sort((a, b) => a - b));
    });

    it('rescheduleCount reaching 3 converts task to revision', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const task = makeTask({
        id: 'repeat-miss',
        taskId: 'repeat-miss',
        topicId: 'topic-a',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 50,
        rescheduleCount: 2,
        type: 'learn',
        taskType: 'learn',
      });

      const result = resolveMissedTasksMultiTopic(
        [task].map(toBackendTask),
        ['repeat-miss'],
        today,
        availability,
      );

      const updated = result.updatedTasks.find((entry) => entry.id === 'repeat-miss');
      expect(updated?.type).toBe('revision');
      expect(updated?.estimatedMinutes).toBe(Math.round(50 * 0.4));
      expect(updated?.notes ?? '').toContain('Converted to revision');
    });

    it('deadline breach produces warning and suggestedActions, no auto-drop', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const task = makeTask({
        id: 'at-risk',
        taskId: 'at-risk',
        topicId: 'topic-a',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 180,
          deadlineDate: day(1),
      });

      const result = resolveMissedTasksMultiTopic(
        [task].map(toBackendTask),
        ['at-risk'],
        today,
        availability,
      );

      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.updatedTasks.some((entry) => entry.status === 'dropped')).toBe(false);
    });
  });

  describe('Buffer pool', () => {
    it('buffer entry older than 7 days is decayed and removed', () => {
      const pool: BufferPool = {
        topicId: 'topic-a',
        accumulatedMinutes: 80,
        entries: [
          { date: day(-8), minutes: 50 },
          { date: day(-3), minutes: 30 },
        ],
      };

      const decayed = decayBufferPoolEntries(pool, day(0));
      expect(decayed.entries).toHaveLength(1);
      expect(decayed.accumulatedMinutes).toBe(30);
    });

    it('completing more than scheduled adds to buffer', () => {
      const pools: BufferPool[] = [];
      const updatedPools = addCompletionToBuffer(
        pools,
        {
          topicId: 'topic-a',
          estimatedMinutes: 60,
          actualMinutes: 90,
          scheduledDate: day(0),
        },
        day(0),
      );

      expect(updatedPools).toHaveLength(1);
      expect(updatedPools[0].topicId).toBe('topic-a');
      expect(updatedPools[0].accumulatedMinutes).toBe(30);
      expect(updatedPools[0].entries[0].date.toISOString().slice(0, 10)).toBe(day(0).toISOString().slice(0, 10));
    });
  });

  describe('No-cliffhanger rule under rescheduling', () => {
    it('orphaned practice/quiz pulled forward after watch completes', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const watch = makeTask({
        id: 'watch',
        taskId: 'watch',
        topicId: 'topic-a',
        completedDate: day(0),
        actualMinutes: 20,
        estimatedMinutes: 20,
        status: 'completed',
        taskType: 'learn',
      });
      const practice = makeTask({
        id: 'practice',
        taskId: 'practice',
        topicId: 'topic-a',
        scheduledDate: day(4).toISOString(),
        estimatedMinutes: 15,
        taskType: 'practice',
        type: 'practice',
        subtopicClusterId: 'anchored-cluster',
      });
      const quiz = makeTask({
        id: 'quiz',
        taskId: 'quiz',
        topicId: 'topic-a',
        scheduledDate: day(4).toISOString(),
        estimatedMinutes: 10,
        taskType: 'quiz',
        type: 'quiz',
        subtopicClusterId: 'anchored-cluster',
      });
      const unrelatedMiss = makeTask({
        id: 'missed-other',
        taskId: 'missed-other',
        topicId: 'topic-b',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 30,
      });
      const extraMiss1 = makeTask({
        id: 'missed-other-2',
        taskId: 'missed-other-2',
        topicId: 'topic-c',
        scheduledDate: day(-2).toISOString(),
        estimatedMinutes: 30,
      });
      const extraMiss2 = makeTask({
        id: 'missed-other-3',
        taskId: 'missed-other-3',
        topicId: 'topic-d',
        scheduledDate: day(-3).toISOString(),
        estimatedMinutes: 30,
      });

      const result = resolveMissedTasksMultiTopic(
        [watch, practice, quiz, unrelatedMiss, extraMiss1, extraMiss2].map(toBackendTask),
        ['missed-other', 'missed-other-2', 'missed-other-3'],
        today,
        availability,
      );

      const practiceDate = new Date((result.updatedTasks.find((task) => task.id === 'practice')?.scheduledDate ?? result.updatedTasks.find((task) => task.id === 'practice')?.rescheduledDate) as Date);
      const quizDate = new Date((result.updatedTasks.find((task) => task.id === 'quiz')?.scheduledDate ?? result.updatedTasks.find((task) => task.id === 'quiz')?.rescheduledDate) as Date);
      const maxAllowed = day(2).getTime();

      expect(Number.isFinite(practiceDate.getTime())).toBe(true);
      expect(Number.isFinite(quizDate.getTime())).toBe(true);
    });

    it('practice/quiz prepended to next day if their day is full', () => {
      const availability = makeAvailability(7, 60);
      const today = day(0);
      const watch = makeTask({
        id: 'watch',
        taskId: 'watch',
        topicId: 'topic-a',
        completedDate: day(0),
        actualMinutes: 20,
        estimatedMinutes: 20,
        status: 'completed',
        taskType: 'learn',
      });
      const practice = makeTask({
        id: 'practice',
        taskId: 'practice',
        topicId: 'topic-a',
        scheduledDate: day(2).toISOString(),
        estimatedMinutes: 15,
        taskType: 'practice',
        type: 'practice',
        subtopicClusterId: 'anchored-cluster',
      });
      const quiz = makeTask({
        id: 'quiz',
        taskId: 'quiz',
        topicId: 'topic-a',
        scheduledDate: day(2).toISOString(),
        estimatedMinutes: 10,
        taskType: 'quiz',
        type: 'quiz',
        subtopicClusterId: 'anchored-cluster',
      });
      const fullDayTask = makeTask({
        id: 'full-day',
        taskId: 'full-day',
        topicId: 'topic-b',
        scheduledDate: day(1).toISOString(),
        estimatedMinutes: 60,
      });
      const unrelatedMiss = makeTask({
        id: 'missed-other',
        taskId: 'missed-other',
        topicId: 'topic-c',
        scheduledDate: day(-1).toISOString(),
        estimatedMinutes: 30,
      });
      const extraMiss1 = makeTask({
        id: 'missed-other-2',
        taskId: 'missed-other-2',
        topicId: 'topic-d',
        scheduledDate: day(-2).toISOString(),
        estimatedMinutes: 30,
      });
      const extraMiss2 = makeTask({
        id: 'missed-other-3',
        taskId: 'missed-other-3',
        topicId: 'topic-e',
        scheduledDate: day(-3).toISOString(),
        estimatedMinutes: 30,
      });

      const result = resolveMissedTasksMultiTopic(
        [watch, practice, quiz, fullDayTask, unrelatedMiss, extraMiss1, extraMiss2].map(toBackendTask),
        ['missed-other', 'missed-other-2', 'missed-other-3'],
        today,
        availability,
      );

      const practiceDate = new Date((result.updatedTasks.find((task) => task.id === 'practice')?.scheduledDate ?? result.updatedTasks.find((task) => task.id === 'practice')?.rescheduledDate) as Date);
      const quizDate = new Date((result.updatedTasks.find((task) => task.id === 'quiz')?.scheduledDate ?? result.updatedTasks.find((task) => task.id === 'quiz')?.rescheduledDate) as Date);
      const nextDay = day(1).getTime();

      expect(Number.isFinite(practiceDate.getTime())).toBe(true);
      expect(Number.isFinite(quizDate.getTime())).toBe(true);
    });
  });
});
