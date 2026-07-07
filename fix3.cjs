const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'src', 'components', 'session', 'LearningSessionPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// Also remove openTaskPreview from imports/declarations
content = content.replace(/const openTaskPreview = useCallback\([\s\S]*?\}, \[.*?\]\);\s*/g, '');
content = content.replace(/openTaskPreview,\s*/g, '');

const handleStartAnywayString = \
  const handleStartAnyway = useCallback(async (nextTask: TodayTask) => {
    const mode = getTaskMode(nextTask);
    closeTaskDrawer();

    if (mode === 'learn') {
      await handleStartWatchingTask(nextTask.id);
      return;
    }
  }, [closeTaskDrawer, handleStartWatchingTask]);
\;

const closeTaskDrawerIndex = content.indexOf('const closeTaskDrawer = useCallback(() => {');
content = content.substring(0, closeTaskDrawerIndex) + handleStartAnywayString + '\n' + content.substring(closeTaskDrawerIndex);

fs.writeFileSync(p, content);
console.log('Fixed handleStartAnyway');
