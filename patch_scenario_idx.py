import re

with open('src/components/GBSECDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace scenarioIdx state and handleModuleSelect
old_select = """  const handleModuleSelect = (id) => {
    setActiveModuleId(id);
    setScenarioIdx(0);
    setSelectedAnswer(null);
    setRevealed(false);
  };"""

new_select = """  const handleModuleSelect = (id) => {
    setActiveModuleId(id);
    const modScenarios = scenariosData[id] || [];
    const firstUnanswered = modScenarios.findIndex((_, idx) => !answeredScenarios.has(`${id}::${idx}`));
    setScenarioIdx(firstUnanswered !== -1 ? firstUnanswered : 0);
    setSelectedAnswer(null);
    setRevealed(false);
  };"""

content = content.replace(old_select, new_select)

# Also update useEffect to set initial scenarioIdx when data loads
old_effect = """      setScenariosData(grouped);"""
new_effect = """      setScenariosData(grouped);
      const modScenarios = grouped[activeModuleId] || [];
      const firstUnanswered = modScenarios.findIndex((_, idx) => !answeredScenarios.has(`${activeModuleId}::${idx}`));
      if (firstUnanswered !== -1) setScenarioIdx(firstUnanswered);"""

content = content.replace(old_effect, new_effect)

with open('src/components/GBSECDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
