import type { 
  GoalDefinition, 
  Roadmap, 
  Phase, 
  Task,
  RoadmapTopic,
  Topic as SelectedTopic // Topic from GoalDefinition (with subtopics)
} from "@/types/goal";

/**
 * Generate a personalized roadmap based on actual user selections
 * Uses: selected topics, subtopics, videos, exam context, preferences
 */
export function generateRoadmapFromSelection(definition: GoalDefinition): Roadmap {
  const phases: Phase[] = [];
  
  // Get exam context info
  const universityName = typeof definition.university === 'string' 
    ? definition.university 
    : definition.university?.name ?? 'Your University';
  const courseName = typeof definition.course === 'string'
    ? definition.course
    : definition.course?.name ?? 'Your Course';
  const semesterName = typeof definition.semester === 'string'
    ? definition.semester
    : definition.semester?.name ?? 'Your Semester';
  
  // Get all selected videos
  const selectedVideos = definition.videos || [];
  const totalVideoSeconds = selectedVideos.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
  
  // Group videos by topic/subtopic
  const videosByTopic = new Map<string, typeof selectedVideos>();
  const videosBySubtopic = new Map<string, typeof selectedVideos>();
  
  selectedVideos.forEach(video => {
    if (video.subtopicId) {
      const existing = videosBySubtopic.get(video.subtopicId) || [];
      videosBySubtopic.set(video.subtopicId, [...existing, video]);
    } else if (video.topicId) {
      const existing = videosByTopic.get(video.topicId) || [];
      videosByTopic.set(video.topicId, [...existing, video]);
    }
  });
  
  // Create one phase per subject
  const subjectPhases = new Map<string, Phase>();
  let phaseCounter = 0;
  
  (definition.topics || []).forEach((topic: SelectedTopic) => {
    // Get subject name from the first video or use default
    const firstVideo = videosByTopic.get(topic.id)?.[0] || videosBySubtopic.get(topic.subtopics?.[0]?.id || '')?.[0];
    const subjectName = firstVideo?.module || `Subject for ${topic.name}`;
    
    if (!subjectPhases.has(subjectName)) {
      subjectPhases.set(subjectName, {
        id: `phase-subject-${phaseCounter++}`,
        name: subjectName,
        description: `Master ${subjectName} concepts for ${courseName} - ${semesterName}`,
        order: subjectPhases.size + 1,
        estimatedMinutes: 0,
        topics: [],
      });
    }
    
    const phase = subjectPhases.get(subjectName)!;
    
    // Build roadmap topic with tasks
    const roadmapTopic: RoadmapTopic = {
      id: topic.id,
      name: topic.name,
      estimatedMinutes: 0,
      tasks: [],
    };
    
    // If topic has subtopics, create tasks for each subtopic
    if (topic.subtopics && topic.subtopics.length > 0) {
      topic.subtopics.forEach((subtopic, subIndex) => {
        const subtopicVideos = videosBySubtopic.get(subtopic.id) || [];
        const subtopicDuration = subtopicVideos.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
        const subtopicMinutes = Math.ceil(subtopicDuration / 60);
        
        // Watch videos task
        const watchTask: Task = {
          id: `task-${topic.id}-${subtopic.id}-watch`,
          name: `Watch: ${subtopic.name}`,
          estimatedMinutes: subtopicMinutes,
          difficulty: subtopicMinutes > 60 ? 'hard' : subtopicMinutes > 30 ? 'medium' : 'easy',
          dependencies: subIndex > 0 ? [`task-${topic.id}-${topic.subtopics![subIndex - 1].id}-quiz`] : [],
          revisionWeight: 0.8,
          status: 'scheduled',
          scheduleReason: `Watch ${subtopicVideos.length} videos covering ${subtopic.name} (${Math.round(subtopicMinutes)} min)`,
          metadata: {
            videos: subtopicVideos.map(v => ({
              id: v.id,
              title: v.title,
              duration: v.duration,
              channelName: v.channelName,
            })),
            subtopicName: subtopic.name,
          },
        };
        
        // Practice task
        const practiceTask: Task = {
          id: `task-${topic.id}-${subtopic.id}-practice`,
          name: `Practice: ${subtopic.name}`,
          estimatedMinutes: Math.ceil(subtopicMinutes * 0.3), // 30% of video time for practice
          difficulty: 'medium',
          dependencies: [watchTask.id],
          revisionWeight: 0.7,
          status: 'scheduled',
          scheduleReason: `Solve practice questions on ${subtopic.name}`,
        };
        
        // Quiz task
        const quizTask: Task = {
          id: `task-${topic.id}-${subtopic.id}-quiz`,
          name: `Quiz: ${subtopic.name}`,
          estimatedMinutes: 15,
          difficulty: 'easy',
          dependencies: [practiceTask.id],
          revisionWeight: 0.5,
          assessmentHook: `quiz-${subtopic.id}`,
          status: 'scheduled',
          scheduleReason: `Verify understanding of ${subtopic.name}`,
        };
        
        roadmapTopic.tasks.push(watchTask, practiceTask, quizTask);
        roadmapTopic.estimatedMinutes += watchTask.estimatedMinutes + practiceTask.estimatedMinutes + quizTask.estimatedMinutes;
      });
    } else {
      // Topic without subtopics - create tasks directly for the topic
      const topicVideos = videosByTopic.get(topic.id) || [];
      const topicDuration = topicVideos.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
      const topicMinutes = Math.ceil(topicDuration / 60);
      
      const watchTask: Task = {
        id: `task-${topic.id}-watch`,
        name: `Watch: ${topic.name}`,
        estimatedMinutes: topicMinutes,
        difficulty: topicMinutes > 60 ? 'hard' : topicMinutes > 30 ? 'medium' : 'easy',
        dependencies: [],
        revisionWeight: 0.8,
        status: 'scheduled',
        scheduleReason: `Watch ${topicVideos.length} videos covering ${topic.name} (${Math.round(topicMinutes)} min)`,
        metadata: {
          videos: topicVideos.map(v => ({
            id: v.id,
            title: v.title,
            duration: v.duration,
            channelName: v.channelName,
          })),
          topicName: topic.name,
        },
      };
      
      const practiceTask: Task = {
        id: `task-${topic.id}-practice`,
        name: `Practice: ${topic.name}`,
        estimatedMinutes: Math.ceil(topicMinutes * 0.3),
        difficulty: 'medium',
        dependencies: [watchTask.id],
        revisionWeight: 0.7,
        status: 'scheduled',
        scheduleReason: `Solve practice questions on ${topic.name}`,
      };
      
      const quizTask: Task = {
        id: `task-${topic.id}-quiz`,
        name: `Quiz: ${topic.name}`,
        estimatedMinutes: 15,
        difficulty: 'easy',
        dependencies: [practiceTask.id],
        revisionWeight: 0.5,
        assessmentHook: `quiz-${topic.id}`,
        status: 'scheduled',
        scheduleReason: `Verify understanding of ${topic.name}`,
      };
      
      roadmapTopic.tasks.push(watchTask, practiceTask, quizTask);
      roadmapTopic.estimatedMinutes = watchTask.estimatedMinutes + practiceTask.estimatedMinutes + quizTask.estimatedMinutes;
    }
    
    phase.topics.push(roadmapTopic);
    phase.estimatedMinutes += roadmapTopic.estimatedMinutes;
  });
  
  // Convert map to array
  subjectPhases.forEach(phase => phases.push(phase));
  
  // Calculate total minutes
  const totalEstimatedMinutes = phases.reduce((sum, p) => sum + p.estimatedMinutes, 0);
  
  // Calculate buffer days and revision slots based on available time
  const hoursPerDay = 2; // Default 2 hours per day
  const totalDays = Math.ceil(totalEstimatedMinutes / 60 / hoursPerDay);
  const bufferDays = Math.ceil(totalDays * 0.15); // 15% buffer
  const revisionSlots = Math.ceil(phases.length * 1.5); // 1-2 revision slots per subject
  
  return {
    id: `roadmap-${definition.goalId || Date.now()}`,
    goalId: definition.goalId || `goal-${Date.now()}`,
    name: `${courseName} - ${semesterName} Study Plan`,
    description: `Personalized roadmap for ${universityName} covering ${phases.length} subject${phases.length !== 1 ? 's' : ''} with ${definition.topics?.length || 0} topics`,
    phases,
    totalEstimatedMinutes,
    bufferDays,
    revisionSlots,
    metadata: {
      university: universityName,
      course: courseName,
      semester: semesterName,
      subjects: Array.from(subjectPhases.keys()),
      totalVideos: selectedVideos.length,
      totalVideoMinutes: Math.round(totalVideoSeconds / 60),
      generatedAt: new Date().toISOString(),
    },
  };
}
