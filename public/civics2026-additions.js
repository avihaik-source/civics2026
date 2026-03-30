/**
 * civics2026-additions.js
 * ─────────────────────────────────────────────────────────────
 * הוסף תג script עם src="civics2026-additions.js" לסוף ה-<body>
 * לאחר app.js הקיים. אל תשנה קוד קיים.
 * ─────────────────────────────────────────────────────────────
 * גרסה 2.0 | מרץ 2026
 */

// ═══════════════════════════════════════════════════════════════
// 1. SERVICE WORKER REGISTRATION
// ═══════════════════════════════════════════════════════════════

(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.info('[SW] Registered'))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });

  // Offline/Online indicator
  const updateOnlineStatus = () => {
    document.body.classList.toggle('is-offline', !navigator.onLine);
  };
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
})();


// ═══════════════════════════════════════════════════════════════
// 2. FOOTER – "פותח ע"י אביחי ק."
// ═══════════════════════════════════════════════════════════════

(function injectFooter() {
  // Wait for DOM to be ready
  const inject = () => {
    // Don't duplicate
    if (document.querySelector('.app-footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.setAttribute('dir', 'rtl');
    footer.innerHTML = `
      <span class="footer-credit">
        פותח ע"י <strong>אביחי ק.</strong> | אזרחות 2026
      </span>
      <span class="footer-version">גרסה 2.0 | מרץ 2026</span>
      <span class="footer-sources">
        מבוסס על חומר רשמי של משרד החינוך – שאלון 34281
      </span>
    `;

    // Try to append to main wrapper, fallback to body
    const wrapper = document.getElementById('app')
      || document.querySelector('.app-wrapper')
      || document.querySelector('main')
      || document.body;

    wrapper.appendChild(footer);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();


// ═══════════════════════════════════════════════════════════════
// 3. TEXT HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════

const Highlights = (() => {
  const STORAGE_KEY = 'civics_highlights_v2';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function add(questionId, selectedText, color = '#FFE066') {
    const data = load();
    if (!data[questionId]) data[questionId] = [];
    // Avoid duplicates
    const exists = data[questionId].some(h => h.text === selectedText);
    if (!exists) {
      data[questionId].push({ text: selectedText, color, ts: Date.now() });
      save(data);
    }
  }

  function clear(questionId) {
    const data = load();
    delete data[questionId];
    save(data);
  }

  function applyToElement(el, questionId) {
    const items = load()[questionId] || [];
    if (!items.length) return;

    let html = el.innerHTML;
    items.forEach(({ text, color }) => {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(
        new RegExp(escaped, 'g'),
        `<mark style="background:${color}" title="הדגשה שמורה">${text}</mark>`
      );
    });
    el.innerHTML = html;
  }

  function enableOn(container, questionId) {
    if (!container) return;

    // Re-apply saved highlights
    applyToElement(container, questionId);

    // Listen for new selections
    container.addEventListener('mouseup', () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim().length < 3) return;

      const text = sel.toString().trim();
      // Show mini tooltip
      const confirmed = window.confirm(`לסמן: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"?`);
      if (confirmed) {
        add(questionId, text);
        applyToElement(container, questionId);
      }
      sel.removeAllRanges();
    });
  }

  return { add, clear, applyToElement, enableOn, load };
})();

// Expose globally so app.js can call it
window.Highlights = Highlights;


// ═══════════════════════════════════════════════════════════════
// 4. SERVER SYNC
// ═══════════════════════════════════════════════════════════════

const ServerSync = (() => {
  const STUDENT_ID_KEY = 'civics_student_id';

  function getStudentId() {
    let id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) {
      id = 'student-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(STUDENT_ID_KEY, id);
    }
    return id;
  }

  async function push() {
    const studentId = getStudentId();

    // Collect progress from localStorage (keys depend on app.js implementation)
    const progressRaw = localStorage.getItem('civics_progress') || '{}';
    const notesRaw    = localStorage.getItem('civics_notes')    || '{}';

    const progressObj = JSON.parse(progressRaw);
    const notesObj    = JSON.parse(notesRaw);

    const progress = Object.entries(progressObj).map(([unitId, data]) => ({
      unitId: parseInt(unitId),
      questionsDone: data.done  || 0,
      score:         data.score || 0,
      feedbackEasy:  data.easy  || 0,
      feedbackMedium:data.medium|| 0,
      feedbackHard:  data.hard  || 0,
    }));

    const notes = Object.entries(notesObj).map(([questionId, content]) => ({
      questionId,
      content,
    }));

    try {
      const res = await fetch('/api/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, progress, notes }),
      });
      if (res.ok) {
        console.info('[Sync] ✓ Synced to server');
        return true;
      }
    } catch {
      console.warn('[Sync] Offline – data saved locally only');
    }
    return false;
  }

  // Auto-sync every 5 minutes
  function startAutoSync(intervalMs = 5 * 60 * 1000) {
    push(); // immediate push on load
    setInterval(push, intervalMs);
  }

  return { push, startAutoSync, getStudentId };
})();

// Expose globally
window.ServerSync = ServerSync;

// Start auto-sync after page loads
window.addEventListener('load', () => {
  ServerSync.startAutoSync();
});


// ═══════════════════════════════════════════════════════════════
// 5. ANALYTICS HELPER
// ═══════════════════════════════════════════════════════════════

window.trackEvent = async function(event, data = {}) {
  try {
    await fetch('/api/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: ServerSync.getStudentId(),
        event,
        data,
      }),
    });
  } catch {
    // Non-critical – never throw
  }
};


// ═══════════════════════════════════════════════════════════════
// 6. OFFLINE BADGE (HTML)
// ═══════════════════════════════════════════════════════════════

(function injectOfflineBadge() {
  const badge = document.createElement('div');
  badge.className = 'offline-badge';
  badge.textContent = '📵 מצב לא מקוון';
  document.body.appendChild(badge);
})();
