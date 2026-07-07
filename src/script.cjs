const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'src', 'components', 'session', 'LearningSessionPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// Remove whatsNextTask state
content = content.replace(/const \[whatsNextTask, setWhatsNextTask\] = useState[^;]+;/g, '');

// In handleAfterTaskComplete, remove fetchNextPendingTask and setWhatsNextTask
content = content.replace(/const next = await fetchNextPendingTask\(completedTaskId\);\s*setWhatsNextTask\(next\);/g, '');

// In imports, remove fetchNextPendingTask
content = content.replace(/fetchNextPendingTask,\s*/g, '');

// Remove renderWhatsNextCard function completely
content = content.replace(/const renderWhatsNextCard = \(\) => \{[\s\S]*?\n  \};\n/g, '');

// Remove {renderWhatsNextCard()} usages
content = content.replace(/\{renderWhatsNextCard\(\)\}/g, '');

// Remove handleStartNextTask and handleStartAnyway usages that were tied to whatsNextTask
content = content.replace(/const handleStartNextTask = useCallback\([\s\S]*?\}, \[handleStartWatchingTask, openTaskDrawer, openTaskPreview\]\);\s*/g, '');
content = content.replace(/const handleStartAnyway = useCallback\([\s\S]*?\}, \[closeTaskDrawer, handleStartWatchingTask, openTaskDrawer\]\);\s*/g, '');

fs.writeFileSync(p, content);
console.log('Removed whatsNextTask and renderWhatsNextCard');
