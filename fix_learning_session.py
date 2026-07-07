import re

file_path = r'd:\projects\Chad-Tutor\src\components\session\LearningSessionPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace {taskId && (<LectureSummaryPanel ... />)}
pattern = r'\{taskId && \(\s*<LectureSummaryPanel[\s\S]*?\/>\s*\)\}'
content = re.sub(pattern, '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
