const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}

function playWinSound() {
  playTone(440, 'sine', 0.1);
  setTimeout(() => playTone(554, 'sine', 0.1), 100);
  setTimeout(() => playTone(659, 'sine', 0.3), 200);
}

function playLoseSound() {
  playTone(150, 'sawtooth', 0.3);
}



let cooldownInterval;

function startCooldownTimer(nextDrillTime) {
  const timerEl = document.getElementById('countdown-timer');
  clearInterval(cooldownInterval);
  
  const updateTimer = () => {
    const now = Date.now();
    const diff = nextDrillTime - now;
    if (diff <= 0) {
      clearInterval(cooldownInterval);
      document.getElementById('cooldown-container').style.display = 'none';
      document.getElementById('drill-container').style.display = 'block';
      loadScenario();
      return;
    }
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  updateTimer();
  cooldownInterval = setInterval(updateTimer, 1000);
}

function loadScenario() {
  fetch('scenarios.json')
    .then(response => response.json())
    .then(scenarios => {
      chrome.storage.local.get(['completed_drills_count', 'shuffled_scenario_indices', 'current_session_progress', 'next_drill_time', 'current_part'], (result) => {
        const now = Date.now();
        if (result.next_drill_time && now < result.next_drill_time) {
          document.getElementById('drill-container').style.display = 'none';
          document.getElementById('cooldown-container').style.display = 'block';
          startCooldownTimer(result.next_drill_time);
          return;
        }

        let currentPart = result.current_part || 0;
        let progress = result.current_session_progress || 0;
        
        document.getElementById('drill-progress').textContent = `Question ${progress + 1} of 100 (Part ${currentPart + 1}/10)`;
        
        let indices = result.shuffled_scenario_indices;
        
        if (!indices || indices.length !== 100) {
          let startIndex = currentPart * 100;
          let endIndex = startIndex + 100;
          if (endIndex > scenarios.length) endIndex = scenarios.length;
          
          indices = Array.from({length: endIndex - startIndex}, (_, i) => startIndex + i);
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          chrome.storage.local.set({ shuffled_scenario_indices: indices });
        }
        
        const scenarioIndex = indices[progress % indices.length];
        renderScenario(scenarios[scenarioIndex]);
      });
    })
    .catch(error => {
      console.error('Failed to load scenarios:', error);
      document.getElementById('threat-topic').textContent = "Error loading scenarios.";
    });
}

function renderScenario(scenario) {
  document.getElementById('threat-type').textContent = `Threat Type: ${scenario.threat_type}`;
  document.getElementById('threat-date').textContent = scenario.scenario_date;
  document.getElementById('threat-topic').textContent = scenario.topic;
  
  document.getElementById('threat-sender').textContent = `From: ${scenario.briefing.sender}`;
  document.getElementById('threat-subject').textContent = `Subject: ${scenario.briefing.subject}`;
  document.getElementById('threat-snippet').textContent = scenario.briefing.body_snippet;
  document.getElementById('threat-context').textContent = `Context: ${scenario.briefing.context}`;

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  
  scenario.options.forEach(opt => {
    const btn = document.createElement('div');
    btn.className = 'option-card';
    btn.textContent = `${opt.id}. ${opt.text}`;
    btn.addEventListener('click', () => handleSelection(opt, btn, scenario));
    optionsContainer.appendChild(btn);
  });
}

function handleSelection(option, buttonEl, scenario) {
  if (buttonEl.classList.contains('disabled')) return;
  
  const allCards = document.querySelectorAll('.option-card');
  allCards.forEach(c => c.classList.add('disabled'));

  const explanationDrawer = document.getElementById('explanation-drawer');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackText = document.getElementById('feedback-text');
  
  chrome.storage.local.get(['streak_count', 'total_xp', 'gems', 'completed_drills_count', 'current_session_progress', 'current_part'], (result) => {
    let newStreak = result.streak_count || 0;
    let newXp = result.total_xp || 0;
    let newGems = result.gems || 0;
    let drillsCount = (result.completed_drills_count || 0) + 1;
    let progress = (result.current_session_progress || 0) + 1;

    if (option.is_correct) {
      playWinSound();
      window.triggerConfetti();
      buttonEl.classList.add('correct');
      feedbackTitle.textContent = "Great Job!";
      feedbackTitle.style.color = "var(--correct)";
      newStreak += 1;
      newXp += scenario.points_reward;
      newGems += 25;
    } else {
      playLoseSound();
      buttonEl.classList.add('incorrect');
      feedbackTitle.textContent = "Security Breach";
      feedbackTitle.style.color = "var(--incorrect)";
      newXp += 20; // participation
    }

    feedbackText.textContent = option.explanation;
    explanationDrawer.style.display = 'block';

    const todayStr = new Date().toISOString().split('T')[0];
    let updates = {
      streak_count: newStreak,
      total_xp: newXp,
      gems: newGems,
      last_completed_date: todayStr,
      completed_drills_count: drillsCount,
      current_session_progress: progress
    };

    if (progress >= 100) {
      let currentPart = result.current_part || 0;
      let nextPart = currentPart + 1;
      if (nextPart >= 10) nextPart = 0;
      updates.current_part = nextPart;
      updates.shuffled_scenario_indices = null;

      updates.next_drill_time = Date.now() + (60 * 60 * 1000);
      updates.current_session_progress = 0;
      document.getElementById('close-drill-btn').textContent = "Finish Drill Session";
    } else {
      document.getElementById('close-drill-btn').textContent = `Next Question (${progress}/100) ➔`;
    }

    chrome.storage.local.set(updates);

    document.getElementById('streak-count').textContent = newStreak;
    document.getElementById('xp-count').textContent = newXp;
    document.getElementById('gem-count').textContent = newGems;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['streak_count', 'total_xp', 'gems'], (result) => {
    document.getElementById('streak-count').textContent = result.streak_count || 0;
    document.getElementById('xp-count').textContent = result.total_xp || 0;
    document.getElementById('gem-count').textContent = result.gems || 0;
  });

  document.getElementById('close-drill-btn').addEventListener('click', () => {
    chrome.storage.local.get(['next_drill_time'], (res) => {
      if (res.next_drill_time && Date.now() < res.next_drill_time) {
        window.close();
      } else {
        document.getElementById('explanation-drawer').style.display = 'none';
        document.getElementById('drill-container').style.display = 'block';
        loadScenario();
      }
    });
  });

  const cooldownCloseBtn = document.getElementById('cooldown-close-btn');
  if (cooldownCloseBtn) {
    cooldownCloseBtn.addEventListener('click', () => window.close());
  }

  loadScenario();
});

