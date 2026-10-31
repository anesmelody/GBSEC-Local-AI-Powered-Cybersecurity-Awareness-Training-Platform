const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ─── Configuration ───
const OLLAMA_HOST = 'http://localhost:11434';
const TEXT_MODEL = 'qwen3.5:4b';
const PORT = 5000;

// ─── Persistence ───
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getUserFile(username) {
  return path.join(DATA_DIR, `user_${username.toLowerCase()}.json`);
}

function loadUserData(username) {
  const file = getUserFile(username);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  return {
    username,
    progress: { completedModules: [], currentModule: 1, scenarioPoints: 0, scenariosCompleted: [] },
    conversations: [],
    persona: { preferredStyle: 'professional', interactionCount: 0 },
    scormState: {},
  };
}

function saveUserData(username, data) {
  fs.writeFileSync(getUserFile(username), JSON.stringify(data, null, 2));
}

// ─── SCORM Knowledge ───
let scormKnowledge = {};
try {
  const kp = path.join(__dirname, '..', 'src', 'data', 'scorm-knowledge.json');
  scormKnowledge = JSON.parse(fs.readFileSync(kp, 'utf-8'));
  console.log(`✅ Knowledge loaded: ${scormKnowledge.modules.length} modules`);
} catch (err) {
  console.error('⚠️  Failed to load knowledge:', err.message);
}

function getModuleContext(sectionId) {
  const mod = scormKnowledge.modules?.find(m => m.id === sectionId);
  if (!mod) return 'General cybersecurity topic.';
  return `MODULE: ${mod.title} — ${mod.subtitle}\nTOPICS:\n${mod.topics.map(t => `• ${t}`).join('\n')}\nFACTS:\n${mod.keyFacts.map(f => `• ${f}`).join('\n')}\nTRANSCRIPT: "${mod.transcriptSegment}"`;
}

// ─── Mock User DB ───
const USERS = [
  { username: 'admin', password: 'admin', fullName: 'Anas Miloudi', department: 'IT&T Department', company: 'Groupement Berkine' },
];

// ─── 1. Auth ───
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid Groupement Berkine credentials.' });
  const userData = loadUserData(user.username);
  res.json({
    success: true,
    user: { username: user.username, fullName: user.fullName, department: user.department, company: user.company,
      token: 'jwt-gbsec-' + Buffer.from(username).toString('base64'),
      savedProgress: userData.progress, savedConversations: userData.conversations.slice(-50), persona: userData.persona },
  });
});

// ─── 2. Save Progress ───
app.post('/api/progress/save', (req, res) => {
  const { username, progress, conversations, scormState, persona } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required.' });
  const userData = loadUserData(username);
  if (progress) userData.progress = progress;
  if (conversations) userData.conversations = conversations.slice(-100);
  if (scormState) userData.scormState = scormState;
  if (persona) userData.persona = { ...userData.persona, ...persona };
  saveUserData(username, userData);
  res.json({ success: true });
});

// ─── 3. Chat ───
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, scormContext, currentSection, activeSectionId, userName, persona } = req.body;
    const moduleContext = getModuleContext(activeSectionId || 1);
    const systemPrompt = {
      role: 'system',
      content: `You are Renos, the AI Cybersecurity Tutor for Groupement Berkine (GBSEC).
You are speaking with ${userName || 'a colleague'}. Address them by their first name.

Current Module: ${currentSection || 'General'}
${moduleContext}

SCORM State: ${JSON.stringify(scormContext || {}, null, 2)}

RULES:
1. Answer cybersecurity questions for oil & gas infrastructure context (Groupement Berkine, Berkine Basin, Hassi Messaoud).
2. When asked for a checkpoint/assessment or told "I finished" or "ready for quiz", present a challenging scenario-based question from the current module.
3. Evaluate answers against the module criteria. If satisfactory, include [CHECKPOINT_PASSED]. If not, give hints.
4. NEVER show <think> tags. Strip all internal reasoning.
5. Keep responses concise and professional.
6. Share proactive cybersecurity tips relevant to oil & gas.
7. Be warm, supportive, and personal. Use the employee's name.
8. Never reveal your model name or architecture. You are Renos.
9. If the user types /clear, respond with: "Chat history cleared. How can I help you, [name]?"`,
    };
    const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model: TEXT_MODEL,
      messages: [systemPrompt, ...messages],
      stream: false,
      options: { temperature: 0.6, num_predict: 1000 },
    }, { timeout: 300000 });
    const replyContent = response.data.message?.content || "Renos encountered an issue.";
    res.json({
      choices: [{ message: { content: replyContent } }]
    });
  } catch (error) {
    console.error('LLM Error:', error.message);
    res.status(502).json({ error: 'Renos is processing. Please try again in a moment.' });
  }
});

