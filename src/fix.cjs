const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'src', 'components', 'session', 'LearningSessionPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// Fix the dangling line left over from setWhatsNextTask removal
content = content.replace(/   isToday: boolean \} \| null>\(null\);\r?\n/g, '');

fs.writeFileSync(p, content);
console.log('Fixed syntax error');
