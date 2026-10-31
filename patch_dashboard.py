import sys
import re

with open('src/components/GBSECDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify TRAINING_MODULES
training_modules_str = """const TRAINING_MODULES = [
  { id: 'induction-hse', title: 'HSE Induction', icon: FileText, type: 'induction', desc: 'Induction HSE Content' }
];"""

content = re.sub(r"const TRAINING_MODULES = \[\s*{.*?\s*\];", training_modules_str, content, flags=re.DOTALL)

# 2. Extract and Move Investigation Section to Top of Sidebar
# Search for the investigation button in the sidebar
sidebar_investigation = """
          {/* Investigation Panel (Moved to Top) */}
          <div className="p-3">
            <button
              onClick={() => setActiveModuleId('investigation')}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all ${
                activeModuleId === 'investigation' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert size={14} />
              Investigate Incident
            </button>
          </div>
          <div className="mx-3 border-t border-slate-800/40" />
"""

# Try to find if there's an existing investigation button in the sidebar and remove it
content = re.sub(r'\{\/\* Investigation Panel.*?\<div className="mx-3 border-t border-slate-800/40" \/\>', '', content, flags=re.DOTALL)
content = re.sub(r'\<div className="mt-auto p-3"\>.*?\<\/div\>', '', content, flags=re.DOTALL)

# Now inject it at the beginning of the <aside>
content = content.replace('<aside className="w-52 bg-[#0A192F] border-r border-slate-800/40 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">',
                          '<aside className="w-52 bg-[#0A192F] border-r border-slate-800/40 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">' + sidebar_investigation)

# 3. Handle 'induction' type rendering
induction_render = """
        {activeModule.type === 'induction' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="text-amber-400" /> HSE Induction
              </h2>
              <button 
                onClick={() => completeModule(activeModule.id)}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-sm font-semibold transition-colors"
              >
                Mark as Completed
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              <div className="max-w-4xl mx-auto space-y-8">
                {inductionSlides.map((slide, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-lg">
                    <h3 className="text-amber-500 font-bold mb-4 border-b border-slate-700 pb-2">Slide {slide.slide_number}</h3>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{slide.content}</p>
                  </div>
                ))}
                {inductionSlides.length === 0 && (
                  <div className="text-center text-slate-500 py-12">Loading induction content...</div>
                )}
              </div>
            </div>
          </div>
        )}
"""

content = content.replace("{activeModule.type === 'scorm' && (", induction_render + "\n        {activeModule.type === 'scorm' && (")

# 4. Add induction content loading logic to the component
hooks_injection = """
  /* ─── Induction State ─── */
  const [inductionSlides, setInductionSlides] = useState([]);
  
  useEffect(() => {
    fetch('/induction_content.json')
      .then(res => res.json())
      .then(data => setInductionSlides(data))
      .catch(err => console.error('Failed to load induction content', err));
  }, []);
"""
content = content.replace("/* ─── Core State ─── */", hooks_injection + "\n  /* ─── Core State ─── */")

# Add FileText to imports if not present
if "FileText" not in content:
    content = content.replace("Play, ArrowRight", "Play, ArrowRight, FileText, ShieldAlert")

# Change default active module ID
content = content.replace("useState('scorm-1')", "useState('induction-hse')")

with open('src/components/GBSECDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated GBSECDashboard.jsx")
