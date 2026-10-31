document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['streak_count', 'total_xp', 'gems', 'user_profile', 'reminder_enabled'], (result) => {
    const profile = result.user_profile || { name: "Anas M.", department: "IT Operations - Sonatrach / Eni JV", level: "Lvl 4: Network Sentry" };
    
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-dept').textContent = profile.department;
    document.getElementById('user-level').textContent = profile.level;
    
    const xp = result.total_xp || 0;
    const streak = result.streak_count || 0;
    
    document.getElementById('user-xp').textContent = xp;
    document.getElementById('user-streak').textContent = streak;
    
    // progress bar visual mock
    const progress = (xp % 1000) / 10;
    document.getElementById('level-progress').style.width = `${progress}%`;

    const reminderToggle = document.getElementById('reminder-toggle');
    reminderToggle.checked = result.reminder_enabled !== false;
    
    reminderToggle.addEventListener('change', (e) => {
      chrome.storage.local.set({ reminder_enabled: e.target.checked });
    });

    document.getElementById('launch-drill-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: "newtab.html" });
    });

    renderLeaderboard(xp, streak);
  });
});

function renderLeaderboard(userXp, userStreak) {
  const mockLeaderboard = [
    { rank: "🥇", name: "Sofiane B.", dept: "IT Security", xp: 2850, streak: 18 },
    { rank: "🥈", name: "Amina K.", dept: "Finance - Sonatrach/Eni JV", xp: 2420, streak: 14 },
    { rank: "🥉", name: "Karim M.", dept: "Field Operations", xp: 2100, streak: 9 },
    { rank: "4", name: "Anas M.", dept: "IT Operations", xp: userXp, streak: userStreak },
    { rank: "5", name: "Yacine T.", dept: "Procurement", xp: 1650, streak: 5 }
  ];

  const container = document.getElementById('leaderboard-list');
  container.innerHTML = '';

  mockLeaderboard.forEach(item => {
    const div = document.createElement('div');
    div.className = 'leaderboard-item';
    div.innerHTML = `
      <div class="lb-rank">${item.rank}</div>
      <div class="lb-info">
        <div class="lb-name">${item.name}</div>
        <div class="lb-dept">${item.dept}</div>
      </div>
      <div class="lb-stats">
        <div>💎 ${item.xp} XP</div>
        <div style="color: var(--flame); font-size: 0.75rem;">🔥 ${item.streak} Days</div>
      </div>
    `;
    container.appendChild(div);
  });
}
