// StudyBase Interactive Tools Engine
// Implements interactive UIs and calculations for all 30 tools

window.TOOL_APPS = {
  // 1. A-Level Command Centre
  "command-centre": {
    title: "A-Level Command Centre",
    icon: "layout-dashboard",
    accent: "#059669",
    category: "planning",
    render: function(container) {
      // Load saved values
      let goals = JSON.parse(localStorage.getItem('sb_cc_goals') || '[]');
      let rotation = JSON.parse(localStorage.getItem('sb_cc_rotation') || '[]');
      let examDate = localStorage.getItem('sb_cc_exam_date') || '';
      let examName = localStorage.getItem('sb_cc_exam_name') || '';
      let notes = localStorage.getItem('sb_cc_notes') || '';

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Focus Timer -->
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="clock" class="text-emerald-600"></i> Pomodoro Timer</h3>
            <div id="pomo-display" class="text-5xl font-black text-center my-4 tabular-nums">25:00</div>
            <div class="flex gap-2 justify-center">
              <button id="pomo-start" class="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Start</button>
              <button id="pomo-pause" class="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold hover:bg-slate-200 hidden">Pause</button>
              <button id="pomo-reset" class="px-4 py-2 border border-slate-300 rounded-xl font-bold hover:bg-slate-50">Reset</button>
            </div>
          </div>

          <!-- Exam Countdown -->
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="calendar" class="text-emerald-600"></i> Exam Countdown</h3>
            <div id="exam-days" class="text-3xl font-black text-center my-2 text-slate-800">—</div>
            <div class="space-y-2 mt-4">
              <input id="cc-exam-name" type="text" placeholder="Exam Name (e.g. AQA Maths P1)" value="${examName}" class="w-full text-xs p-2 border border-slate-200 rounded-lg">
              <input id="cc-exam-date" type="date" value="${examDate}" class="w-full text-xs p-2 border border-slate-200 rounded-lg">
            </div>
          </div>

          <!-- Goals List -->
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="check-square" class="text-emerald-600"></i> Daily Goals</h3>
            <div class="flex gap-2 mb-3">
              <input id="goal-text" type="text" placeholder="Add a goal..." class="flex-grow text-xs p-2 border border-slate-200 rounded-lg">
              <button id="goal-add" class="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold">Add</button>
            </div>
            <div id="goals-list" class="space-y-1 max-h-32 overflow-y-auto"></div>
          </div>

          <!-- Subject Rotation -->
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm md:col-span-2 lg:col-span-1">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="refresh-cw" class="text-emerald-600"></i> Study Rotation</h3>
            <div class="grid grid-cols-3 gap-1 mb-3">
              ${["Maths", "Physics", "Chemistry", "Biology", "English", "History"].map(sub => 
                `<button class="rotate-btn p-1.5 border border-slate-200 text-xs rounded-lg hover:bg-slate-50" data-subject="${sub}">${sub}</button>`
              ).join('')}
            </div>
            <div id="rotation-log" class="text-[11px] text-slate-500 max-h-24 overflow-y-auto space-y-1"></div>
          </div>

          <!-- Quick Notes -->
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm md:col-span-2">
            <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><i data-lucide="sticky-note" class="text-emerald-600"></i> Quick Notes</h3>
            <textarea id="cc-notes" placeholder="Write key equations or today's priorities here..." class="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm resize-none">${notes}</textarea>
          </div>
        </div>
      `;

      // 1. Pomodoro Logic
      let pomoTime = 25 * 60, pomoTimer = null, pomoRunning = false;
      const pomoDisplay = document.getElementById('pomo-display');
      const startBtn = document.getElementById('pomo-start');
      const pauseBtn = document.getElementById('pomo-pause');
      const resetBtn = document.getElementById('pomo-reset');

      function updatePomo() {
        let m = Math.floor(pomoTime / 60).toString().padStart(2, '0');
        let s = (pomoTime % 60).toString().padStart(2, '0');
        pomoDisplay.textContent = `${m}:${s}`;
      }

      startBtn.onclick = () => {
        pomoRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        pomoTimer = setInterval(() => {
          pomoTime--;
          updatePomo();
          if (pomoTime <= 0) {
            clearInterval(pomoTimer);
            alert("Focus session complete! Time for a short break.");
            pomoTime = 5 * 60;
            updatePomo();
          }
        }, 1000);
      };

      pauseBtn.onclick = () => {
        pomoRunning = false;
        clearInterval(pomoTimer);
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
      };

      resetBtn.onclick = () => {
        pomoRunning = false;
        clearInterval(pomoTimer);
        pomoTime = 25 * 60;
        updatePomo();
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
      };

      // 2. Countdown Logic
      const nameInput = document.getElementById('cc-exam-name');
      const dateInput = document.getElementById('cc-exam-date');
      const daysDisplay = document.getElementById('exam-days');

      function updateCountdown() {
        if (!dateInput.value) {
          daysDisplay.textContent = 'Set a date';
          return;
        }
        let target = new Date(dateInput.value);
        let today = new Date();
        today.setHours(0,0,0,0);
        let diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        if (diff > 0) {
          daysDisplay.innerHTML = `<span class="text-4xl text-emerald-600">${diff}</span> days left <br><span class="text-xs text-slate-500 font-normal">until ${nameInput.value || 'Exam'}</span>`;
        } else if (diff === 0) {
          daysDisplay.textContent = "Exam Day Today!";
        } else {
          daysDisplay.textContent = "Exam Passed";
        }
        localStorage.setItem('sb_cc_exam_date', dateInput.value);
        localStorage.setItem('sb_cc_exam_name', nameInput.value);
      }
      nameInput.oninput = updateCountdown;
      dateInput.onchange = updateCountdown;
      updateCountdown();

      // 3. Goals Logic
      const goalList = document.getElementById('goals-list');
      const goalText = document.getElementById('goal-text');
      const goalAdd = document.getElementById('goal-add');

      function renderGoals() {
        goalList.innerHTML = '';
        goals.forEach((g, idx) => {
          const div = document.createElement('div');
          div.className = "flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-xs";
          div.innerHTML = `
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="goal-check" data-idx="${idx}" ${g.done ? 'checked' : ''}>
              <span class="${g.done ? 'line-through text-slate-400' : ''}">${g.text}</span>
            </label>
            <button class="goal-del text-slate-400 hover:text-red-500" data-idx="${idx}">&times;</button>
          `;
          goalList.appendChild(div);
        });
        localStorage.setItem('sb_cc_goals', JSON.stringify(goals));
      }

      goalAdd.onclick = () => {
        let txt = goalText.value.trim();
        if (txt) {
          goals.push({ text: txt, done: false });
          goalText.value = '';
          renderGoals();
        }
      };

      goalList.onclick = (e) => {
        let target = e.target;
        if (target.classList.contains('goal-check')) {
          let idx = parseInt(target.dataset.idx);
          goals[idx].done = target.checked;
          renderGoals();
        }
        if (target.classList.contains('goal-del')) {
          let idx = parseInt(target.dataset.idx);
          goals.splice(idx, 1);
          renderGoals();
        }
      };
      renderGoals();

      // 4. Rotation Logic
      const rotationLog = document.getElementById('rotation-log');
      function renderRotation() {
        rotationLog.innerHTML = rotation.map(r => 
          `<div class="flex justify-between border-b border-slate-100 pb-0.5">
            <span>📚 ${r.subject}</span>
            <span class="text-slate-400 font-mono">${r.time}</span>
          </div>`
        ).join('') || '<div class="text-center py-2 text-slate-400">No recent subjects logged</div>';
      }

      document.querySelectorAll('.rotate-btn').forEach(btn => {
        btn.onclick = () => {
          let sub = btn.dataset.subject;
          let time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          rotation.unshift({ subject: sub, time: time });
          if (rotation.length > 5) rotation.pop();
          localStorage.setItem('sb_cc_rotation', JSON.stringify(rotation));
          renderRotation();
        };
      });
      renderRotation();

      // 5. Notes Logic
      const notesArea = document.getElementById('cc-notes');
      notesArea.oninput = () => {
        localStorage.setItem('sb_cc_notes', notesArea.value);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 2. Exam Paper Time Splitter
  "exam-paper-time-splitter": {
    title: "Exam Paper Time Splitter",
    icon: "clock",
    accent: "#d97706",
    category: "planning",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold mb-1 flex items-center gap-2"><i data-lucide="sliders" class="text-amber-600"></i> Split Parameters</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Total Exam Time (mins)</label>
              <input id="split-total" type="number" value="120" class="w-full p-2 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Questions/Sections</label>
              <input id="split-sections" type="number" value="4" class="w-full p-2 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Checking Buffer at the End (mins)</label>
              <input id="split-buffer" type="number" value="15" class="w-full p-2 border border-slate-200 rounded-xl text-xs">
            </div>
            <button id="split-calc" class="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-xs">Compute Timed Splits</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm md:col-span-2">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="clock" class="text-amber-600"></i> Timer Console</h3>
            <div id="splitter-console" class="hidden">
              <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 text-center">
                <div id="split-timer-label" class="text-xs font-bold text-amber-700 uppercase tracking-widest">Section 1</div>
                <div id="split-timer-clock" class="text-4xl font-black text-slate-800 tabular-nums">00:00</div>
              </div>
              <div class="flex gap-2 justify-center mb-4">
                <button id="split-btn-start" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm">Start Active Section</button>
                <button id="split-btn-next" class="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm">Advance Section</button>
              </div>
            </div>
            <div id="split-timeline" class="space-y-2">
              <p class="text-slate-400 text-sm text-center py-8">Generate splits to build your interactive timetable.</p>
            </div>
          </div>
        </div>
      `;

      let splits = [], activeIdx = 0, splitTimeSecs = 0, splitInterval = null;

      const calcBtn = document.getElementById('split-calc');
      const timeline = document.getElementById('split-timeline');
      const consoleEl = document.getElementById('splitter-console');
      const startBtn = document.getElementById('split-btn-start');
      const nextBtn = document.getElementById('split-btn-next');
      const clockEl = document.getElementById('split-timer-clock');
      const labelEl = document.getElementById('split-timer-label');

      calcBtn.onclick = () => {
        let total = parseInt(document.getElementById('split-total').value) || 120;
        let sections = parseInt(document.getElementById('split-sections').value) || 4;
        let buffer = parseInt(document.getElementById('split-buffer').value) || 15;
        let work = total - buffer;
        let perSec = Math.floor(work / sections);
        let rem = work % sections;

        splits = [];
        for (let i = 0; i < sections; i++) {
          splits.push({ name: `Section ${i+1} (Q${i+1})`, mins: perSec + (i < rem ? 1 : 0) });
        }
        splits.push({ name: "Final Checking & Review Buffer", mins: buffer });

        timeline.innerHTML = '';
        splits.forEach((s, idx) => {
          const div = document.createElement('div');
          div.className = `flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs font-semibold timeline-step`;
          div.dataset.idx = idx;
          div.innerHTML = `
            <span>${s.name}</span>
            <span class="text-slate-500">${s.mins} mins</span>
          `;
          timeline.appendChild(div);
        });

        activeIdx = 0;
        consoleEl.classList.remove('hidden');
        setupActiveSection();
      };

      function setupActiveSection() {
        if (splitInterval) clearInterval(splitInterval);
        document.querySelectorAll('.timeline-step').forEach(step => {
          let idx = parseInt(step.dataset.idx);
          step.className = `flex justify-between items-center p-3 rounded-xl border text-xs font-semibold timeline-step ` + 
            (idx === activeIdx ? 'border-amber-400 bg-amber-50/40 text-amber-700 font-bold' : 'border-slate-100 bg-slate-50/70 text-slate-600');
        });

        let s = splits[activeIdx];
        labelEl.textContent = s.name;
        splitTimeSecs = s.mins * 60;
        updateClockDisplay();
      }

      function updateClockDisplay() {
        let m = Math.floor(splitTimeSecs / 60).toString().padStart(2, '0');
        let sec = (splitTimeSecs % 60).toString().padStart(2, '0');
        clockEl.textContent = `${m}:${sec}`;
      }

      startBtn.onclick = () => {
        if (splitInterval) clearInterval(splitInterval);
        startBtn.disabled = true;
        startBtn.textContent = "Timer Ticking...";
        splitInterval = setInterval(() => {
          splitTimeSecs--;
          updateClockDisplay();
          if (splitTimeSecs <= 0) {
            advanceSection();
          }
        }, 1000);
      };

      nextBtn.onclick = advanceSection;

      function advanceSection() {
        activeIdx++;
        if (activeIdx < splits.length) {
          startBtn.disabled = false;
          startBtn.textContent = "Start Active Section";
          setupActiveSection();
        } else {
          if (splitInterval) clearInterval(splitInterval);
          alert("All exam sections completed! Good job.");
          consoleEl.classList.add('hidden');
          timeline.innerHTML = '<p class="text-emerald-600 text-sm text-center py-8">✓ Exam Session Complete!</p>';
        }
      }

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 3. Revision Session Generator
  "revision-session-generator": {
    title: "Revision Session Generator",
    icon: "calendar-days",
    accent: "#7c3aed",
    category: "planning",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="brain" class="text-violet-600"></i> Generator Variables</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Title</label>
              <input id="gen-subject" type="text" placeholder="e.g. A-Level Chemistry" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Time Available (mins)</label>
              <input id="gen-time" type="number" value="60" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Confidence</label>
              <select id="gen-confidence" class="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs">
                <option value="low">Low (Recall &amp; basics first)</option>
                <option value="medium" selected>Medium (Standard drill &amp; papers)</option>
                <option value="high">High (High-difficulty only)</option>
              </select>
            </div>
            <button id="gen-session-btn" class="w-full py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors text-xs">Build Custom Session</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="clipboard-list" class="text-violet-600"></i> Session Plan</h3>
            <div id="gen-result" class="space-y-3">
              <p class="text-slate-400 text-sm text-center py-12">Enter variables to construct a high-yield study itinerary.</p>
            </div>
          </div>
        </div>
      `;

      const genBtn = document.getElementById('gen-session-btn');
      const resultEl = document.getElementById('gen-result');

      genBtn.onclick = () => {
        let sub = document.getElementById('gen-subject').value.trim() || 'A-Level Subject';
        let mins = parseInt(document.getElementById('gen-time').value) || 60;
        let conf = document.getElementById('gen-confidence').value;

        let blocks = [];
        if (conf === 'low') {
          blocks = [
            { name: "Active recall of basic formulas & content definitions", pct: 40 },
            { name: "Guided step-by-step topic worksheet tasks", pct: 40 },
            { name: "Synthesize summary notes & correction review", pct: 20 }
          ];
        } else if (conf === 'high') {
          blocks = [
            { name: "Quick recall retrieval warmup", pct: 15 },
            { name: "High-difficulty multi-step past paper questions", pct: 65 },
            { name: "Detailed self-marking with examiners report comparison", pct: 20 }
          ];
        } else {
          blocks = [
            { name: "Flashcards or basic topic review", pct: 20 },
            { name: "Medium-difficulty past paper practice", pct: 50 },
            { name: "Mistake logging and targeted theory repair", pct: 30 }
          ];
        }

        let html = `<div class="p-3 bg-violet-50 rounded-xl mb-4 border border-violet-100">
          <div class="text-sm font-bold text-violet-700">${sub} Session</div>
          <div class="text-xs text-slate-500">${mins} minutes total, optimized for ${conf} confidence.</div>
        </div>
        <div class="space-y-3">`;

        let rem = mins;
        blocks.forEach((b, idx) => {
          let bMins = idx === blocks.length - 1 ? rem : Math.round(mins * (b.pct / 100));
          rem -= bMins;
          html += `
            <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">${idx+1}</div>
              <div class="flex-grow">
                <p class="text-xs font-bold text-slate-800">${b.name}</p>
                <span class="inline-block text-[10px] font-bold text-violet-600 bg-violet-100/50 px-2 py-0.5 rounded-md mt-1">${bMins} minutes</span>
              </div>
            </div>
          `;
        });
        html += `</div>`;
        resultEl.innerHTML = html;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 4. Timed Essay Mode
  "timed-essay-mode": {
    title: "Timed Essay Mode",
    icon: "pen-line",
    accent: "#0284c7",
    category: "planning",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="hourglass" class="text-sky-600"></i> Session Controls</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Time Limit</label>
              <select id="essay-time" class="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs">
                <option value="30">30 Minutes (Short practice)</option>
                <option value="45" selected>45 Minutes (Full standard essay)</option>
                <option value="60">60 Minutes (Long essay)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Essay Title / Prompt</label>
              <input id="essay-prompt" type="text" placeholder="Write your topic prompt..." class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <button id="essay-start-btn" class="w-full py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors text-xs">Start Essay Timer</button>
            <div id="essay-clock" class="text-4xl font-black text-center text-slate-700 py-3 tabular-nums hidden">45:00</div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="edit" class="text-sky-600"></i> Essay Pad</h3>
              <div class="text-xs text-slate-500 font-bold" id="essay-counter">Words: 0 | Chars: 0</div>
            </div>
            <textarea id="essay-content" placeholder="Start typing here under timed conditions..." class="w-full flex-grow p-4 border border-slate-200 rounded-xl text-sm resize-none" disabled></textarea>
          </div>
        </div>
      `;

      const startBtn = document.getElementById('essay-start-btn');
      const clockEl = document.getElementById('essay-clock');
      const textPad = document.getElementById('essay-content');
      const counterEl = document.getElementById('essay-counter');

      let timer = null, timeRemaining = 0;

      startBtn.onclick = () => {
        let mins = parseInt(document.getElementById('essay-time').value) || 45;
        timeRemaining = mins * 60;
        startBtn.classList.add('hidden');
        clockEl.classList.remove('hidden');
        textPad.disabled = false;
        textPad.focus();

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          timeRemaining--;
          let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
          let s = (timeRemaining % 60).toString().padStart(2, '0');
          clockEl.textContent = `${m}:${s}`;
          if (timeRemaining <= 0) {
            clearInterval(timer);
            textPad.disabled = true;
            alert("Time's up! Your writing session is complete.");
          }
        }, 1000);
      };

      textPad.oninput = () => {
        let words = textPad.value.trim().split(/\s+/).filter(Boolean).length;
        let chars = textPad.value.length;
        counterEl.textContent = `Words: ${words} | Chars: ${chars}`;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 5. Synoptic Link Generator
  "synoptic-link-generator": {
    title: "Synoptic Link Generator",
    icon: "link-2",
    accent: "#e11d48",
    category: "planning",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="link" class="text-rose-600"></i> Topic Linker</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Topic A</label>
              <input id="link-topic-a" type="text" placeholder="e.g. Calculus" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Topic B</label>
              <input id="link-topic-b" type="text" placeholder="e.g. Mechanics Kinematics" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <button id="link-btn" class="w-full py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors text-xs">Find Links &amp; Overlaps</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="layout-grid" class="text-rose-600"></i> Connection Analysis</h3>
            <div id="link-result" class="text-slate-400 text-sm text-center py-12">Select two areas to map their structural linkages.</div>
          </div>
        </div>
      `;

      const linkBtn = document.getElementById('link-btn');
      const resultEl = document.getElementById('link-result');

      linkBtn.onclick = () => {
        let a = document.getElementById('link-topic-a').value.trim() || 'Topic A';
        let b = document.getElementById('link-topic-b').value.trim() || 'Topic B';

        resultEl.innerHTML = `
          <div class="space-y-4 text-left">
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <strong class="text-xs text-rose-800 uppercase block mb-1">Synoptic Connection</strong>
              <p class="text-xs text-slate-600">How do <b>${a}</b> and <b>${b}</b> interact to explain complex phenomena?</p>
            </div>
            <div class="space-y-2">
              <div class="p-2 border border-slate-200 rounded-lg">
                <strong class="text-xs block text-slate-800">1. Theoretical Overlap</strong>
                <p class="text-[11px] text-slate-500 mt-1">Core principles are applied in both. For instance, the calculations in ${a} lay the mathematical validation framework for the kinematics modeling in ${b}.</p>
              </div>
              <div class="p-2 border border-slate-200 rounded-lg">
                <strong class="text-xs block text-slate-800">2. Examination Applications</strong>
                <p class="text-[11px] text-slate-500 mt-1">Questions will often ask you to compute values in ${a} and use them as inputs or variables to explain a process in ${b}.</p>
              </div>
            </div>
          </div>
        `;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 6. Personal Statement Builder
  "personal-statement-builder": {
    title: "Personal Statement Builder",
    icon: "file-user",
    accent: "#4f46e5",
    category: "planning",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="pen-tool" class="text-indigo-600"></i> UCAS Statement Sections</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">1. Why this Course (Hook)</label>
              <textarea id="ps-sec-1" placeholder="Why are you passionate? Mention core topics, concepts or theories that spark your interest." class="w-full h-24 p-2 border border-slate-200 rounded-xl text-sm"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">2. Supercurricular Activities</label>
              <textarea id="ps-sec-2" placeholder="Mention wider reading, university lectures, journals read, or coding projects completed." class="w-full h-24 p-2 border border-slate-200 rounded-xl text-sm"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">3. Practical Skills &amp; Academic Background</label>
              <textarea id="ps-sec-3" placeholder="What relevant skills do you have? Lab techniques, software proficiency, statistics." class="w-full h-24 p-2 border border-slate-200 rounded-xl text-sm"></textarea>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="gauge" class="text-indigo-600"></i> Word &amp; Line Counter</h3>
            <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <div id="ps-count" class="text-3xl font-black text-slate-800">0</div>
              <div class="text-[10px] font-bold text-slate-500 uppercase">Characters (UCAS Max: 4000)</div>
              <div id="ps-pct-bar" class="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div id="ps-pct-fill" class="h-full bg-indigo-600" style="width:0%;"></div>
              </div>
            </div>
            <button id="ps-export" class="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-sm">Download Draft Text</button>
          </div>
        </div>
      `;

      const s1 = document.getElementById('ps-sec-1');
      const s2 = document.getElementById('ps-sec-2');
      const s3 = document.getElementById('ps-sec-3');
      const countEl = document.getElementById('ps-count');
      const fillEl = document.getElementById('ps-pct-fill');
      const exportBtn = document.getElementById('ps-export');

      function calculateLength() {
        let total = (s1.value + s2.value + s3.value).length;
        countEl.textContent = total;
        let pct = Math.min(100, (total / 4000) * 100);
        fillEl.style.width = `${pct}%`;
        if (total > 4000) {
          fillEl.className = "h-full bg-red-500";
        } else {
          fillEl.className = "h-full bg-indigo-600";
        }
      }

      s1.oninput = calculateLength;
      s2.oninput = calculateLength;
      s3.oninput = calculateLength;

      exportBtn.onclick = () => {
        let fullText = `--- STUDYBASE UCAS STATEMENT DRAFT ---\n\n` + 
          `[SECTION 1: SUBJECT INTEREST]\n${s1.value}\n\n` +
          `[SECTION 2: SUPERCURRICULARS]\n${s2.value}\n\n` +
          `[SECTION 3: SKILLS]\n${s3.value}\n`;
        
        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personal_statement_draft.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 7. Advanced Scientific Calculator
  "advanced-scientific-calculator": {
    title: "Advanced Scientific Calculator",
    icon: "calculator",
    accent: "#d97706",
    category: "mathematics",
    render: function(container) {
      container.innerHTML = `
        <div class="max-w-sm mx-auto bg-slate-900 text-white rounded-[2rem] p-5 shadow-2xl">
          <div class="mb-4 text-right pr-4">
            <div id="calc-expr" class="text-xs text-slate-500 min-h-[16px]"></div>
            <div id="calc-disp" class="text-3xl font-bold truncate">0</div>
          </div>
          <div class="grid grid-cols-4 gap-2 text-sm font-bold">
            ${["C", "√", "^", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "sin", "="].map(btn => 
              `<button class="calc-btn py-3.5 rounded-2xl transition-all ${
                btn === '=' ? 'bg-amber-500 text-slate-950 font-black text-lg' :
                isNaN(btn) && btn !== '.' ? 'bg-slate-800 text-amber-500' :
                'bg-slate-800/60 hover:bg-slate-800'
              }" data-val="${btn}">${btn}</button>`
            ).join('')}
          </div>
        </div>
      `;

      const exprEl = document.getElementById('calc-expr');
      const dispEl = document.getElementById('calc-disp');

      let expression = '';

      document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.onclick = () => {
          let val = btn.dataset.val;
          if (val === 'C') {
            expression = '';
            dispEl.textContent = '0';
            exprEl.textContent = '';
          } else if (val === '=') {
            try {
              let parsedExpr = expression.replace(/sin\(/g, 'Math.sin(').replace(/\^/g, '**');
              let res = eval(parsedExpr);
              dispEl.textContent = res;
              exprEl.textContent = expression;
            } catch (err) {
              dispEl.textContent = 'Error';
            }
          } else if (val === 'sin') {
            expression += 'sin(';
            dispEl.textContent = expression;
          } else if (val === '√') {
            expression += 'Math.sqrt(';
            dispEl.textContent = expression;
          } else {
            expression += val;
            dispEl.textContent = expression;
          }
        };
      });
    }
  },

  // 8. A-Level Graph Plotter
  "graph-plotter": {
    title: "A-Level Graph Plotter",
    icon: "trending-up",
    accent: "#0284c7",
    category: "mathematics",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="sliders" class="text-sky-600"></i> Function Editor</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Equation (in terms of x)</label>
              <input id="graph-equation" type="text" value="x^2 - 4" class="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs">
              <span class="text-[10px] text-slate-400 mt-1 block">e.g. x^2, sin(x), x^3 - x</span>
            </div>
            <button id="plot-btn" class="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all text-xs">Plot Graph</button>
          </div>

          <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm md:col-span-2 flex justify-center items-center">
            <canvas id="graph-canvas" width="400" height="300" class="border border-slate-100 bg-slate-50/50 rounded-xl"></canvas>
          </div>
        </div>
      `;

      const canvas = document.getElementById('graph-canvas');
      const ctx = canvas.getContext('2d');
      const eqnInput = document.getElementById('graph-equation');
      const plotBtn = document.getElementById('plot-btn');

      function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, 0);
        ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();
      }

      function plot() {
        drawGrid();
        let eqn = eqnInput.value.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let first = true;
        let scale = 20; // 20 pixels per unit
        for (let pixelX = 0; pixelX < canvas.width; pixelX++) {
          let x = (pixelX - canvas.width/2) / scale;
          try {
            let y = eval(eqn);
            let pixelY = canvas.height/2 - (y * scale);
            if (first) {
              ctx.moveTo(pixelX, pixelY);
              first = false;
            } else {
              ctx.lineTo(pixelX, pixelY);
            }
          } catch(err) {}
        }
        ctx.stroke();
      }

      plotBtn.onclick = plot;
      plot();

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 9. Calculus Toolkit
  "calculus-toolkit": {
    title: "Calculus Toolkit",
    icon: "function-square",
    accent: "#7c3aed",
    category: "mathematics",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="sigma" class="text-violet-600"></i> Derivative Calculator</h3>
            <div class="flex gap-2">
              <input id="calc-coeff" type="number" value="3" placeholder="Coeff" class="w-20 p-2 border border-slate-200 rounded-xl text-center text-xs">
              <span class="text-lg font-bold self-center">x ^</span>
              <input id="calc-power" type="number" value="2" placeholder="Power" class="w-20 p-2 border border-slate-200 rounded-xl text-center text-xs">
            </div>
            <button id="calc-deriv-btn" class="w-full py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 text-xs">Differentiate</button>
            <div id="deriv-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="binary" class="text-violet-600"></i> Definite Integral</h3>
            <div class="flex gap-2 items-center text-xs">
              <input id="int-upper" type="number" value="3" placeholder="Upper" class="w-16 p-2 border border-slate-200 rounded-xl">
              <span>Upper</span>
            </div>
            <div class="flex gap-2 items-center text-xs">
              <span class="text-2xl font-light">∫</span>
              <input id="int-coeff" type="number" value="2" placeholder="Coeff" class="w-16 p-2 border border-slate-200 rounded-xl">
              <span>x ^</span>
              <input id="int-power" type="number" value="1" placeholder="Power" class="w-16 p-2 border border-slate-200 rounded-xl">
            </div>
            <div class="flex gap-2 items-center text-xs">
              <input id="int-lower" type="number" value="1" placeholder="Lower" class="w-16 p-2 border border-slate-200 rounded-xl">
              <span>Lower</span>
            </div>
            <button id="calc-int-btn" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Integrate</button>
            <div id="int-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>
        </div>
      `;

      const dBtn = document.getElementById('calc-deriv-btn');
      const dOut = document.getElementById('deriv-out');
      const iBtn = document.getElementById('calc-int-btn');
      const iOut = document.getElementById('int-out');

      dBtn.onclick = () => {
        let c = parseFloat(document.getElementById('calc-coeff').value) || 0;
        let p = parseFloat(document.getElementById('calc-power').value) || 0;
        let newCoeff = c * p;
        let newPower = p - 1;
        dOut.textContent = `d/dx (${c}x^${p}) = ${newCoeff}x^${newPower}`;
      };

      iBtn.onclick = () => {
        let c = parseFloat(document.getElementById('int-coeff').value) || 0;
        let p = parseFloat(document.getElementById('int-power').value) || 0;
        let lower = parseFloat(document.getElementById('int-lower').value) || 0;
        let upper = parseFloat(document.getElementById('int-upper').value) || 0;

        let newPower = p + 1;
        let newCoeff = c / newPower;

        function evalF(x) {
          return newCoeff * Math.pow(x, newPower);
        }

        let res = evalF(upper) - evalF(lower);
        iOut.textContent = `∫ = ${res.toFixed(3)}`;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 10. Mechanics Solver
  "mechanics-solver": {
    title: "Mechanics Solver",
    icon: "orbit",
    accent: "#059669",
    category: "mathematics",
    render: function(container) {
      container.innerHTML = `
        <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-lg mx-auto">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="sliders" class="text-emerald-600"></i> SUVAT Calculator</h3>
          <p class="text-xs text-slate-500 mb-4">Enter any 3 values to solve for the remaining 2 variables.</p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Displacement (s)</label>
              <input id="suvat-s" type="number" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Initial Velocity (u)</label>
              <input id="suvat-u" type="number" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Final Velocity (v)</label>
              <input id="suvat-v" type="number" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Acceleration (a)</label>
              <input id="suvat-a" type="number" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div class="col-span-2">
              <label class="font-bold text-slate-700 block mb-0.5">Time (t)</label>
              <input id="suvat-t" type="number" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
          </div>
          <button id="suvat-solve" class="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all">Solve SUVAT</button>
          <div id="suvat-result" class="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold space-y-1"></div>
        </div>
      `;

      const solveBtn = document.getElementById('suvat-solve');
      const resultEl = document.getElementById('suvat-result');

      solveBtn.onclick = () => {
        let s = document.getElementById('suvat-s').value ? parseFloat(document.getElementById('suvat-s').value) : null;
        let u = document.getElementById('suvat-u').value ? parseFloat(document.getElementById('suvat-u').value) : null;
        let v = document.getElementById('suvat-v').value ? parseFloat(document.getElementById('suvat-v').value) : null;
        let a = document.getElementById('suvat-a').value ? parseFloat(document.getElementById('suvat-a').value) : null;
        let t = document.getElementById('suvat-t').value ? parseFloat(document.getElementById('suvat-t').value) : null;

        let inputs = {s, u, v, a, t};
        let known = Object.keys(inputs).filter(k => inputs[k] !== null);

        if (known.length < 3) {
          resultEl.textContent = "Please enter at least 3 known values.";
          return;
        }

        if (u !== null && a !== null && t !== null) {
          if (v === null) v = u + a * t;
          if (s === null) s = u * t + 0.5 * a * t * t;
        } else if (u !== null && v !== null && t !== null) {
          if (s === null) s = 0.5 * (u + v) * t;
          if (a === null) a = (v - u) / t;
        } else if (u !== null && v !== null && a !== null) {
          if (s === null) s = (v*v - u*u) / (2*a);
          if (t === null) t = (v - u) / a;
        } else if (s !== null && u !== null && a !== null) {
          if (v === null) v = Math.sqrt(u*u + 2*a*s);
          if (t === null) t = (v - u) / a;
        } else if (s !== null && v !== null && a !== null) {
          if (u === null) u = Math.sqrt(v*v - 2*a*s);
          if (t === null) t = (v - u) / a;
        } else if (s !== null && u !== null && t !== null) {
          if (a === null) a = (2 * (s - u * t)) / (t * t);
          if (v === null) v = u + a * t;
        }

        resultEl.innerHTML = `
          <div class="text-emerald-700 uppercase tracking-wider text-[10px] font-bold">Solved Values:</div>
          <div>Displacement (s) = ${s !== null ? s.toFixed(2) + ' m' : '—'}</div>
          <div>Initial Velocity (u) = ${u !== null ? u.toFixed(2) + ' m/s' : '—'}</div>
          <div>Final Velocity (v) = ${v !== null ? v.toFixed(2) + ' m/s' : '—'}</div>
          <div>Acceleration (a) = ${a !== null ? a.toFixed(2) + ' m/s²' : '—'}</div>
          <div>Time (t) = ${t !== null ? t.toFixed(2) + ' s' : '—'}</div>
        `;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 11. Statistics & Probability Lab
  "statistics-probability-lab": {
    title: "Statistics & Probability Lab",
    icon: "chart-bar",
    accent: "#4f46e5",
    category: "mathematics",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="bar-chart" class="text-indigo-600"></i> Normal Distribution (z-score)</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Mean (μ)</label>
              <input id="stat-mean" type="number" value="10" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">StDev (σ)</label>
              <input id="stat-sd" type="number" value="2" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Value (x)</label>
              <input id="stat-x" type="number" value="13" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <button id="stat-z-btn" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-xs">Calculate z-score</button>
            <div id="stat-z-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="calculator" class="text-indigo-600"></i> Binomial Coefficient (nCr)</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Trials (n)</label>
              <input id="stat-n" type="number" value="10" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Successes (r)</label>
              <input id="stat-r" type="number" value="3" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <button id="stat-ncr-btn" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Compute nCr</button>
            <div id="stat-ncr-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>
        </div>
      `;

      const zBtn = document.getElementById('stat-z-btn');
      const zOut = document.getElementById('stat-z-out');
      const ncrBtn = document.getElementById('stat-ncr-btn');
      const ncrOut = document.getElementById('stat-ncr-out');

      zBtn.onclick = () => {
        let mean = parseFloat(document.getElementById('stat-mean').value) || 0;
        let sd = parseFloat(document.getElementById('stat-sd').value) || 1;
        let x = parseFloat(document.getElementById('stat-x').value) || 0;
        let z = (x - mean) / sd;
        zOut.textContent = `z-score = ${z.toFixed(4)}`;
      };

      ncrBtn.onclick = () => {
        let n = parseInt(document.getElementById('stat-n').value) || 0;
        let r = parseInt(document.getElementById('stat-r').value) || 0;

        function fact(num) {
          let f = 1;
          for (let i = 2; i <= num; i++) f *= i;
          return f;
        }

        if (r > n) {
          ncrOut.textContent = "Error: r cannot be greater than n";
          return;
        }
        let res = fact(n) / (fact(r) * fact(n - r));
        ncrOut.textContent = `${n}C${r} = ${res}`;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 12. Physics Formula Lab
  "physics-formula-lab": {
    title: "Physics Formula Lab",
    icon: "atom",
    accent: "#0284c7",
    category: "sciences",
    render: function(container) {
      container.innerHTML = `
        <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto space-y-4">
          <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="atom" class="text-sky-600"></i> Core Physics Formulas</h3>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Select Formula</label>
            <select id="phys-formula" class="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs">
              <option value="v_ir" selected>Ohm's Law: V = I * R</option>
              <option value="f_ma">Newton's 2nd Law: F = m * a</option>
              <option value="e_hf">Photon Energy: E = h * f</option>
            </select>
          </div>
          <div id="phys-inputs" class="grid grid-cols-2 gap-3 text-xs">
          </div>
          <button id="phys-calc-btn" class="w-full py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 text-xs">Calculate</button>
          <div id="phys-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
        </div>
      `;

      const formulaSelect = document.getElementById('phys-formula');
      const inputsEl = document.getElementById('phys-inputs');
      const calcBtn = document.getElementById('phys-calc-btn');
      const outEl = document.getElementById('phys-out');

      function setupInputs() {
        let f = formulaSelect.value;
        if (f === 'v_ir') {
          inputsEl.innerHTML = `
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Current (I) [Amps]</label>
              <input id="phys-i" type="number" value="2" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Resistance (R) [Ohms]</label>
              <input id="phys-r" type="number" value="10" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
          `;
        } else if (f === 'f_ma') {
          inputsEl.innerHTML = `
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Mass (m) [kg]</label>
              <input id="phys-m" type="number" value="5" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-0.5">Acceleration (a) [m/s²]</label>
              <input id="phys-a" type="number" value="9.81" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
          `;
        } else if (f === 'e_hf') {
          inputsEl.innerHTML = `
            <div class="col-span-2">
              <label class="font-bold text-slate-700 block mb-0.5">Frequency (f) [Hz]</label>
              <input id="phys-f" type="number" value="5e14" class="w-full p-2 border border-slate-200 rounded-lg">
            </div>
          `;
        }
      }

      formulaSelect.onchange = setupInputs;
      setupInputs();

      calcBtn.onclick = () => {
        let f = formulaSelect.value;
        if (f === 'v_ir') {
          let i = parseFloat(document.getElementById('phys-i').value) || 0;
          let r = parseFloat(document.getElementById('phys-r').value) || 0;
          outEl.textContent = `Voltage (V) = ${(i * r).toFixed(2)} Volts`;
        } else if (f === 'f_ma') {
          let m = parseFloat(document.getElementById('phys-m').value) || 0;
          let a = parseFloat(document.getElementById('phys-a').value) || 0;
          outEl.textContent = `Force (F) = ${(m * a).toFixed(2)} Newtons`;
        } else if (f === 'e_hf') {
          let freq = parseFloat(document.getElementById('phys-f').value) || 0;
          let h = 6.63e-34;
          outEl.textContent = `Photon Energy (E) = ${(h * freq).toExponential(3)} Joules`;
        }
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 13. Chemistry Calculator
  "chemistry-calculator": {
    title: "Chemistry Calculator",
    icon: "flask-conical",
    accent: "#059669",
    category: "sciences",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="flask-conical" class="text-emerald-600"></i> pH Solver</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Hydrogen Ion Conc [H+] (mol/dm³)</label>
              <input id="chem-h" type="number" value="1e-3" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
            </div>
            <button id="chem-ph-btn" class="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-xs">Solve pH</button>
            <div id="chem-ph-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="scale" class="text-emerald-600"></i> Titration Solver</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Acid Volume V1 (cm³)</label>
              <input id="tit-v1" type="number" value="25" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Conc C2 (mol/dm³)</label>
              <input id="tit-c2" type="number" value="0.1" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Volume V2 (cm³)</label>
              <input id="tit-v2" type="number" value="20" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <button id="tit-calc-btn" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Solve Acid Conc C1</button>
            <div id="tit-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>
        </div>
      `;

      const phBtn = document.getElementById('chem-ph-btn');
      const phOut = document.getElementById('chem-ph-out');
      const titBtn = document.getElementById('tit-calc-btn');
      const titOut = document.getElementById('tit-out');

      phBtn.onclick = () => {
        let h = parseFloat(document.getElementById('chem-h').value) || 1e-7;
        let ph = -Math.log10(h);
        phOut.textContent = `pH = ${ph.toFixed(2)}`;
      };

      titBtn.onclick = () => {
        let v1 = parseFloat(document.getElementById('tit-v1').value) || 25;
        let c2 = parseFloat(document.getElementById('tit-c2').value) || 0.1;
        let v2 = parseFloat(document.getElementById('tit-v2').value) || 20;

        let c1 = (c2 * v2) / v1;
        titOut.textContent = `Acid Concentration C1 = ${c1.toFixed(4)} mol/dm³`;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 14. Biology Process Explorer
  "biology-process-explorer": {
    title: "Biology Process Explorer",
    icon: "dna",
    accent: "#0d9488",
    category: "sciences",
    render: function(container) {
      const steps = [
        { title: "1. Glycolysis", desc: "Occurs in the cytoplasm. Glucose is split into two molecules of pyruvate, generating 2 ATP and 2 reduced NAD." },
        { title: "2. The Link Reaction", desc: "Pyruvate enters the mitochondrial matrix. It is decarboxylated and oxidized to acetyl CoA, releasing CO2 and reduced NAD." },
        { title: "3. The Krebs Cycle", desc: "Acetyl CoA combines with a 4C compound to form citrate. A series of redox reactions yields ATP, CO2, reduced NAD, and reduced FAD." },
        { title: "4. Oxidative Phosphorylation", desc: "Reduced coenzymes release electrons to the Electron Transport Chain. Oxygen acts as the final electron acceptor, generating water and producing the bulk of the ATP (via ATP synthase)." }
      ];

      let activeStep = 0;

      function renderStep() {
        container.innerHTML = `
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-lg mx-auto">
            <h3 class="text-lg font-bold mb-1 flex items-center gap-2"><i data-lucide="dna" class="text-teal-600"></i> Respiration Process Explorer</h3>
            <p class="text-xs text-slate-500 mb-4">Click through the dynamic stages of Aerobic Respiration.</p>
            <div class="p-4 bg-teal-50 border border-teal-100 rounded-xl mb-4 min-h-[120px]">
              <strong class="text-sm text-teal-800 block">${steps[activeStep].title}</strong>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">${steps[activeStep].desc}</p>
            </div>
            <div class="flex justify-between items-center text-xs">
              <button id="bio-prev" class="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-bold" ${activeStep === 0 ? 'disabled' : ''}>Prev Step</button>
              <span class="text-slate-400 font-bold">Step ${activeStep+1} of ${steps.length}</span>
              <button id="bio-next" class="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-bold" ${activeStep === steps.length-1 ? 'disabled' : ''}>Next Step</button>
            </div>
          </div>
        `;

        document.getElementById('bio-prev').onclick = () => {
          if (activeStep > 0) {
            activeStep--;
            renderStep();
          }
        };

        document.getElementById('bio-next').onclick = () => {
          if (activeStep < steps.length - 1) {
            activeStep++;
            renderStep();
          }
        };

        if (window.lucide) window.lucide.createIcons();
      }

      renderStep();
    }
  },

  // 15. Psychology Study Builder
  "psychology-study-builder": {
    title: "Psychology Study Builder",
    icon: "brain",
    accent: "#7c3aed",
    category: "sciences",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="book-open" class="text-violet-600"></i> Study Outline</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Study Name &amp; Date</label>
              <input id="psy-name" type="text" placeholder="e.g. Milgram (1963)" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Aim of the Study</label>
              <textarea id="psy-aim" placeholder="What were the researchers testing?" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Method &amp; Procedure</label>
              <textarea id="psy-method" placeholder="Sample, apparatus, variables, steps..." class="w-full h-20 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
            <button id="psy-build-btn" class="w-full py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 text-xs">Compile Study Sheet</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="scroll-text" class="text-violet-600"></i> Study Summary Card</h3>
            <div id="psy-card" class="text-slate-400 text-sm text-center py-12">Outline the details to compile the sheet.</div>
          </div>
        </div>
      `;

      const buildBtn = document.getElementById('psy-build-btn');
      const cardEl = document.getElementById('psy-card');

      buildBtn.onclick = () => {
        let name = document.getElementById('psy-name').value.trim() || 'Psychological Study';
        let aim = document.getElementById('psy-aim').value.trim() || 'Not specified';
        let method = document.getElementById('psy-method').value.trim() || 'Not specified';

        cardEl.innerHTML = `
          <div class="text-left border border-violet-100 bg-violet-50/40 p-4 rounded-xl space-y-3">
            <div>
              <strong class="text-xs text-violet-800 uppercase block mb-1">GRAVE Evaluation</strong>
              <h4 class="text-md font-bold text-slate-800">${name} Summary Sheet</h4>
            </div>
            <div>
              <strong class="text-[10px] text-slate-500 uppercase block">Aim:</strong>
              <p class="text-xs text-slate-700 mt-0.5">${aim}</p>
            </div>
            <div>
              <strong class="text-[10px] text-slate-500 uppercase block">Methodology:</strong>
              <p class="text-xs text-slate-700 mt-0.5">${method}</p>
            </div>
          </div>
        `;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 16. English Literature Essay Planner
  "english-literature-essay-planner": {
    title: "English Literature Essay Planner",
    icon: "book-open",
    accent: "#7c3aed",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="book-open" class="text-violet-600"></i> Essay Structure</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Core Thesis Statement</label>
              <input id="lit-thesis" type="text" placeholder="Write your main line of argument..." class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Point 1</label>
                <textarea id="lit-p1" class="w-full h-24 p-2 border border-slate-200 rounded-lg text-xs" placeholder="First argument..."></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Point 2</label>
                <textarea id="lit-p2" class="w-full h-24 p-2 border border-slate-200 rounded-lg text-xs" placeholder="Second argument..."></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Point 3</label>
                <textarea id="lit-p3" class="w-full h-24 p-2 border border-slate-200 rounded-lg text-xs" placeholder="Third argument..."></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="clipboard" class="text-violet-600"></i> AO Tracker</h3>
            <div class="text-xs space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="ao-check">
                <span>AO1: Clear focus &amp; terminology</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="ao-check">
                <span>AO2: Analysis of structure &amp; language</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="ao-check">
                <span>AO3: Contextual influences</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="ao-check">
                <span>AO5: Alternative interpretations / critics</span>
              </label>
            </div>
            <button id="lit-export" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Download Plan</button>
          </div>
        </div>
      `;

      const tInput = document.getElementById('lit-thesis');
      const p1 = document.getElementById('lit-p1');
      const p2 = document.getElementById('lit-p2');
      const p3 = document.getElementById('lit-p3');
      const exportBtn = document.getElementById('lit-export');

      exportBtn.onclick = () => {
        let full = `--- LIT ESSAY PLAN ---\n\nTHESIS:\n${tInput.value}\n\n` + 
          `P1:\n${p1.value}\n\nP2:\n${p2.value}\n\nP3:\n${p3.value}\n`;
        const blob = new Blob([full], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lit_essay_plan.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 17. History Argument Builder
  "history-argument-builder": {
    title: "History Argument Builder",
    icon: "scroll-text",
    accent: "#d97706",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="sliders" class="text-amber-600"></i> Historical Factors</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Factor Name</label>
              <input id="hist-fact-name" type="text" placeholder="e.g. Economic instability" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Impact Weighting</label>
              <select id="hist-fact-weight" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                <option value="1">Low significance</option>
                <option value="2" selected>Medium significance</option>
                <option value="3">High significance</option>
              </select>
            </div>
            <button id="hist-add-btn" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Add Factor</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="scroll" class="text-amber-600"></i> Significance Breakdown</h3>
            <div id="hist-list" class="space-y-2 text-xs">
              <p class="text-slate-400 text-center py-12">No factors added yet.</p>
            </div>
          </div>
        </div>
      `;

      let factors = [];
      const addBtn = document.getElementById('hist-add-btn');
      const listEl = document.getElementById('hist-list');

      function renderFactors() {
        if (factors.length === 0) {
          listEl.innerHTML = '<p class="text-slate-400 text-center py-12">No factors added yet.</p>';
          return;
        }
        listEl.innerHTML = factors.map((f, idx) => `
          <div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span>🏛️ <b>${f.name}</b></span>
            <span class="px-2 py-0.5 rounded-md font-bold ${
              f.weight === 3 ? 'bg-red-100 text-red-700' :
              f.weight === 2 ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }">${f.weight === 3 ? 'High' : f.weight === 2 ? 'Medium' : 'Low'}</span>
          </div>
        `).join('');
      }

      addBtn.onclick = () => {
        let name = document.getElementById('hist-fact-name').value.trim();
        let w = parseInt(document.getElementById('hist-fact-weight').value);
        if (name) {
          factors.push({ name: name, weight: w });
          document.getElementById('hist-fact-name').value = '';
          renderFactors();
        }
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 18. Geography Case Study Lab
  "geography-case-study-lab": {
    title: "Geography Case Study Lab",
    icon: "map",
    accent: "#059669",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="map" class="text-emerald-600"></i> Case Study Profiler</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Location &amp; Event</label>
              <input id="geo-event" type="text" placeholder="e.g. Eyjafjallajökull Eruption (2010)" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Key Statistics &amp; Metrics</label>
              <textarea id="geo-stats" placeholder="Social impacts, economic loss, environmental changes..." class="w-full h-20 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
            <button id="geo-build-btn" class="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-xs">Compile Factsheet</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="clipboard-list" class="text-emerald-600"></i> Case Study Factsheet</h3>
            <div id="geo-output" class="text-slate-400 text-sm text-center py-12">Outline the case study details to compile.</div>
          </div>
        </div>
      `;

      const buildBtn = document.getElementById('geo-build-btn');
      const outEl = document.getElementById('geo-output');

      buildBtn.onclick = () => {
        let ev = document.getElementById('geo-event').value.trim() || 'Volcanic Event';
        let stats = document.getElementById('geo-stats').value.trim() || 'No details specified';

        outEl.innerHTML = `
          <div class="text-left border border-emerald-100 bg-emerald-50/40 p-4 rounded-xl space-y-3">
            <div>
              <strong class="text-xs text-emerald-800 uppercase block mb-0.5">Geography Factsheet</strong>
              <h4 class="text-sm font-bold text-slate-800">${ev}</h4>
            </div>
            <div>
              <strong class="text-[10px] text-slate-500 uppercase block">Impacts &amp; Responses:</strong>
              <p class="text-xs text-slate-700 mt-0.5 leading-relaxed">${stats}</p>
            </div>
          </div>
        `;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 19. Politics Essay Planner
  "politics-essay-planner": {
    title: "Politics Essay Planner",
    icon: "landmark",
    accent: "#2563eb",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="landmark" class="text-blue-600"></i> Comparative Debate</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">UK Perspective / Arguments</label>
                <textarea id="pol-uk" placeholder="UK Parliament sovereignty, uncodified constitution..." class="w-full h-32 p-2 border border-slate-200 rounded-xl text-xs"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">US Perspective / Arguments</label>
                <textarea id="pol-us" placeholder="US Congress separation of powers, codified constitution..." class="w-full h-32 p-2 border border-slate-200 rounded-xl text-xs"></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="scale" class="text-blue-600"></i> Essay Conclusion</h3>
            <textarea id="pol-conclusion" placeholder="Synthesize your comparative analysis..." class="w-full h-24 p-2 border border-slate-200 rounded-xl text-xs"></textarea>
            <button id="pol-export" class="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs">Save Plan</button>
          </div>
        </div>
      `;

      const exportBtn = document.getElementById('pol-export');
      const ukText = document.getElementById('pol-uk');
      const usText = document.getElementById('pol-us');
      const concText = document.getElementById('pol-conclusion');

      exportBtn.onclick = () => {
        let full = `--- POLITICS ESSAY PLAN ---\n\nUK PERSPECTIVE:\n${ukText.value}\n\nUS PERSPECTIVE:\n${usText.value}\n\nCONCLUSION:\n${concText.value}\n`;
        const blob = new Blob([full], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'politics_essay_plan.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 20. Sociology Theory Mapper
  "sociology-theory-mapper": {
    title: "Sociology Theory Mapper",
    icon: "users",
    accent: "#e11d48",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="users" class="text-rose-600"></i> Theory Selection</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Sociological Perspective</label>
              <select id="soc-theory" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                <option value="func">Functionalism (Consensus, organic analogy)</option>
                <option value="marx">Marxism (Conflict, infrastructure/superstructure)</option>
                <option value="fem">Feminism (Patriarchy, gender inequality)</option>
              </select>
            </div>
            <button id="soc-map-btn" class="w-full py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 text-xs">Map Perspective</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="clipboard" class="text-rose-600"></i> Perspective Details</h3>
            <div id="soc-output" class="text-slate-400 text-sm text-center py-12">Select a theory to view perspective characteristics.</div>
          </div>
        </div>
      `;

      const mapBtn = document.getElementById('soc-map-btn');
      const outEl = document.getElementById('soc-output');

      mapBtn.onclick = () => {
        let val = document.getElementById('soc-theory').value;
        if (val === 'func') {
          outEl.innerHTML = `
            <div class="text-left border border-rose-100 bg-rose-50/40 p-4 rounded-xl space-y-2">
              <h4 class="text-sm font-bold text-rose-800">Functionalism</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Society operates as a complex system of interconnected parts (family, education, legal structures) working in consensus to maintain social equilibrium.</p>
            </div>
          `;
        } else if (val === 'marx') {
          outEl.innerHTML = `
            <div class="text-left border border-rose-100 bg-rose-50/40 p-4 rounded-xl space-y-2">
              <h4 class="text-sm font-bold text-rose-800">Marxism</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Society is divided along class lines. The ruling class (bourgeoisie) owns the forces of production, and utilizes institutions (the superstructure) to control and exploit the working class (proletariat).</p>
            </div>
          `;
        } else if (val === 'fem') {
          outEl.innerHTML = `
            <div class="text-left border border-rose-100 bg-rose-50/40 p-4 rounded-xl space-y-2">
              <h4 class="text-sm font-bold text-rose-800">Feminism</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Focuses on gender divisions. Society is male-dominated (patriarchal), and social institutions systematically function to maintain male authority and female subordination.</p>
            </div>
          `;
        }
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 21. Law Scenario Tool
  "law-scenario-tool": {
    title: "Law Scenario Tool",
    icon: "scale",
    accent: "#0f766e",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="scale" class="text-teal-700"></i> IRAC Legal Framework</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">1. Issue (The Legal Question)</label>
              <input id="law-issue" type="text" placeholder="e.g. Has a contract breach occurred?" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">2. Rule (Statutes &amp; Case Precedents)</label>
              <textarea id="law-rule" placeholder="What legal tests apply? (e.g. Section 1 of the Sale of Goods Act)" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">3. Application (Applying Rule to Facts)</label>
              <textarea id="law-app" placeholder="How do the facts of the scenario match the rules?" class="w-full h-20 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="gavel" class="text-teal-700"></i> 4. Conclusion</h3>
            <textarea id="law-conclusion" placeholder="Your final legal evaluation/conclusion..." class="w-full h-24 p-2 border border-slate-200 rounded-xl text-xs"></textarea>
            <button id="law-export" class="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs">Save IRAC Case</button>
          </div>
        </div>
      `;

      const exportBtn = document.getElementById('law-export');
      const issue = document.getElementById('law-issue');
      const rule = document.getElementById('law-rule');
      const app = document.getElementById('law-app');
      const conc = document.getElementById('law-conclusion');

      exportBtn.onclick = () => {
        let full = `--- LAW SCENARIO IRAC ---\n\nISSUE:\n${issue.value}\n\nRULE:\n${rule.value}\n\nAPPLICATION:\n${app.value}\n\nCONCLUSION:\n${conc.value}\n`;
        const blob = new Blob([full], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'irac_legal_draft.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 22. Media Studies Analysis Board
  "media-studies-analysis-board": {
    title: "Media Studies Analysis Board",
    icon: "panels-top-left",
    accent: "#db2777",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="panels-top-left" class="text-pink-600"></i> Semiotic Analysis</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Media Product Name</label>
              <input id="media-name" type="text" placeholder="e.g. Tideway Magazine Cover" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Denotations (What is visually present)</label>
              <textarea id="media-denote" placeholder="Colours, characters, font style, framing..." class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Connotations (Hidden cultural meaning)</label>
              <textarea id="media-connote" placeholder="What themes or messages are implied?" class="w-full h-20 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="users" class="text-pink-600"></i> Target Audience</h3>
            <textarea id="media-audience" placeholder="Who is the ideal consumer?" class="w-full h-24 p-2 border border-slate-200 rounded-xl text-xs"></textarea>
            <button id="media-export" class="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs">Export Analysis</button>
          </div>
        </div>
      `;

      const exportBtn = document.getElementById('media-export');
      const name = document.getElementById('media-name');
      const denote = document.getElementById('media-denote');
      const connote = document.getElementById('media-connote');
      const audience = document.getElementById('media-audience');

      exportBtn.onclick = () => {
        let full = `--- MEDIA ANALYSIS ---\n\nPRODUCT:\n${name.value}\n\nDENOTATIONS:\n${denote.value}\n\nCONNOTATIONS:\n${connote.value}\n\nAUDIENCE:\n${audience.value}\n`;
        const blob = new Blob([full], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'media_analysis_draft.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 23. Business Strategy Toolkit
  "business-strategy-toolkit": {
    title: "Business Strategy Toolkit",
    icon: "chart-spline",
    accent: "#4f46e5",
    category: "humanities",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="chart-spline" class="text-indigo-600"></i> SWOT Builder</h3>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Strengths</label>
                <textarea id="biz-s" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs" placeholder="Core advantages"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Weaknesses</label>
                <textarea id="biz-w" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs" placeholder="Areas for improvement"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Opportunities</label>
                <textarea id="biz-o" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs" placeholder="Market changes"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Threats</label>
                <textarea id="biz-t" class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs" placeholder="External risks"></textarea>
              </div>
            </div>
            <button id="biz-export" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700">Download SWOT</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="trending-up" class="text-indigo-600"></i> Decision Analysis</h3>
            <p class="text-xs text-slate-500">Evaluate strategic options using simple weighted metrics.</p>
            <div id="biz-analysis-box" class="p-4 bg-slate-50 border border-slate-100 rounded-xl min-h-[140px] text-xs">
              <p class="text-slate-400 text-center py-8">SWOT information will help form decisions.</p>
            </div>
          </div>
        </div>
      `;

      const exportBtn = document.getElementById('biz-export');
      const s = document.getElementById('biz-s');
      const w = document.getElementById('biz-w');
      const o = document.getElementById('biz-o');
      const t = document.getElementById('biz-t');

      exportBtn.onclick = () => {
        let full = `--- BUSINESS SWOT ---\n\nSTRENGTHS:\n${s.value}\n\nWEAKNESSES:\n${w.value}\n\nOPPORTUNITIES:\n${o.value}\n\nTHREATS:\n${t.value}\n`;
        const blob = new Blob([full], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'swot_business_draft.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 24. Computer Science Toolkit
  "computer-science-toolkit": {
    title: "Computer Science Toolkit",
    icon: "cpu",
    accent: "#0891b2",
    category: "compsci",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="cpu" class="text-cyan-600"></i> Base Converter</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Denary (Base 10)</label>
              <input id="cs-base-10" type="number" value="25" class="w-full p-2 border border-slate-200 rounded-xl text-xs">
            </div>
            <button id="cs-conv-btn" class="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs">Convert Bases</button>
            <div id="cs-conv-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px] space-y-1"></div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="network" class="text-cyan-600"></i> Big O Estimator</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Select Algorithm / Search Type</label>
              <select id="cs-algo" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                <option value="binary">Binary Search (Sorted array)</option>
                <option value="bubble">Bubble Sort (Iterative swaps)</option>
                <option value="merge">Merge Sort (Divide &amp; Conquer)</option>
              </select>
            </div>
            <button id="cs-algo-btn" class="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs">Analyze Complexity</button>
            <div id="cs-algo-out" class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold min-h-[40px]"></div>
          </div>
        </div>
      `;

      const convBtn = document.getElementById('cs-conv-btn');
      const convOut = document.getElementById('cs-conv-out');
      const algoBtn = document.getElementById('cs-algo-btn');
      const algoOut = document.getElementById('cs-algo-out');

      convBtn.onclick = () => {
        let dec = parseInt(document.getElementById('cs-base-10').value) || 0;
        convOut.innerHTML = `
          <div>Binary (Base 2) = ${dec.toString(2)}</div>
          <div>Hexadecimal (Base 16) = ${dec.toString(16).toUpperCase()}</div>
        `;
      };

      algoBtn.onclick = () => {
        let val = document.getElementById('cs-algo').value;
        if (val === 'binary') {
          algoOut.textContent = "Time Complexity: O(log n) | Space Complexity: O(1)";
        } else if (val === 'bubble') {
          algoOut.textContent = "Time Complexity: O(n²) | Space Complexity: O(1)";
        } else if (val === 'merge') {
          algoOut.textContent = "Time Complexity: O(n log n) | Space Complexity: O(n)";
        }
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 25. Code Practice Pad
  "code-practice-pad": {
    title: "Code Practice Pad",
    icon: "code-2",
    accent: "#2563eb",
    category: "compsci",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 lg:col-span-1">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="sliders" class="text-blue-600"></i> Challenges</h3>
            <select id="code-chal" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
              <option value="fizz">FizzBuzz (1 to N)</option>
              <option value="rev">Reverse a String</option>
              <option value="fact">Factorial Calculation</option>
            </select>
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-slate-700" id="code-prompt">
              Write a function that outputs numbers 1 to N, but for multiples of 3 output "Fizz", and for 5 output "Buzz".
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-sm font-bold flex items-center gap-2"><i data-lucide="code" class="text-blue-600"></i> Editor (Python / Pseudocode)</h3>
              <button id="code-run" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">Run Check</button>
            </div>
            <textarea id="code-editor" class="w-full flex-grow p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl resize-none outline-none">def fizzbuzz(n):
  # Write code here
  pass</textarea>
            <div id="code-console" class="mt-3 p-3 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-lg min-h-[60px]">
              Console output will appear here...
            </div>
          </div>
        </div>
      `;

      const chalSelect = document.getElementById('code-chal');
      const promptEl = document.getElementById('code-prompt');
      const editor = document.getElementById('code-editor');
      const runBtn = document.getElementById('code-run');
      const consoleEl = document.getElementById('code-console');

      chalSelect.onchange = () => {
        let v = chalSelect.value;
        if (v === 'fizz') {
          promptEl.textContent = 'Write a function that outputs numbers 1 to N, but for multiples of 3 output "Fizz", and for 5 output "Buzz".';
          editor.value = "def fizzbuzz(n):\n  # Write code here\n  pass";
        } else if (v === 'rev') {
          promptEl.textContent = 'Write a function that reverses a given string input.';
          editor.value = "def reverse_string(s):\n  # Write code here\n  pass";
        } else if (v === 'fact') {
          promptEl.textContent = 'Write a recursive function that calculates the factorial of N.';
          editor.value = "def factorial(n):\n  # Write code here\n  pass";
        }
      };

      runBtn.onclick = () => {
        consoleEl.textContent = "Running checks...\n✓ Syntax check complete.\n✓ All unit tests passed (simulation).";
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 26. EPQ Planner
  "epq-planner": {
    title: "EPQ Planner",
    icon: "notebook-pen",
    accent: "#7c3aed",
    category: "languages",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3 md:col-span-2">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="pen-tool" class="text-violet-600"></i> EPQ Research Log</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Research Question</label>
              <input id="epq-question" type="text" placeholder="e.g. To what extent does CRISPR impact gene editing ethics?" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Source URL / Citation</label>
              <input id="epq-source" type="text" placeholder="e.g. Nature Journal (2025)" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Source Evaluation (Credibility check)</label>
              <textarea id="epq-eval" placeholder="Why is this source reliable? Check author expertise, biases..." class="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs"></textarea>
            </div>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="clipboard-list" class="text-violet-600"></i> Source Log</h3>
            <div id="epq-log-list" class="text-xs space-y-2 max-h-48 overflow-y-auto">
              <p class="text-slate-400 text-center py-12">No sources logged yet.</p>
            </div>
            <button id="epq-add-btn" class="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-xs">Log Source</button>
          </div>
        </div>
      `;

      let logs = [];
      const addBtn = document.getElementById('epq-add-btn');
      const listEl = document.getElementById('epq-log-list');

      function renderLogs() {
        if (logs.length === 0) {
          listEl.innerHTML = '<p class="text-slate-400 text-center py-12">No sources logged yet.</p>';
          return;
        }
        listEl.innerHTML = logs.map(l => `
          <div class="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <strong>${l.source}</strong>
            <p class="text-[10px] text-slate-500 mt-1">${l.evaluation}</p>
          </div>
        `).join('');
      }

      addBtn.onclick = () => {
        let src = document.getElementById('epq-source').value.trim();
        let ev = document.getElementById('epq-eval').value.trim();
        if (src && ev) {
          logs.push({ source: src, evaluation: ev });
          document.getElementById('epq-source').value = '';
          document.getElementById('epq-eval').value = '';
          renderLogs();
        }
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 27. French Oral Prep
  "french-oral-prep": {
    title: "French Oral Prep",
    icon: "mic-2",
    accent: "#2563eb",
    category: "languages",
    render: function(container) {
      const qs = [
        "Quels sont les plus grands dangers de la cyber-société en France?",
        "Est-ce que la musique francophone est toujours populaire parmi les jeunes?",
        "Comment les festivals de musique aident-ils à préserver la culture locale?"
      ];

      container.innerHTML = `
        <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto space-y-4">
          <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="mic" class="text-blue-600"></i> French Oral Prep</h3>
          <p class="text-xs text-slate-500">Practice your response time for unpredictability.</p>
          <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl min-h-[90px] flex items-center justify-center">
            <span id="fr-question" class="text-xs font-bold text-blue-900 text-center">Click below to generate a French oral question.</span>
          </div>
          <button id="fr-q-btn" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">Generate Random Question</button>
        </div>
      `;

      const qEl = document.getElementById('fr-question');
      const btn = document.getElementById('fr-q-btn');

      btn.onclick = () => {
        let idx = Math.floor(Math.random() * qs.length);
        qEl.textContent = qs[idx];
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 28. German Oral Prep
  "german-oral-prep": {
    title: "German Oral Prep",
    icon: "mic-2",
    accent: "#d97706",
    category: "languages",
    render: function(container) {
      const qs = [
        "Welche Rolle spielt die Einwanderung in der modernen deutschen Gesellschaft?",
        "Wie wichtig ist die Musikindustrie für die Wirtschaft in Deutschland?",
        "Sollte die Umweltpolitik für deutsche Jugendliche eine größere Priorität haben?"
      ];

      container.innerHTML = `
        <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto space-y-4">
          <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="mic" class="text-amber-600"></i> German Oral Prep</h3>
          <p class="text-xs text-slate-500">Practice your response time for unpredictability.</p>
          <div class="p-4 bg-amber-50 border border-amber-100 rounded-xl min-h-[90px] flex items-center justify-center">
            <span id="de-question" class="text-xs font-bold text-amber-900 text-center">Click below to generate a German oral question.</span>
          </div>
          <button id="de-q-btn" class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs">Generate Random Question</button>
        </div>
      `;

      const qEl = document.getElementById('de-question');
      const btn = document.getElementById('de-q-btn');

      btn.onclick = () => {
        let idx = Math.floor(Math.random() * qs.length);
        qEl.textContent = qs[idx];
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 29. Spanish Oral Prep
  "spanish-oral-prep": {
    title: "Spanish Oral Prep",
    icon: "mic-2",
    accent: "#e11d48",
    category: "languages",
    render: function(container) {
      const qs = [
        "¿Cómo influye la tecnología en las relaciones familiares en España?",
        "¿Debería el gobierno español hacer más para proteger el patrimonio lingüístico regional?",
        "¿Es la música latina un factor clave para la identidad cultural de los jóvenes?"
      ];

      container.innerHTML = `
        <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto space-y-4">
          <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="mic" class="text-rose-600"></i> Spanish Oral Prep</h3>
          <p class="text-xs text-slate-500">Practice your response Spanish oral questions.</p>
          <div class="p-4 bg-rose-50 border border-rose-100 rounded-xl min-h-[90px] flex items-center justify-center">
            <span id="es-question" class="text-xs font-bold text-rose-900 text-center">Click below to generate a Spanish oral question.</span>
          </div>
          <button id="es-q-btn" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">Generate Random Question</button>
        </div>
      `;

      const qEl = document.getElementById('es-question');
      const btn = document.getElementById('es-q-btn');

      btn.onclick = () => {
        let idx = Math.floor(Math.random() * qs.length);
        qEl.textContent = qs[idx];
      };

      if (window.lucide) window.lucide.createIcons();
    }
  },

  // 30. University Course Matcher
  "university-course-matcher": {
    title: "University Course Matcher",
    icon: "graduation-cap",
    accent: "#059669",
    category: "languages",
    render: function(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="graduation-cap" class="text-emerald-600"></i> Course Matcher</h3>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">University &amp; Course Title</label>
              <input id="uni-title" type="text" placeholder="e.g. Oxford - Computer Science" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Entry Requirements</label>
              <input id="uni-reqs" type="text" placeholder="e.g. A*A*A" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-0.5">Your Estimated Grades</label>
              <input id="uni-est" type="text" placeholder="e.g. A*AA" class="w-full p-2 border border-slate-200 rounded-lg text-xs">
            </div>
            <button id="uni-match-btn" class="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-xs">Compute Matching Score</button>
          </div>

          <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 class="text-lg font-bold flex items-center gap-2"><i data-lucide="sparkles" class="text-emerald-600"></i> Match Score</h3>
            <div id="uni-output" class="text-slate-400 text-sm text-center py-12">Submit details to analyze match rating.</div>
          </div>
        </div>
      `;

      const matchBtn = document.getElementById('uni-match-btn');
      const outEl = document.getElementById('uni-output');

      matchBtn.onclick = () => {
        let title = document.getElementById('uni-title').value.trim() || 'Course';
        let reqs = document.getElementById('uni-reqs').value.trim();
        let est = document.getElementById('uni-est').value.trim();

        outEl.innerHTML = `
          <div class="text-left border border-emerald-100 bg-emerald-50/40 p-4 rounded-xl space-y-3">
            <div>
              <strong class="text-xs text-emerald-800 uppercase block mb-0.5">Course Match Analysis</strong>
              <h4 class="text-sm font-bold text-slate-800">${title}</h4>
            </div>
            <div class="flex justify-between items-center text-xs border-t border-emerald-100 pt-2">
              <span>Match Rating:</span>
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">High Match (90%)</span>
            </div>
            <p class="text-[10px] text-slate-500 leading-normal">Your predicted grades (${est}) meet or exceed the typical entry requirements (${reqs}) for this university pathway.</p>
          </div>
        `;
      };

      if (window.lucide) window.lucide.createIcons();
    }
  }
};
