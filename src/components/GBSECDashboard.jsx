import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  LogOut, Upload, Send, Bot, User, CheckCircle, Lock,
  X, Shield, Bug, Users, FileSearch, MessageCircle, Award, Zap, ChevronDown,
  AlertTriangle, Target, Wifi, HardDrive, FileWarning, Search, Image, Trash2,
  Play, ArrowRight, FileText, ShieldAlert, Eye, BookOpen, Maximize2, Minimize2
} from 'lucide-react';
import { Scorm12Runtime } from '../services/scormAdapter';

/* ═══ MODULES ═══ */
const TRAINING_MODULES = [
  { id: 'scorm-auth', title: 'Cybersecurity Tutorial', icon: FileText, type: 'scorm', desc: 'Core security practices' }
];

const SCENARIO_MODULES = [
  { id: 'BEC / Vendor Impersonation', title: 'BEC & Impersonation', icon: Users, type: 'scenarios', desc: 'Identify phishing attacks and malicious emails' },
  { id: 'Credential Harvesting', title: 'Credential Harvesting', icon: Shield, type: 'scenarios', desc: 'Recognize manipulation and impersonation' },
  { id: 'MFA Fatigue', title: 'MFA Fatigue', icon: AlertTriangle, type: 'scenarios', desc: 'Handle sensitive data and prevent leaks' },
  { id: 'Vishing / Fake Helpdesk', title: 'Vishing & Fake Helpdesk', icon: MessageCircle, type: 'scenarios', desc: 'USB threats, VPN, and workstation safety' },
  { id: 'Lookalike Domain', title: 'Lookalike Domain', icon: Search, type: 'scenarios', desc: 'Report incidents and follow SOC procedures' },
  { id: 'Malicious Attachment', title: 'Malicious Attachment', icon: FileWarning, type: 'scenarios', desc: 'Weaponized documents and macros' },
  { id: 'Insider Threat', title: 'Insider Threat', icon: Lock, type: 'scenarios', desc: 'Malicious or negligent employees' },
  { id: 'Physical Security', title: 'Physical Security', icon: HardDrive, type: 'scenarios', desc: 'Tailgating and USB baiting' },
  { id: 'Cloud Misconfiguration', title: 'Cloud Misconfiguration', icon: Wifi, type: 'scenarios', desc: 'Exposed buckets and insecure APIs' },
  { id: 'OAuth App Consent Phishing', title: 'OAuth App Consent Phishing', icon: Target, type: 'scenarios', desc: 'Malicious third-party app permissions' }
];

const ALL_MODULES = [...TRAINING_MODULES, ...SCENARIO_MODULES];

const INVESTIGATION_TYPES = [
  { id: 'phishing', label: 'Phishing Analysis', icon: Shield, desc: 'Emails, URLs, messages' },
  { id: 'malware', label: 'Malware Detection', icon: Bug, desc: 'Screenshots, alerts' },
  { id: 'social-engineering', label: 'Social Engineering', icon: Users, desc: 'Impersonation, pretexting' },
  { id: 'general', label: 'General Audit', icon: FileSearch, desc: 'Full assessment' },
];


