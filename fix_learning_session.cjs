const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'src', 'components', 'session', 'LearningSessionPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// 1. Add getToken
if (!content.includes('const { userId, getToken } = useAuth();')) {
  content = content.replace('const { userId } = useAuth();', 'const { userId, getToken } = useAuth();');
}

// 2. Add state
const stateStr = \
  // AI Generated Notes
  const [aiGeneratedNote, setAiGeneratedNote] = useState<UserNoteData | null>(null);
  const [isGeneratingAiNotes, setIsGeneratingAiNotes] = useState(false);
\;
if (!content.includes('const [aiGeneratedNote')) {
  content = content.replace('// Session state', stateStr + '\\n  // Session state');
}

// 3. Add useEffect
const useEffectStr = \
  useEffect(() => {
    if (!currentVideoData.videoId) return;

    const storageKey = \\\i-notes-\\\\;
    const existingNotes = localStorage.getItem(storageKey);
    
    if (existingNotes) {
      try {
        const parsed = JSON.parse(existingNotes);
        setAiGeneratedNote({
          id: \\\i-\\\\,
          content: parsed.notes || parsed,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to parse existing AI notes", e);
      }
      return;
    }

    const generateNotes = async () => {
      setIsGeneratingAiNotes(true);
      try {
        const token = await getToken();
        const res = await fetch('/api/session/generate-session-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: \\\Bearer \\\\ } : {})
          },
          body: JSON.stringify({
            videoId: currentVideoData.videoId,
            videoTitle: currentVideoData.title || task?.name,
            topicName: task?.topicName || task?.name
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.notes) {
            localStorage.setItem(storageKey, JSON.stringify(data.notes));
            setAiGeneratedNote({
              id: \\\i-\\\\,
              content: data.notes,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Failed to generate AI notes", err);
      } finally {
        setIsGeneratingAiNotes(false);
      }
    };

    void generateNotes();
  }, [currentVideoData.videoId, currentVideoData.title, task?.name, task?.topicName, getToken]);
\;
if (!content.includes('localStorage.getItem(storageKey)')) {
  // Insert before the sessionUserNotes useMemo
  content = content.replace('const sessionUserNotes = useMemo(', useEffectStr + '\\n\\n  const sessionUserNotes = useMemo(');
}

// 4. Update sessionUserNotes to include aiGeneratedNote
const buildTaskNotesReplacement = \
  const sessionUserNotes = useMemo(() => {
    const baseNotes = buildTaskUserNotes(task, sessionLearningPoints);
    if (isGeneratingAiNotes) {
      return [{
        id: 'ai-loading',
        content: '*Generating AI elaborative notes from video thumbnail...*',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }, ...baseNotes];
    }
    if (aiGeneratedNote) {
      return [aiGeneratedNote, ...baseNotes];
    }
    return baseNotes;
  }, [task, sessionLearningPoints, aiGeneratedNote, isGeneratingAiNotes]);
\;
content = content.replace(/const sessionUserNotes = useMemo\\\(\\s*\\\(\\\) => buildTaskUserNotes\\\([^\\)]+\\\),\\s*\\\[[^\]]+\\\]\\s*\\\);/g, buildTaskNotesReplacement);

// Just in case the regex doesn't match precisely due to formatting:
if (content.includes('() => buildTaskUserNotes(task, sessionLearningPoints),')) {
  content = content.replace(
    /const sessionUserNotes = useMemo\([\s\S]*?\[task, sessionLearningPoints\],\s*\);/,
    buildTaskNotesReplacement
  );
}

fs.writeFileSync(p, content);
console.log('Updated LearningSessionPage.tsx!');
