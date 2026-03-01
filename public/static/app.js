// ===== Civics 2026 - Main App =====
(function() {
  'use strict';

  // ===== STATE =====
  const state = {
    currentView: 'home', // home | questions | question-detail
    currentExam: 0,
    searchQuery: '',
    studentName: localStorage.getItem('studentName') || '',
    completedUnits: JSON.parse(localStorage.getItem('completedUnits') || '[]'),
    answeredQuestions: JSON.parse(localStorage.getItem('answeredQuestions') || '[]'),
    showScaffolding: {},
    scaffoldingLevel: {},
    fontSize: parseInt(localStorage.getItem('fontSize') || '16'),
    expandedQuestion: null
  };

  function saveState() {
    localStorage.setItem('studentName', state.studentName);
    localStorage.setItem('completedUnits', JSON.stringify(state.completedUnits));
    localStorage.setItem('answeredQuestions', JSON.stringify(state.answeredQuestions));
    localStorage.setItem('fontSize', state.fontSize.toString());
  }

  // ===== RENDER =====
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = renderHeader() + renderMainContent();
    attachEvents();
  }

  // ===== HEADER =====
  function renderHeader() {
    return `
    <header class="sticky-header glass border-b border-gray-200 shadow-sm no-print">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-3 cursor-pointer" onclick="app.navigate('home')">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-book-open text-white text-lg"></i>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-800 leading-tight">הכנה לבגרות באזרחות 2026</h1>
              <p class="text-xs text-gray-500">96 שאלות מבחינות | גרסה מותאמת נגישות</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <nav class="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onclick="app.navigate('home')" class="nav-item px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${state.currentView === 'home' ? 'active' : ''}">
                <i class="fas fa-home ml-1"></i>ראשי
              </button>
              <button onclick="app.navigate('questions')" class="nav-item px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${state.currentView === 'questions' || state.currentView === 'question-detail' ? 'active' : ''}">
                <i class="fas fa-file-alt ml-1"></i>שאלות בגרות
              </button>
            </nav>
            <div class="flex gap-1 mr-2">
              <button onclick="app.changeFontSize(-1)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm" title="הקטן גופן">א-</button>
              <button onclick="app.changeFontSize(1)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm" title="הגדל גופן">א+</button>
            </div>
          </div>
        </div>
      </div>
    </header>`;
  }

  // ===== MAIN CONTENT =====
  function renderMainContent() {
    switch(state.currentView) {
      case 'home': return renderHome();
      case 'questions': return renderQuestionsView();
      case 'question-detail': return renderQuestionDetail();
      default: return renderHome();
    }
  }

  // ===== HOME VIEW =====
  function renderHome() {
    const totalUnits = UNITS_DATA.length;
    const completed = state.completedUnits.length;
    const pct = Math.round((completed / totalUnits) * 100);
    const totalAnswered = state.answeredQuestions.length;

    // Group units by stage
    const stages = {};
    UNITS_DATA.forEach(u => {
      if (!stages[u.stage]) stages[u.stage] = { title: u.stageTitle, units: [] };
      stages[u.stage].units.push(u);
    });

    const stageLabels = { "א": "שלב א'", "ב": "שלב ב'", "ג": "שלב ג'", "ד": "שלב ד'" };

    let stagesHTML = '';
    for (const [stageKey, stageData] of Object.entries(stages)) {
      const colors = STAGE_COLORS[stageKey];
      const stageIcon = stageKey === "א" ? "fa-landmark" : stageKey === "ב" ? "fa-balance-scale" : stageKey === "ג" ? "fa-building-columns" : "fa-tv";
      
      let unitsHTML = stageData.units.map(u => {
        const isCompleted = state.completedUnits.includes(u.id);
        const freqClass = FREQ_COLORS[u.freqColor];
        const notFocus = u.notInFocus ? `<span class="inline-block px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full mr-1">לא במיקוד תשפ"ה</span>` : '';
        
        return `
        <div class="unit-card bg-white rounded-xl p-4 border ${isCompleted ? 'border-green-300 bg-green-50/30' : 'border-gray-200'} cursor-pointer ${u.notInFocus ? 'opacity-60' : ''}" onclick="app.toggleUnit(${u.id})">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg ${isCompleted ? 'bg-green-100' : colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
              ${isCompleted ? '<i class="fas fa-check text-green-600"></i>' : `<i class="fas ${u.icon} ${colors.icon}"></i>`}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="font-bold text-gray-800">${u.id}.</span>
                <h3 class="font-semibold text-gray-800 text-sm">${u.title}</h3>
                ${notFocus}
              </div>
              <div class="flex flex-wrap gap-1 mb-2">
                ${u.topics.map(t => `<span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">${t}</span>`).join('')}
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full ${freqClass} text-xs font-medium">תדירות: ${u.frequency}</span>
                <span><i class="fas fa-file-alt ml-1"></i>${u.questionCount} שאלות</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <input type="checkbox" ${isCompleted ? 'checked' : ''} class="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer" onclick="event.stopPropagation(); app.toggleUnit(${u.id})">
            </div>
          </div>
        </div>`;
      }).join('');

      stagesHTML += `
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center">
            <i class="fas ${stageIcon} text-sm"></i>
          </div>
          <h2 class="text-lg font-bold ${colors.text}">${stageLabels[stageKey]}: ${stageData.title}</h2>
          ${stageKey === "ב" ? '<span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">תדירות גבוהה!</span>' : ''}
        </div>
        <div class="grid gap-3 md:grid-cols-2">${unitsHTML}</div>
      </div>`;
    }

    return `
    <main class="max-w-6xl mx-auto px-4 py-6" style="font-size: ${state.fontSize}px">
      <!-- Student Name -->
      <div class="glass rounded-2xl p-4 mb-6 border border-gray-200 flex items-center gap-3 flex-wrap">
        <i class="fas fa-user-graduate text-blue-500 text-xl"></i>
        <input type="text" id="studentName" value="${escapeHtml(state.studentName)}" placeholder="שם התלמיד/ה" 
          class="bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none px-2 py-1 text-lg font-semibold flex-1 min-w-[200px]"
          onchange="app.setStudentName(this.value)">
        ${state.studentName ? '<span class="text-green-500 text-sm"><i class="fas fa-check ml-1"></i>נשמר</span>' : ''}
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass rounded-xl p-4 border border-gray-200 text-center">
          <div class="text-2xl font-bold text-blue-600">${completed}/${totalUnits}</div>
          <div class="text-xs text-gray-500 mt-1">יחידות הושלמו</div>
        </div>
        <div class="glass rounded-xl p-4 border border-gray-200 text-center">
          <div class="text-2xl font-bold text-purple-600">${pct}%</div>
          <div class="text-xs text-gray-500 mt-1">התקדמות כללית</div>
        </div>
        <div class="glass rounded-xl p-4 border border-gray-200 text-center">
          <div class="text-2xl font-bold text-emerald-600">${totalAnswered}</div>
          <div class="text-xs text-gray-500 mt-1">שאלות נענו</div>
        </div>
        <div class="glass rounded-xl p-4 border border-gray-200 text-center cursor-pointer hover:border-blue-300 transition-colors" onclick="app.navigate('questions')">
          <div class="text-2xl font-bold text-orange-600">96</div>
          <div class="text-xs text-gray-500 mt-1">שאלות בגרות <i class="fas fa-arrow-left text-xs"></i></div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="glass rounded-xl p-4 border border-gray-200 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-bar ml-1"></i>התקדמות כללית</span>
          <span class="text-sm font-bold text-blue-600">${pct}%</span>
        </div>
        <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-l from-blue-500 to-blue-600 rounded-full transition-all duration-500" style="width:${pct}%"></div>
        </div>
      </div>

      <!-- CTA for Questions -->
      <div class="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all" onclick="app.navigate('questions')">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-file-alt text-2xl"></i>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-1">96 שאלות בגרות אמיתיות</h2>
            <p class="text-blue-100 text-sm">5 מבחנים מלאים (2024-2025) עם פתרונות מלאים - לחצו לצפייה</p>
          </div>
          <i class="fas fa-arrow-left text-2xl opacity-50"></i>
        </div>
      </div>

      <!-- Units -->
      ${stagesHTML}
    </main>`;
  }

  // ===== QUESTIONS VIEW =====
  function renderQuestionsView() {
    const exams = typeof EXAMS_DATA !== 'undefined' ? EXAMS_DATA : [];
    const currentExam = exams[state.currentExam] || exams[0];
    
    if (!currentExam) {
      return `<main class="max-w-6xl mx-auto px-4 py-6"><p class="text-center text-gray-500">טוען שאלות...</p></main>`;
    }

    // Filter questions by search
    let filteredQuestions = currentExam.questions;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      filteredQuestions = filteredQuestions.filter(question => 
        question.full_text.toLowerCase().includes(q) || question.number.includes(q)
      );
    }

    const examTabs = exams.map((exam, i) => {
      const shortName = exam.name.replace('מועד ', '').replace('שאלון ', '');
      return `<button onclick="app.setExam(${i})" class="exam-tab px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${state.currentExam === i ? 'active' : ''}">${shortName}</button>`;
    }).join('');

    const questionsHTML = filteredQuestions.map((q, idx) => {
      const isAnswered = state.answeredQuestions.includes(q.id);
      const isExpanded = state.expandedQuestion === '__all__' || state.expandedQuestion === q.id;
      const preview = getQuestionPreview(q.full_text);
      
      return `
      <div class="question-card bg-white rounded-xl p-4 border border-gray-200 mb-3 fade-in ${isAnswered ? 'border-r-green-500' : ''}" style="animation-delay: ${idx * 30}ms">
        <div class="flex items-start gap-3">
          <div class="flex flex-col items-center gap-1 flex-shrink-0">
            <div class="w-10 h-10 rounded-lg ${isAnswered ? 'bg-green-100' : 'bg-blue-50'} flex items-center justify-center">
              <span class="font-bold ${isAnswered ? 'text-green-600' : 'text-blue-600'} text-sm">${q.number}</span>
            </div>
            <input type="checkbox" ${isAnswered ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer mt-1"
              onclick="event.stopPropagation(); app.toggleAnswer('${q.id}')" title="סמן כנענה">
          </div>
          <div class="flex-1 min-w-0 cursor-pointer" onclick="app.toggleExpand('${q.id}')">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-xs text-gray-400">שאלה ${q.number}</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${q.length > 2000 ? 'bg-red-50 text-red-500' : q.length > 1000 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}">
                ${q.length > 2000 ? 'ארוכה' : q.length > 1000 ? 'בינונית' : 'קצרה'} (${q.length} תווים)
              </span>
              ${isAnswered ? '<span class="text-xs text-green-500"><i class="fas fa-check"></i> נענתה</span>' : ''}
            </div>
            ${isExpanded ? 
              `<div class="question-text text-gray-800 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200" style="font-size: ${state.fontSize}px; line-height: 2">${formatQuestionText(q.full_text, state.searchQuery)}</div>
               <button class="mt-2 text-sm text-blue-500 hover:text-blue-700"><i class="fas fa-compress-alt ml-1"></i>כווץ</button>` :
              `<p class="text-gray-600 text-sm line-clamp-2 leading-relaxed">${highlightSearch(escapeHtml(preview), state.searchQuery)}</p>
               <button class="mt-1 text-sm text-blue-500 hover:text-blue-700"><i class="fas fa-expand-alt ml-1"></i>הצג שאלה מלאה</button>`
            }
          </div>
        </div>
      </div>`;
    }).join('');

    const answeredInExam = currentExam.questions.filter(q => state.answeredQuestions.includes(q.id)).length;
    const examPct = Math.round((answeredInExam / currentExam.questions.length) * 100);

    return `
    <main class="max-w-6xl mx-auto px-4 py-6" style="font-size: ${state.fontSize}px">
      <!-- Back + Title -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="app.navigate('home')" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <i class="fas fa-arrow-right"></i>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-800">שאלות בגרות באזרחות</h1>
          <p class="text-sm text-gray-500">96 שאלות מ-5 מבחנים (2024-2025) עם פתרונות מלאים</p>
        </div>
      </div>

      <!-- Exam Progress -->
      <div class="glass rounded-xl p-4 border border-gray-200 mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold">${currentExam.name}</span>
          <span class="text-sm text-blue-600 font-bold">${answeredInExam}/${currentExam.questions.length} נענו</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-l from-green-400 to-green-500 rounded-full transition-all" style="width:${examPct}%"></div>
        </div>
      </div>

      <!-- Exam Tabs -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2 no-print">
        ${examTabs}
      </div>

      <!-- Search -->
      <div class="relative mb-4 no-print">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" id="searchInput" value="${escapeHtml(state.searchQuery)}" placeholder="חיפוש בשאלות..." 
          class="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-sm"
          oninput="app.setSearch(this.value)">
        ${state.searchQuery ? `<button onclick="app.setSearch(''); document.getElementById('searchInput').value=''" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>` : ''}
      </div>

      <!-- Questions Count -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500">
          ${state.searchQuery ? `נמצאו ${filteredQuestions.length} שאלות` : `${currentExam.questions.length} שאלות במבחן`}
        </span>
        <div class="flex gap-2 no-print">
          <button onclick="app.expandAll()" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <i class="fas fa-expand ml-1"></i>פתח הכל
          </button>
          <button onclick="app.collapseAll()" class="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <i class="fas fa-compress ml-1"></i>כווץ הכל
          </button>
        </div>
      </div>

      <!-- Questions List -->
      <div id="questionsList">
        ${filteredQuestions.length > 0 ? questionsHTML : '<div class="text-center py-12 text-gray-400"><i class="fas fa-search text-4xl mb-3"></i><p>לא נמצאו שאלות</p></div>'}
      </div>
    </main>`;
  }

  // ===== QUESTION DETAIL =====
  function renderQuestionDetail() {
    // This is handled by expanding within the list
    return renderQuestionsView();
  }

  // ===== HELPERS =====
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getQuestionPreview(text) {
    if (!text) return '';
    // Get first 200 chars as preview
    const clean = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    return clean.length > 200 ? clean.substring(0, 200) + '...' : clean;
  }

  function formatQuestionText(text, search) {
    if (!text) return '';
    // Split by newlines and format each line
    const lines = text.split('\n');
    let html = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        html += '<div class="h-3"></div>';
        continue;
      }
      
      // Detect special line types
      let lineClass = '';
      let prefix = '';
      
      if (/^(ציין|ציינו|הצג|הציגו|הסבר|הסבירו|צטטו)[\s–\-]/.test(trimmed)) {
        lineClass = 'bg-blue-50 border-r-4 border-blue-400 pr-3 py-2 rounded-l-lg my-1';
        prefix = '<i class="fas fa-lightbulb text-blue-400 ml-2"></i>';
      } else if (/^(א\.|ב\.|ג\.|ד\.|ה\.)\s/.test(trimmed)) {
        lineClass = 'pr-4 py-1';
      } else if (/^".*"$/.test(trimmed) || /^\".*\"$/.test(trimmed)) {
        lineClass = 'bg-amber-50 border-r-4 border-amber-400 pr-3 py-2 rounded-l-lg my-1 italic';
        prefix = '<i class="fas fa-quote-right text-amber-400 ml-2"></i>';
      } else if (/^(בעד|נגד|תומך|מתנגד)[\s–\-]/.test(trimmed)) {
        lineClass = 'bg-purple-50 border-r-4 border-purple-400 pr-3 py-2 rounded-l-lg my-1';
      }
      
      let escaped = escapeHtml(trimmed);
      if (search) escaped = highlightSearch(escaped, search);
      
      html += `<div class="${lineClass}">${prefix}${escaped}</div>`;
    }
    return html;
  }

  function highlightSearch(text, search) {
    if (!search || !search.trim()) return text;
    try {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(new RegExp(escaped, 'gi'), match => `<mark class="search-highlight">${match}</mark>`);
    } catch(e) {
      return text;
    }
  }

  // ===== APP API =====
  window.app = {
    navigate(view) {
      state.currentView = view;
      state.expandedQuestion = null;
      state.searchQuery = '';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    setStudentName(name) {
      state.studentName = name;
      saveState();
    },
    toggleUnit(id) {
      const idx = state.completedUnits.indexOf(id);
      if (idx === -1) state.completedUnits.push(id);
      else state.completedUnits.splice(idx, 1);
      saveState();
      render();
    },
    setExam(idx) {
      state.currentExam = idx;
      state.expandedQuestion = null;
      render();
    },
    setSearch(q) {
      state.searchQuery = q;
      state.expandedQuestion = null;
      render();
      // Restore cursor position
      const input = document.getElementById('searchInput');
      if (input) { input.focus(); input.value = q; }
    },
    toggleAnswer(id) {
      const idx = state.answeredQuestions.indexOf(id);
      if (idx === -1) state.answeredQuestions.push(id);
      else state.answeredQuestions.splice(idx, 1);
      saveState();
      render();
    },
    toggleExpand(id) {
      state.expandedQuestion = state.expandedQuestion === id ? null : id;
      render();
    },
    expandAll() {
      state.expandedQuestion = '__all__';
      render();
    },
    collapseAll() {
      state.expandedQuestion = null;
      render();
    },
    changeFontSize(delta) {
      state.fontSize = Math.max(12, Math.min(24, state.fontSize + delta));
      saveState();
      render();
    }
  };

  // Override expandedQuestion check for expand all
  const origToggleExpand = window.app.toggleExpand;
  const origRender = render;

  // Patch: handle __all__ state for expand all
  function isExpanded(id) {
    return state.expandedQuestion === '__all__' || state.expandedQuestion === id;
  }

  // Re-patch the renderQuestionsView to use isExpanded
  // We'll modify the global state check in the template

  function attachEvents() {
    // No extra events needed - all handled inline
  }

  // Override: patch the expanded check in render
  const _origRenderQuestionsView = renderQuestionsView;

  // Monkey-patch: replace state.expandedQuestion === q.id with isExpanded check
  // Actually, let's fix this properly in the render function above
  // The simplest way: override in the question card check

  // Initial render
  render();

})();