export default function GBSECDashboard({ user, onLogout }) {
  const firstName = user.fullName?.split(' ')[0] || 'there';

  
  /* ─── Induction State ─── */
  const [inductionSlides, setInductionSlides] = useState([]);
  const [inductionIdx, setInductionIdx] = useState(0);
  
  useEffect(() => {
    fetch('/induction_content.json')
      .then(res => res.json())
      .then(data => setInductionSlides(data))
      .catch(err => console.error('Failed to load induction content', err));
  }, []);

  /* ─── Core State ─── */
  const [activeModuleId, setActiveModuleId] = useState('scorm-auth');
  const [completedModules, setCompletedModules] = useState(() => new Set(user.savedProgress?.completedModules || []));
  const [points, setPoints] = useState(user.savedProgress?.scenarioPoints || 0);
  const [answeredScenarios, setAnsweredScenarios] = useState(() => new Set(user.savedProgress?.scenariosCompleted || []));

    /* ─── Scenario State ─── */
  const [scenariosData, setScenariosData] = useState({});
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState(user.savedProgress?.answersMap || {});
  
  const currentKey = `${activeModuleId}::${scenarioIdx}`;
  const selectedAnswer = answersMap[currentKey] || null;
  const revealed = !!selectedAnswer;

  /* ─── Chat State ─── */
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (user.savedConversations?.length > 0) return user.savedConversations;
    return [{ role: 'assistant', content: `Welcome, **${firstName}**! 👋 I'm **Renos**, your GBSEC AI Tutor.\n\n📋 Start with the video training, then tackle the scenario quizzes.\n🔍 Upload suspicious files anytime for investigation!\n\nType **/clear** to reset chat.` }];
  });
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  /* ─── UI State ─── */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [investLoading, setInvestLoading] = useState(false);

  const chatEndRef = useRef(null);
  const runtimeRef = useRef(null);
  const scormStateRef = useRef({});
  const saveDebounce = useRef(null);
  const hasMounted = useRef(false);

    /* ─── SCORM Runtime (use ref to avoid re-render loops) ─── */
  useEffect(() => {
    fetch('/scenarios.json').then(res => res.json()).then(data => {
      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.threat_type]) grouped[item.threat_type] = [];
        const choices = item.options.map(opt => ({
          id: opt.id.toLowerCase(),
          text: opt.text,
          correct: opt.is_correct
        }));
        grouped[item.threat_type].push({
          title: item.topic,
          scenario: item.briefing.body_snippet + ' ' + item.briefing.context,
          choices,
          explanation: item.options.find(o => o.is_correct)?.explanation || '',
          points: item.points_reward,
          tags: [item.threat_type]
        });
      });
      setScenariosData(grouped);
      const modScenarios = grouped[activeModuleId] || [];
      const firstUnanswered = modScenarios.findIndex((_, idx) => !answeredScenarios.has(`${activeModuleId}::${idx}`));
      if (firstUnanswered !== -1) setScenarioIdx(firstUnanswered);
    }).catch(console.error);

    try { sessionStorage.setItem('selected-locale-6aa529bf31e773b6a19e41a5', 'en-us'); } catch (_) {}
    runtimeRef.current = new Scorm12Runtime((s) => { scormStateRef.current = s; });
    return () => { if (runtimeRef.current) runtimeRef.current.destroy(); };
  }, []);

  /* ─── Scroll chat ─── */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ─── Auto-save (only after first mount, debounced) ─── */
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    if (saveDebounce.current) clearTimeout(saveDebounce.current);
    saveDebounce.current = setTimeout(() => {
      const msgsToSave = messages.slice(-100);
      const progToSave = { completedModules: [...completedModules], currentModule: activeModuleId, scenarioPoints: points, scenariosCompleted: [...answeredScenarios], answersMap };
      axios.post('/api/progress/save', {
        username: user.username,
        progress: progToSave,
        conversations: msgsToSave,
      }).catch(() => {});
      try {
        const saved = localStorage.getItem('gbsec_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.savedConversations = msgsToSave;
          parsed.savedProgress = progToSave;
          localStorage.setItem('gbsec_session', JSON.stringify(parsed));
        }
      } catch (_) {}
    }, 5000);
  }, [completedModules, points, answeredScenarios, answersMap, activeModuleId, messages]);

    /* ─── Current module/scenario helpers ─── */
  const activeMod = ALL_MODULES.find(m => m.id === activeModuleId);
  const currentScenarios = scenariosData[activeModuleId] || [];
  const currentScenario = currentScenarios[scenarioIdx] || null;
  const isModuleFinished = currentScenarios.length > 0 && currentScenarios.every((_, idx) => answeredScenarios.has(`${activeModuleId}::${idx}`));

  const handleModuleSelect = (id) => {
    setActiveModuleId(id);
    const modScenarios = scenariosData[id] || [];
    const firstUnanswered = modScenarios.findIndex((_, idx) => !answeredScenarios.has(`${id}::${idx}`));
    setScenarioIdx(firstUnanswered !== -1 ? firstUnanswered : 0);
  };

  /* ─── Answer Scenario ─── */
  const handleAnswer = (choiceId) => {
    if (revealed) return;
    const choice = currentScenario?.choices.find(c => c.id === choiceId);
    setAnswersMap(prev => ({ ...prev, [currentKey]: choiceId }));
    
    if (!answeredScenarios.has(currentKey)) {
      setAnsweredScenarios(prev => new Set([...prev, currentKey]));
      if (choice?.correct) {
        setPoints(p => p + (currentScenario.points || 100));
      }
    }
  };

  const nextScenario = () => {
    if (scenarioIdx + 1 < currentScenarios.length) {
      setScenarioIdx(scenarioIdx + 1);
    } else {
      setScenarioIdx(0); // cycle
    }
  };

  const prevScenario = () => {
    if (scenarioIdx > 0) {
      setScenarioIdx(scenarioIdx - 1);
    }
  };

  const markModuleComplete = () => {
    setCompletedModules(prev => new Set([...prev, activeModuleId]));
    if (!chatOpen) setUnread(u => u + 1);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🏆 Well done, ${firstName}! **${activeMod?.title}** completed!\n\n${SCENARIO_MODULES.findIndex(m => m.id === activeModuleId) < SCENARIO_MODULES.length - 1 ? 'Move on to the next module when you\'re ready.' : '🎉 All modules completed! Outstanding work protecting Groupement Berkine.'}`,
    }]);
  };

  /* ─── Chat ─── */
  const clearChat = () => {
    const emptyMsgs = [{ role: 'assistant', content: `Chat cleared. How can I help you, ${firstName}?` }];
    setMessages(emptyMsgs);
    setInput('');
    axios.post('/api/progress/save', {
      username: user.username,
      progress: { completedModules: [...completedModules], currentModule: activeModuleId, scenarioPoints: points, scenariosCompleted: [...answeredScenarios], answersMap },
      conversations: emptyMsgs,
    }).catch(() => {});
    try {
      const saved = localStorage.getItem('gbsec_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.savedConversations = emptyMsgs;
        localStorage.setItem('gbsec_session', JSON.stringify(parsed));
      }
    } catch (_) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const text = input.trim();

    if (text.toLowerCase() === '/clear') {
      clearChat();
      return;
    }

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setChatLoading(true);

    try {
      const res = await axios.post('/api/chat', {
        messages: updated.slice(-20).map(m => ({ role: m.role, content: m.content })),
        scormContext: scormStateRef.current,
        currentSection: activeMod?.title,
        activeSectionId: 1,
        userName: user.fullName,
      }, { timeout: 300000 });

      let reply = res.data.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (reply.includes('[CHECKPOINT_PASSED]')) {
        setCompletedModules(prev => new Set([...prev, activeModuleId]));
        reply = reply.replace('[CHECKPOINT_PASSED]', '✅ **Checkpoint passed!**');
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (_) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⏳ Give me a moment, ${firstName} — processing your request.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ─── Investigation ─── */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowInvestModal(true);
    e.target.value = '';
  };

  const runInvestigation = async (type) => {
    if (!pendingFile) return;
    setShowInvestModal(false);
    setInvestLoading(true);
    setChatOpen(true);
    const typeName = INVESTIGATION_TYPES.find(t => t.id === type)?.label || 'Analysis';
    setMessages(prev => [...prev, { role: 'user', content: `📎 Uploaded **${pendingFile.name}** for **${typeName}**` }]);
    const fd = new FormData();
    fd.append('media', pendingFile);
    fd.append('investigationType', type);
    fd.append('userNotes', `From ${user.fullName}`);
    try {
      const res = await axios.post('/api/investigate', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 });
      setMessages(prev => [...prev, { role: 'assistant', content: `🛡️ **${typeName} Report:**\n\n${res.data.analysis}` }]);
    } catch (_) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Investigation taking longer — please retry.' }]);
    } finally { setInvestLoading(false); setPendingFile(null); }
  };

  const completedCount = completedModules.size;

  /* ═══ FULLSCREEN ═══ */
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060E1B] flex flex-col">
        <div className="h-10 bg-[#0A192F] border-b border-slate-800/60 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/gb-logo.jpg" alt="GB" className="h-6 w-6 rounded" />
            <span className="text-sm font-semibold text-white">GBSEC — Fullscreen Training</span>
          </div>
          <button onClick={() => setIsFullscreen(false)} className="flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg text-[10px] border border-slate-600/30 transition">
            <Minimize2 size={12} /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-1 p-1">
          <iframe src="/scorm/courses/sb_pass_auth/index.html" className="w-full h-full rounded border border-slate-800/50" allow="autoplay; fullscreen" />
        </div>
      </div>
    );
  }

  /* ═══ MAIN RENDER ═══ */
  return (
    <div className="flex flex-col h-screen bg-[#060E1B] text-slate-100 font-sans overflow-hidden">
      {/* ─── Investigation Modal ─── */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => { setShowInvestModal(false); setPendingFile(null); }}>
          <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-amber-400" />
                <div>
                  <h3 className="text-white font-semibold text-base">Choose Investigation</h3>
                  {pendingFile && <p className="text-[9px] text-slate-400 mt-0.5">{pendingFile.name}</p>}
                </div>
              </div>
              <button onClick={() => { setShowInvestModal(false); setPendingFile(null); }} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INVESTIGATION_TYPES.map(t => {
                const I = t.icon;
                return (
                  <button key={t.id} onClick={() => runInvestigation(t.id)}
                    className="p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 hover:border-amber-500/30 rounded-xl text-left transition-all group">
                    <I size={16} className="text-amber-500/70 group-hover:text-amber-400 mb-1" />
                    <p className="text-[10px] font-semibold text-white">{t.label}</p>
                    <p className="text-[8px] text-slate-400">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="h-12 bg-[#0A192F] border-b border-slate-800/60 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/gb-logo.jpg" alt="GB" className="h-8 w-8 rounded-lg border border-slate-700/40" />
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white">GBSEC INDUCTION</h1>
            <p className="text-[8px] text-slate-500">Groupement Berkine • Information Security</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/15 to-amber-700/5 rounded-full px-3 py-1 border border-amber-500/25">
            <Award size={12} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">{points}</span>
            <span className="text-[7px] text-amber-400/60 font-semibold">XP</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-full px-2.5 py-1 border border-slate-700/40">
            <Target size={10} className="text-emerald-400" />
            <span className="text-[10px] text-slate-300 font-medium">{completedCount}/{ALL_MODULES.length}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-200 font-medium">{user.fullName}</p>
            <p className="text-[8px] text-slate-500">{user.department}</p>
          </div>
          <button onClick={onLogout} className="bg-red-950/50 hover:bg-red-900/50 text-red-300 px-2 py-1 rounded text-[9px] font-semibold border border-red-800/30 transition">Sign Out</button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ═══ Sidebar ═══ */}
        <aside className="w-52 bg-[#0A192F] border-r border-slate-800/40 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
          {/* ─── Investigate Button ─── */}
          <div className="p-3">
            <label className="cursor-pointer flex items-center gap-2.5 bg-gradient-to-r from-amber-600/20 to-amber-700/10 hover:from-amber-600/30 hover:to-amber-700/20 p-3 rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-all group">
              <div className="p-1.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition">
                <Shield size={15} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-300">🔍 Investigate</p>
                <p className="text-[7px] text-amber-400/60">Upload & analyze threats</p>
              </div>
              <input type="file" className="hidden" accept="image/*,.pdf,.eml,.msg" onChange={handleFileSelect} />
            </label>
          </div>
          <div className="mx-3 border-t border-slate-800/40" />

          {/* Training Section */}
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-[8px] uppercase tracking-[0.15em] text-amber-500/70 font-bold flex items-center gap-1"><Play size={8} /> Training Content</p>
          </div>
          {TRAINING_MODULES.map(mod => {
            const I = mod.icon;
            const active = activeModuleId === mod.id;
            const done = completedModules.has(mod.id);
            return (
              <button key={mod.id} onClick={() => handleModuleSelect(mod.id)}
                className={`w-full text-left px-3 py-2.5 border-l-2 transition-all
                  ${active ? 'bg-amber-500/10 border-l-amber-500' : 'border-l-transparent hover:bg-slate-800/30'}`}>
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle size={12} className="text-emerald-400" /> : <I size={12} className={active ? 'text-amber-400' : 'text-slate-500'} />}
                  <span className={`text-[10px] font-semibold ${active ? 'text-amber-300' : done ? 'text-emerald-300' : 'text-slate-300'}`}>{mod.title}</span>
                </div>
                <p className="text-[8px] text-slate-500 mt-0.5 pl-5">{mod.desc}</p>
              </button>
            );
          })}

          {/* Divider */}
          <div className="mx-3 my-2 border-t border-slate-800/40" />

          {/* Scenario Section */}
          <div className="px-3 pb-1.5">
            <p className="text-[8px] uppercase tracking-[0.15em] text-emerald-500/70 font-bold flex items-center gap-1"><Zap size={8} /> Security Scenarios</p>
          </div>
          {SCENARIO_MODULES.map(mod => {
            const I = mod.icon;
            const active = activeModuleId === mod.id;
            const done = completedModules.has(mod.id);
            const scenarioCount = (scenariosData[mod.id] || []).length;
            return (
              <button key={mod.id} onClick={() => handleModuleSelect(mod.id)}
                className={`w-full text-left px-3 py-2.5 border-l-2 transition-all
                  ${active ? 'bg-emerald-500/8 border-l-emerald-500' : 'border-l-transparent hover:bg-slate-800/30'}`}>
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle size={12} className="text-emerald-400" /> : <I size={12} className={active ? 'text-emerald-400' : 'text-slate-500'} />}
                  <span className={`text-[10px] font-semibold ${active ? 'text-emerald-300' : done ? 'text-emerald-300' : 'text-slate-300'}`}>{mod.title}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5 pl-5">
                  <p className="text-[8px] text-slate-500">{mod.desc}</p>
                </div>
                <div className="pl-5 mt-1">
                  <span className="text-[7px] bg-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded-full">{scenarioCount} scenarios</span>
                </div>
              </button>
            );
          })}

        </aside>

        {/* ═══ Content Area ═══ */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0D1B2A]">
          {/* Module Header Bar */}
          <div className="px-5 py-2.5 border-b border-slate-800/40 flex items-center justify-between shrink-0 bg-[#0F1D36]/60">
            <div className="flex items-center gap-2">
              {activeMod && <activeMod.icon size={15} className="text-amber-400" />}
              <div>
                <h2 className="text-sm font-bold text-white">{activeMod?.title}</h2>
                <p className="text-[9px] text-slate-500">{activeMod?.type === 'scorm' ? 'Interactive Video Training' : activeMod?.type === 'induction' ? 'Induction Training' : 'Scenario-Based Quiz'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {completedModules.has(activeModuleId) && (
                <span className="flex items-center gap-1 bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full text-[8px] font-semibold border border-emerald-700/30">
                  <CheckCircle size={9} /> Completed
                </span>
              )}
              {activeMod?.type === 'scorm' && (
                <button onClick={() => setIsFullscreen(true)} className="p-1.5 rounded bg-slate-700/40 hover:bg-slate-600/50 text-slate-400 hover:text-white border border-slate-700/30 transition" title="Fullscreen">
                  <Maximize2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeMod?.type === 'scorm' ? (
              /* SCORM iframe */
              <div className="h-full p-1.5">
                <iframe src="/scorm/courses/sb_pass_auth/index.html" title="SCORM Training" className="w-full h-full rounded-lg border border-slate-800/50" allow="autoplay; fullscreen" />
              </div>
            ) : activeMod?.type === 'induction' && inductionSlides.length > 0 ? (
              /* Induction Slides */
              <div className="p-6 max-w-3xl mx-auto animate-fadeIn">
                <div className="bg-gradient-to-br from-[#1E293B] to-[#152033] rounded-2xl border border-slate-700/40 overflow-hidden shadow-xl min-h-[400px] flex flex-col">
                  <div className="bg-gradient-to-r from-blue-600/15 to-transparent px-5 py-3 border-b border-slate-700/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-400" />
                      <h3 className="text-base font-bold text-white">Slide {inductionSlides[inductionIdx].slide_number}</h3>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Slide {inductionIdx + 1} of {inductionSlides.length}</p>
                  </div>
                  
                  <div className="flex-1 p-8 overflow-y-auto whitespace-pre-wrap text-slate-200 text-lg leading-relaxed">
                    {inductionSlides[inductionIdx].content}
                  </div>
                  
                  <div className="px-5 py-4 border-t border-slate-700/30 flex gap-2">
                    <button onClick={() => setInductionIdx(Math.max(0, inductionIdx - 1))} disabled={inductionIdx === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                      Previous
                    </button>
                    
                    {inductionIdx < inductionSlides.length - 1 ? (
                      <button onClick={() => setInductionIdx(Math.min(inductionSlides.length - 1, inductionIdx + 1))}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-900/20">
                        Next Slide <ArrowRight size={12} />
                      </button>
                    ) : !completedModules.has(activeModuleId) ? (
                      <button onClick={markModuleComplete}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700/60 hover:bg-emerald-600/60 text-white py-2.5 rounded-xl text-sm font-semibold transition border border-emerald-500/20">
                        <CheckCircle size={12} /> Complete Module
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-900/30 text-emerald-300 py-2.5 rounded-xl text-sm font-semibold border border-emerald-700/30">
                        Module Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentScenario ? (
              /* Scenario Quiz */
              <div className="p-6 max-w-2xl mx-auto animate-fadeIn">
                <div className="bg-gradient-to-br from-[#1E293B] to-[#152033] rounded-2xl border border-slate-700/40 overflow-hidden shadow-xl">
                  {/* Scenario Header */}
                  <div className="bg-gradient-to-r from-amber-600/15 to-transparent px-5 py-3 border-b border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        <h3 className="text-base font-bold text-white">{currentScenario.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {currentScenario.tags?.map(t => (
                          <span key={t} className="text-[7px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{t}</span>
                        ))}
                        <span className="flex items-center gap-0.5 text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
                          <Award size={9} /> {currentScenario.points} XP
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Scenario {scenarioIdx + 1} of {currentScenarios.length}</p>
                  </div>

                  {/* Description */}
                  <div className="px-5 py-4">
                    <p className="text-[13px] text-slate-200 leading-relaxed">{currentScenario.scenario}</p>
                  </div>

                  {/* Choices */}
                  <div className="px-5 pb-4 space-y-2">
                    {currentScenario.choices.map(c => {
                      const isSel = selectedAnswer === c.id;
                      let cls = 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/30 hover:border-slate-600 text-slate-200';
                      if (revealed) {
                        if (c.correct) cls = 'bg-emerald-900/40 border-emerald-500/40 text-emerald-100';
                        else if (isSel) cls = 'bg-red-900/30 border-red-500/30 text-red-200';
                        else cls = 'bg-slate-800/20 border-slate-700/15 text-slate-500';
                      }
                      return (
                        <button key={c.id} onClick={() => handleAnswer(c.id)} disabled={revealed}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${cls}`}>
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5
                            ${revealed && c.correct ? 'bg-emerald-500 border-emerald-400 text-white' : revealed && isSel ? 'bg-red-500 border-red-400 text-white' : 'border-current'}`}>
                            {revealed && c.correct ? '✓' : revealed && isSel && !c.correct ? '✗' : c.id.toUpperCase()}
                          </span>
                          <span className="text-sm leading-relaxed">{c.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {revealed && (
                    <div className="mx-5 mb-4 p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/20 animate-fadeIn">
                      <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                        {selectedAnswer && currentScenario.choices.find(c => c.id === selectedAnswer)?.correct ? '✅ Correct!' : '❌ Not quite'} — Explanation
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">{currentScenario.explanation}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {revealed && (
                    <div className="px-5 pb-4 flex gap-2 animate-fadeIn">
                      <button onClick={prevScenario} disabled={scenarioIdx === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                        Previous
                      </button>
                      <button onClick={nextScenario}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-amber-900/20">
                        Next Scenario <ArrowRight size={12} />
                      </button>
                      {isModuleFinished && !completedModules.has(activeModuleId) && (
                        <button onClick={markModuleComplete}
                          className="flex items-center gap-1.5 bg-emerald-700/60 hover:bg-emerald-600/60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-emerald-500/20">
                          <CheckCircle size={12} /> Complete Module
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-base">
                Select a module to begin
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══ Floating Renos Chat ═══ */}
      {chatOpen && (
        <div className="fixed bottom-20 right-5 w-[400px] h-[540px] bg-[#0A192F] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-40 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2.5 bg-gradient-to-r from-[#1E293B] to-[#162032] border-b border-slate-700/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <img src="/gb-logo.jpg" alt="Renos" className="h-7 w-7 rounded-lg border border-amber-500/15" />
              <div>
                <span className="font-semibold text-sm text-white">Renos</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[7px] text-slate-500">AI Tutor • On-Premises</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={clearChat}
                className="p-1.5 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition" title="Clear chat">
                <Trash2 size={12} />
              </button>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded hover:bg-slate-700/50 text-slate-500 hover:text-white transition">
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-2.5 text-[11px] leading-relaxed whitespace-pre-wrap break-words
                  ${m.role === 'user' ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' : 'bg-[#1E293B] text-slate-200 border border-slate-700/30'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {(chatLoading || investLoading) && (
              <div className="flex justify-start">
                <div className="bg-[#1E293B] border border-slate-700/30 rounded-xl p-2.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  </div>
                  <span className="text-[8px] text-slate-500 italic">{investLoading ? 'Investigating...' : 'Thinking...'}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-slate-800/40 bg-[#0F1D36] shrink-0">
            <div className="flex gap-1.5">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Message Renos... (/clear)"
                className="flex-1 bg-slate-900/80 border border-slate-700/40 rounded-lg px-3 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition" />
              <button onClick={sendMessage} disabled={chatLoading || !input.trim()}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-700 disabled:to-slate-700 text-white px-2.5 py-2 rounded-lg transition shrink-0">
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button — BOTTOM RIGHT */}
      <button onClick={() => { setChatOpen(o => !o); if (!chatOpen) setUnread(0); }}
        className={`fixed bottom-4 right-5 z-50 w-13 h-13 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center
          ${chatOpen ? 'bg-slate-700 hover:bg-slate-600 shadow-black/40 w-12 h-12' : 'bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-amber-900/40 hover:scale-110 w-14 h-14'}`}>
        {chatOpen ? (
          <X size={18} className="text-white" />
        ) : (
          <>
            <img src="/gb-logo.jpg" alt="Renos" className="w-9 h-9 rounded-full border-2 border-amber-400/30" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center border-2 border-[#060E1B] animate-bounce">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
