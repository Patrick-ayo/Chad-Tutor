const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'projects', 'Chad-Tutor', 'backend', 'src', 'routes', 'ai.routes.ts');
let content = fs.readFileSync(p, 'utf8');

const newRoute = \
router.post('/generate-session-notes', requireUser, async (req: Request, res: Response) => {
  try {
    const { videoId, videoTitle, topicName } = req.body;
    if (!videoId || !videoTitle) {
      return res.status(400).json({ error: 'Missing video context' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    }

    const thumbnailUrl = \\\https://img.youtube.com/vi/\/hqdefault.jpg\\\;
    
    // We import axios dynamically to keep it simple, or require it.
    const axios = require('axios');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.2-90b-vision-preview',
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: \\\Analyze this video thumbnail and generate elaborative, well-structured study notes about the topic: '\'. \\n\\nVideo Title: \\\n\\nIf this is a coding or technical topic, infer the programming language or technology from the title/thumbnail. Provide context, key concepts, and a summary. Format as clean Markdown.\\\
              },
              {
                type: 'image_url',
                image_url: {
                  url: thumbnailUrl
                }
              }
            ]
          }
        ],
      },
      {
        headers: {
          Authorization: \\\Bearer \\\\,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    const generatedText = response.data?.choices?.[0]?.message?.content || '';
    res.json({ notes: generatedText });
  } catch (error: any) {
    console.error('Groq vision failed:', error?.response?.data || error);
    res.status(500).json({ error: 'Failed to generate AI notes' });
  }
});
\;

// Insert it before export default router;
content = content.replace('export default router;', newRoute + '\\n\\nexport default router;');

if (!content.includes('requireUser')) {
  content = content.replace('import express, { Request, Response } from \\'express\\';', 'import express, { Request, Response } from \\'express\\';\\nimport { requireUser } from \\'../middleware/auth.middleware\\';');
}

fs.writeFileSync(p, content);
console.log('Added generate-session-notes route!');
