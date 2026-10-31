chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['last_completed_date', 'streak_count', 'total_xp', 'gems', 'user_profile', 'reminder_enabled'], (result) => {
    if (result.reminder_enabled === undefined) {
      chrome.storage.local.set({
        streak_count: result.streak_count || 0,
        total_xp: result.total_xp || 0,
        gems: result.gems || 0,
        user_profile: result.user_profile || { name: "Anas M.", department: "IT Operations - Sonatrach / Eni JV", level: "Lvl 4: Network Sentry" },
        reminder_enabled: true
      });
    }
  });
  
  chrome.alarms.create("gbsec_daily_reminder", { periodInMinutes: 1440 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "gbsec_daily_reminder") {
    chrome.storage.local.get(['last_completed_date', 'reminder_enabled'], (result) => {
      const todayStr = new Date().toISOString().split('T')[0];
      if (result.reminder_enabled !== false && result.last_completed_date !== todayStr) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "🚨 GBSEC Daily Cyber Drill Ready",
          message: "A supply-chain threat targeting energy operations was detected. 60 seconds to secure your station.",
          priority: 2
        });
      }
    });
  }
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: "newtab.html" });
});
