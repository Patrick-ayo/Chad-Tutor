import { scheduleMultiTopicTasks } from './src/services/scheduler.service';

const availability = {
  activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as any,
  minutesPerDay: { monday: 60, tuesday: 60, wednesday: 60, thursday: 60, friday: 60, saturday: 0, sunday: 0 } as any
};

const mockTopicQueue = {
  topicId: 'test',
  deadlineDate: new Date('2026-07-20'),
  tasks: [
    { id: 't1', title: 'Task 1', estimatedMinutes: 20, status: 'pending', priority: 'high', dependencies: [] },
    { id: 't2', title: 'Task 2', estimatedMinutes: 30, status: 'pending', priority: 'high', dependencies: [] }
  ],
  totalMinutes: 50,
  remainingMinutes: 50,
  burnRate: 0
};

const result = scheduleMultiTopicTasks([mockTopicQueue as any], availability);
console.log("Result length:", result.length);