// ─── 4. Generate Scenario ───
app.post('/api/scenario/generate', async (req, res) => {
  try {
    const { moduleId, difficulty, userName, previousScenarios } = req.body;
    const moduleContext = getModuleContext(moduleId || 1);
    const prompt = {
      role: 'system',
      content: `You are Renos, generating cybersecurity training scenarios for Groupement Berkine oil & gas employees.
Generate a realistic, immersive cybersecurity scenario quiz. The scenario MUST be different from these previous ones: ${JSON.stringify(previousScenarios || [])}.

Context: ${moduleContext}
Difficulty: ${difficulty || 'medium'}
Employee: ${userName}

You MUST respond with ONLY valid JSON (no markdown, no \`\`\`, no extra text) in this exact format:
{"title":"...","scenario":"A detailed 2-3 sentence realistic scenario description set in an oil & gas workplace","choices":[{"id":"a","text":"...","correct":false},{"id":"b","text":"...","correct":true},{"id":"c","text":"...","correct":false},{"id":"d","text":"...","correct":false}],"explanation":"Detailed explanation of why the correct answer is right and others are wrong","points":${difficulty === 'hard' ? 150 : difficulty === 'easy' ? 75 : 100},"tags":["tag1","tag2"]}`,
    };
    const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model: TEXT_MODEL,
      messages: [prompt, { role: 'user', content: 'Generate the scenario now.' }],
      stream: false,
      options: { temperature: 0.8, num_predict: 800 },
    }, { timeout: 300000 });
    let content = response.data.message?.content || "{}";
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    // Extract JSON from possible markdown wrapping
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scenario = JSON.parse(jsonMatch[0]);
      res.json({ scenario });
    } else {
      res.status(500).json({ error: 'Failed to parse scenario.' });
    }
  } catch (error) {
    console.error('Scenario Error:', error.message);
    res.status(500).json({ error: 'Scenario generation failed.' });
  }
});

// ─── 5. Investigate ───
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
app.post('/api/investigate', upload.single('media'), async (req, res) => {
  try {
    const { investigationType, userNotes } = req.body;
    const base64Image = req.file ? req.file.buffer.toString('base64') : null;
    if (!base64Image) return res.status(400).json({ error: 'No file provided.' });

    const prompts = {
      phishing: 'Analyze for PHISHING: Check sender domain, urgency tactics, suspicious links, credential harvesting. Format: Verdict/Threat Level/Indicators/Domain Analysis/Action/SOC Escalation.',
      malware: 'Analyze for MALWARE: Check for suspicious pop-ups, fake alerts, unknown processes, ransomware signs. Format: Verdict/Malware Type/Threat Level/Indicators/Action/SOC Escalation.',
      'social-engineering': 'Analyze for SOCIAL ENGINEERING: Check for impersonation, pretexting, manipulation, authority exploitation. Format: Verdict/Attack Type/Threat Level/Tactics/Action/SOC Escalation.',
      general: 'Perform GENERAL SECURITY ANALYSIS: Check for any threats including phishing, malware, data exposure, policy violations. Format: Risk Level/Findings/Category/Action/SOC Escalation.',
    };

    // Use native Ollama API for vision (images array)
    const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: `You are Renos, Groupement Berkine cybersecurity AI.\n${prompts[investigationType] || prompts.general}\nEmployee notes: "${userNotes || 'None'}"`, images: [base64Image] }],
      stream: false,
      options: { temperature: 0.3, num_predict: 1000 },
    }, { timeout: 300000 });

    const analysis = response.data.message?.content || 'Analysis unavailable.';
    res.json({ analysis: analysis.replace(/<think>[\s\S]*?<\/think>/g, '') });
  } catch (error) {
    console.error('Investigation Error:', error.message);
    res.status(500).json({ error: 'Investigation failed. Please retry.' });
  }
});

// ─── 6. Health ───
app.get('/api/health', async (_req, res) => {
  let ollama = 'unreachable';
  try { await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 5000 }); ollama = 'connected'; } catch (_) {}
  res.json({ status: 'ok', ollama, knowledgeLoaded: !!scormKnowledge.course, modules: scormKnowledge.modules?.length || 0 });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  GBSEC Gateway • Port ${PORT}          ║`);
  console.log(`║  Renos AI Tutor • Ready               ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
