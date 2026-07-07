const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'src', 'components', 'session', 'LearningSessionPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// Remove renderWhatsNextCard function
const renderWhatsNextCardStart = content.indexOf('const renderWhatsNextCard = () => {');
if (renderWhatsNextCardStart !== -1) {
    const renderTodayTasksSectionStart = content.indexOf('const renderTodayTasksSection = () => {');
    content = content.substring(0, renderWhatsNextCardStart) + content.substring(renderTodayTasksSectionStart);
}

// Remove remaining whatsNextTask and handleStartNextTask / handleStartAnyway functions
content = content.replace(/const handleStartNextTask = useCallback\([\s\S]*?\}, \[.*?\]\);\s*/g, '');
content = content.replace(/const handleStartAnyway = useCallback\([\s\S]*?\}, \[.*?\]\);\s*/g, '');

fs.writeFileSync(p, content);
console.log('Fixed renderWhatsNextCard');
