/* ================================================================
   HEARTALIGN — Frontend Application
   Connects to backend API at /api/*
   ================================================================ */

'use strict';

const API = ''; // same origin (backend serves frontend too); adjust if separate

/* ================================================================
   STATE
   ================================================================ */
const state = {
  partnerRole: null,       // 'p1' | 'p2'
  sessionId:   null,
  partnerId:   null,
  partnerName: null,
  inviteCode:  null,
  coupleId:    null,
  p1Name:      null,
  p2Name:      null,

  questions:   [],
  currentQ:    0,
  answers:     {},

  pollInterval: null,
};

/* ================================================================
   LOADER — Heart Fill Animation
   ================================================================ */
window.addEventListener('load', () => {
  spawnParticles();
  setTimeout(() => {
    const loader = document.getElementById('loader');
    const app    = document.getElementById('app');
    loader.classList.add('fade-out');
    app.classList.remove('hidden');
    setTimeout(() => loader.remove(), 700);
  }, 3000); // loader visible for 3 seconds
});

/* ================================================================
   PARTICLES
   ================================================================ */
function spawnParticles() {
  const container = document.getElementById('particles');
  const colors = [
    'rgba(230,57,70,0.5)', 'rgba(255,107,154,0.4)',
    'rgba(69,123,157,0.4)', 'rgba(168,218,220,0.35)',
    'rgba(230,57,70,0.3)',
  ];

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    const x    = Math.random() * 100;
    const dur  = Math.random() * 20 + 15;
    const del  = Math.random() * 20;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${dur}s;
      animation-delay:${del}s;
    `;
    container.appendChild(p);
  }
}

/* ================================================================
   SCREEN ROUTER
   ================================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) target.classList.add('active');
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 400);
  }, 2800);
}

/* ================================================================
   LANDING
   ================================================================ */
document.getElementById('btn-start-new').addEventListener('click', () => showScreen('create'));
document.getElementById('btn-join-session').addEventListener('click', () => showScreen('join'));
document.getElementById('logo-home-btn').addEventListener('click', () => showScreen('landing'));

/* ================================================================
   CREATE SESSION (Partner 1)
   ================================================================ */
document.getElementById('btn-back-from-create').addEventListener('click', () => showScreen('landing'));

document.getElementById('btn-create-session').addEventListener('click', async () => {
  const name = document.getElementById('input-p1-name').value.trim();
  if (!name) { showToast('Please enter your name 💖'); return; }

  const btn = document.getElementById('btn-create-session');
  btn.disabled = true;
  btn.innerHTML = '<span>Creating…</span>';

  try {
    const res  = await fetch(`${API}/api/sessions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ partner1_name: name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.sessionId   = data.session.session_id;
    state.partnerId   = data.session.partner1_id;
    state.partnerName = data.session.partner1_name;
    state.inviteCode  = data.session.invite_code;
    state.coupleId    = data.session.couple_id;
    state.partnerRole = 'p1';
    state.p1Name      = name;

    // Show invite screen
    document.getElementById('invite-code-text').textContent = data.session.invite_code;
    document.getElementById('invite-intro-text').textContent =
      `Hi ${name}! Share this code with your partner so they can join and answer the same questions independently.`;
    const shareUrl = `${window.location.origin}/join/${data.session.invite_code}`;
    document.getElementById('invite-link-text').value = shareUrl;

    showScreen('invite');
    pollForPartnerJoin();
  } catch (err) {
    showToast('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Continue &rarr;</span>';
  }
});

/* ================================================================
   COPY BUTTONS
   ================================================================ */
document.getElementById('btn-copy-code').addEventListener('click', () => {
  const code = document.getElementById('invite-code-text').textContent;
  navigator.clipboard.writeText(code).then(() => showToast('✅ Invite code copied!'));
});

document.getElementById('btn-copy-link').addEventListener('click', () => {
  const link = document.getElementById('invite-link-text').value;
  navigator.clipboard.writeText(link).then(() => showToast('✅ Link copied!'));
});

/* ================================================================
   WAIT FOR PARTNER (P1)
   ================================================================ */
let joinPollInterval;
async function pollForPartnerJoin() {
  const statusEl = document.getElementById('invite-waiting-status');
  if (statusEl) statusEl.style.display = 'flex';
  
  joinPollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API}/api/sessions/code/${state.inviteCode}`);
      const data = await res.json();
      if (data.success && data.session.is_full) {
        clearInterval(joinPollInterval);
        state.p2Name = data.session.partner2_name;
        showToast(`${state.p2Name} joined! Starting quiz...`);
        setTimeout(() => {
          loadQuestionsAndStartQuiz();
        }, 1500);
      }
    } catch (e) {
      console.error('Error polling for partner join', e);
    }
  }, 2000);
}

/* ================================================================
   JOIN SESSION (Partner 2) — Two-step: verify code, then name
   ================================================================ */
let joinStep = 'code'; // 'code' | 'name'

document.getElementById('btn-back-from-join').addEventListener('click', () => showScreen('landing'));

document.getElementById('input-invite-code').addEventListener('input', function () {
  this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
});

document.getElementById('btn-join-submit').addEventListener('click', async () => {
  if (joinStep === 'code') {
    await verifyInviteCode();
  } else {
    await joinWithName();
  }
});

async function verifyInviteCode() {
  const code  = document.getElementById('input-invite-code').value.trim().toUpperCase();
  const errEl = document.getElementById('join-error');
  errEl.classList.add('hidden');

  if (!code || code.length < 6) { showToast('Please enter a valid invite code'); return; }

  const btn = document.getElementById('btn-join-submit');
  btn.disabled = true;

  try {
    const res  = await fetch(`${API}/api/sessions/code/${code}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.inviteCode = code;
    state.p1Name     = data.session.partner1_name;

    // Show name field
    document.getElementById('join-partner-info').textContent =
      `✓ Found session with ${data.session.partner1_name}`;
    document.getElementById('join-name-group').style.display = 'block';
    document.getElementById('btn-join-label').textContent = 'Join Session →';
    joinStep = 'name';
  } catch (err) {
    errEl.textContent = err.message || 'Invalid invite code';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
}

async function joinWithName() {
  const name  = document.getElementById('input-p2-name').value.trim();
  const code  = document.getElementById('input-invite-code').value.trim().toUpperCase();
  const errEl = document.getElementById('join-error');
  errEl.classList.add('hidden');

  if (!name) { showToast('Please enter your name 💖'); return; }

  const btn = document.getElementById('btn-join-submit');
  btn.disabled = true;

  try {
    const res  = await fetch(`${API}/api/sessions/join`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ invite_code: code, partner2_name: name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.sessionId   = data.session.session_id;
    state.partnerId   = data.session.partner2_id;
    state.partnerName = data.session.partner2_name;
    state.coupleId    = data.session.couple_id;
    state.partnerRole = 'p2';
    state.p2Name      = name;
    state.p1Name      = data.session.partner1_name;

    await loadQuestionsAndStartQuiz();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
}

/* ================================================================
   LOAD QUESTIONS & START QUIZ
   ================================================================ */
async function loadQuestionsAndStartQuiz() {
  try {
    const res  = await fetch(`${API}/api/questions`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Could not load questions');

    state.questions  = data.questions;
    state.currentQ   = 0;
    state.answers    = {};

    showScreen('quiz');
    renderQuestion(0);
  } catch (err) {
    showToast('Error loading questions: ' + err.message);
  }
}

/* ================================================================
   QUIZ
   ================================================================ */
const CATEGORY_ICONS = {
  'Values & Life Goals':    '🎯',
  'Trust & Communication':  '💬',
  'Conflict Style':         '⚡',
  'Intimacy & Affection':   '💞',
  'Daily Life & Habits':    '🏠',
  'Fun/Trivia':             '🎉',
};

function renderQuestion(index) {
  const q     = state.questions[index];
  const total = state.questions.length;

  // Update header
  const roleLabel = state.partnerRole === 'p1'
    ? (state.p1Name || 'Partner 1')
    : (state.p2Name || 'Partner 2');

  document.getElementById('quiz-partner-label').textContent  = roleLabel;
  document.getElementById('quiz-progress-label').textContent = `Question ${index + 1} of ${total}`;
  document.getElementById('quiz-progress-fill').style.width  = `${((index + 1) / total) * 100}%`;

  // Category dots
  const cats = [...new Set(state.questions.map(q => q.category))];
  const bar  = document.getElementById('quiz-categories-bar');
  bar.innerHTML = '';
  cats.forEach(cat => {
    const qsInCat = state.questions.filter(q2 => q2.category === cat);
    const dot = document.createElement('div');
    dot.className = 'qcat-dot';
    if (qsInCat.some(q2 => q2 === q)) dot.classList.add('active');
    else if (qsInCat.some(q2 => state.answers[q2.id] !== undefined)) dot.classList.add('done');
    dot.title = cat;
    bar.appendChild(dot);
  });

  // Question body
  document.getElementById('q-category-tag').textContent = `${CATEGORY_ICONS[q.category] || '❓'} ${q.category}`;
  document.getElementById('q-prompt').textContent = q.prompt;
  document.getElementById('q-subtitle').textContent = q.subtitle || '';

  // Hide all answer types
  const optGrid    = document.getElementById('options-grid');
  const scaleCont  = document.getElementById('scale-container');
  const openCont   = document.getElementById('open-ended-container');
  optGrid.classList.add('hidden');
  scaleCont.classList.add('hidden');
  openCont.classList.add('hidden');

  // Pre-fill saved answer
  const saved = state.answers[q.id];

  // Render by type
  if (q.question_type === 'multiple_choice_match') {
    optGrid.classList.remove('hidden');
    optGrid.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      if (saved === opt.value) btn.classList.add('selected');
      btn.innerHTML = `
        <div class="option-btn-label">${opt.label}</div>
        ${opt.description ? `<div class="option-btn-desc">${opt.description}</div>` : ''}
      `;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.answers[q.id] = opt.value;
        enableNextBtn();
      });
      optGrid.appendChild(btn);
    });
  } else if (q.question_type === 'scale_1_to_5') {
    scaleCont.classList.remove('hidden');
    const low = q.options[0]?.label || '1';
    const hi  = q.options[4]?.label || '5';
    document.getElementById('scale-label-low').textContent = low;
    document.getElementById('scale-label-high').textContent = hi;

    const scaleButtons = document.getElementById('scale-buttons');
    scaleButtons.innerHTML = '';
    for (let v = 1; v <= 5; v++) {
      const btn = document.createElement('button');
      btn.className = 'scale-btn';
      if (saved === v) btn.classList.add('selected');
      btn.textContent = v;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.answers[q.id] = v;
        enableNextBtn();
      });
      scaleButtons.appendChild(btn);
    }
  } else if (q.question_type === 'open_ended_reflection') {
    openCont.classList.remove('hidden');
    const ta = document.getElementById('open-textarea');
    ta.value = saved || '';
    document.getElementById('char-count').textContent = `${ta.value.length}/500`;
    ta.oninput = () => {
      document.getElementById('char-count').textContent = `${ta.value.length}/500`;
      state.answers[q.id] = ta.value.trim();
      if (ta.value.trim().length > 0) enableNextBtn();
      else disableNextBtn();
    };
    if (saved) enableNextBtn(); else disableNextBtn();
    return; // early return; enableNextBtn handled above
  }

  // Enable/disable next button based on saved answer
  if (saved !== undefined) enableNextBtn();
  else disableNextBtn();
}

function enableNextBtn()  { document.getElementById('btn-next-question').disabled = false; }
function disableNextBtn() { document.getElementById('btn-next-question').disabled = true;  }

document.getElementById('btn-next-question').addEventListener('click', async () => {
  const q     = state.questions[state.currentQ];
  const total = state.questions.length;

  if (state.answers[q.id] === undefined && q.question_type !== 'open_ended_reflection') {
    showToast('Please select an answer 💖');
    return;
  }

  // Animate card out
  const card = document.getElementById('question-card');
  card.style.opacity = '0';
  card.style.transform = 'translateY(12px)';

  // Trigger floating hearts
  spawnFloatingHearts();

  await wait(350);

  state.currentQ++;

  if (state.currentQ >= total) {
    // All answered — submit!
    await submitAnswers();
    return;
  }

  renderQuestion(state.currentQ);
  card.style.transition = 'none';
  card.style.opacity = '0';
  card.style.transform = 'translateY(-12px)';
  await wait(20);
  card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  card.style.opacity = '1';
  card.style.transform = 'translateY(0)';
});

function spawnFloatingHearts() {
  const container = document.createElement('div');
  container.className = 'rising-hearts-container';
  document.body.appendChild(container);
  
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.style.left = `${Math.random() * 80 + 10}%`;
    heart.style.animationDuration = `${1 + Math.random() * 0.8}s`;
    heart.style.animationDelay = `${Math.random() * 0.3}s`;
    container.appendChild(heart);
  }
  
  setTimeout(() => container.remove(), 2500);
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ================================================================
   SUBMIT ANSWERS
   ================================================================ */
async function submitAnswers() {
  try {
    const res = await fetch(`${API}/api/sessions/${state.sessionId}/answers`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        partner_id: state.partnerId,
        answers:    state.answers,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (data.both_completed) {
      // Go straight to results
      await loadAndShowResults();
    } else {
      // Show waiting screen
      showWaitingScreen();
    }
  } catch (err) {
    showToast('Error submitting answers: ' + err.message);
    // Rewind one question to allow retry
    state.currentQ = Math.max(0, state.currentQ - 1);
    renderQuestion(state.currentQ);
    showScreen('quiz');
  }
}

/* ================================================================
   WAITING SCREEN
   ================================================================ */
function showWaitingScreen() {
  // Set partner names
  document.getElementById('p1-status-name').textContent = state.p1Name || 'Partner 1';
  document.getElementById('p2-status-name').textContent = state.p2Name || 'Partner 2';

  if (state.partnerRole === 'p1') {
    // P1 has submitted; waiting for p2
    document.getElementById('p1-status-badge').querySelector('.ps-dot').classList.replace('ps-pending','ps-done');
    document.getElementById('p1-status-badge').querySelector('.ps-tag').className = 'ps-tag done';
    document.getElementById('p1-status-badge').querySelector('.ps-tag').textContent = 'Submitted ✓';
    document.getElementById('p2-status-badge').querySelector('.ps-dot').className = 'ps-dot ps-pending';
    document.getElementById('p2-status-tag').textContent = 'Answering…';
    document.getElementById('waiting-title').textContent = 'Your answers are saved! 🎉';
    document.getElementById('waiting-sub').textContent =
      `Waiting for ${state.p2Name || 'your partner'} to complete their answers…`;
  } else {
    // P2 has submitted; p1 already done
    document.getElementById('waiting-title').textContent = 'Almost there! 🎉';
    document.getElementById('waiting-sub').textContent = 'Calculating your compatibility…';
  }

  showScreen('waiting');

  // Poll for results
  clearInterval(state.pollInterval);
  state.pollInterval = setInterval(pollForResults, 3500);
}

async function pollForResults() {
  try {
    const res  = await fetch(`${API}/api/sessions/${state.sessionId}/status`);
    const data = await res.json();
    if (!data.success) return;

    // Update p2 status
    if (data.partner2 && data.partner2.has_submitted) {
      document.getElementById('p2-status-badge').querySelector('.ps-dot').classList.replace('ps-pending','ps-done');
      document.getElementById('p2-status-badge').querySelector('.ps-tag').className = 'ps-tag done';
      document.getElementById('p2-status-tag').textContent = 'Submitted ✓';
    }

    if (data.both_completed) {
      clearInterval(state.pollInterval);
      await loadAndShowResults();
    }
  } catch (_) { /* silent */ }
}

/* ================================================================
   RESULTS
   ================================================================ */
async function loadAndShowResults() {
  clearInterval(state.pollInterval);

  try {
    const res  = await fetch(`${API}/api/sessions/${state.sessionId}/results`);
    const data = await res.json();
    if (!data.success) {
      showToast('Results not ready yet — retrying in 3s…');
      setTimeout(() => loadAndShowResults(), 3000);
      return;
    }

    renderResults(data.results);
    showScreen('results');
  } catch (err) {
    showToast('Error loading results: ' + err.message);
  }
}

function renderResults(r) {
  // Names
  document.getElementById('results-title').textContent = 'Compatibility Report';
  document.getElementById('results-names').textContent = `${r.partner1_name} & ${r.partner2_name}`;

  // Animate score ring
  const circumference = 2 * Math.PI * 88; // 553
  const offset = circumference - (r.overall_score / 100) * circumference;

  setTimeout(() => {
    document.getElementById('score-ring-fill').style.strokeDashoffset = offset;
  }, 400);

  // Count up score number
  animateCount('score-number', 0, Math.round(r.overall_score), 1600);

  // Score tier
  const tier = getScoreTier(r.overall_score);
  document.getElementById('score-tier').textContent = tier;

  // Category breakdown
  const catEl = document.getElementById('category-breakdown');
  catEl.innerHTML = '';
  Object.values(r.category_breakdown).forEach((cat, i) => {
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML = `
      <div class="cat-row-top">
        <div class="cat-name">${CATEGORY_ICONS[cat.category] || '•'} ${cat.category}</div>
        <div class="cat-score-val">${cat.score}%</div>
      </div>
      <div class="cat-bar-bg">
        <div class="cat-bar-fill" id="catbar-${i}"></div>
      </div>
      <div class="cat-insight">${cat.insight || ''}</div>
    `;
    catEl.appendChild(row);
    // Animate bar
    setTimeout(() => {
      const fill = document.getElementById(`catbar-${i}`);
      if (fill) fill.style.width = cat.score + '%';
    }, 500 + i * 120);
  });

  // Conflict flags
  const conflictSec  = document.getElementById('conflict-section');
  const conflictList = document.getElementById('conflict-flags-list');
  conflictList.innerHTML = '';

  if (r.conflict_flags && r.conflict_flags.length > 0) {
    conflictSec.classList.remove('hidden');
    r.conflict_flags.forEach(flag => {
      const card = document.createElement('div');
      card.className = 'conflict-flag-card';
      card.innerHTML = `
        <div class="cf-flag-name">⚡ ${flag.flag_name}</div>
        <div class="cf-answers">
          <span class="cf-answer-chip">${r.partner1_name}: ${flag.partner1_answer_label}</span>
          <span class="cf-answer-chip">${r.partner2_name}: ${flag.partner2_answer_label}</span>
        </div>
        <div class="cf-note">${flag.note || ''}</div>
      `;
      conflictList.appendChild(card);
    });
  } else {
    conflictSec.classList.add('hidden');
  }

  // Reflections
  const reflSec  = document.getElementById('reflections-section');
  const reflList = document.getElementById('reflections-list');
  reflList.innerHTML = '';

  if (r.reflections && r.reflections.length > 0) {
    reflSec.classList.remove('hidden');
    r.reflections.forEach(ref => {
      const card = document.createElement('div');
      card.className = 'reflection-card';
      card.innerHTML = `
        <div class="rf-question">${ref.question_prompt}</div>
        <div class="rf-answers">
          <div class="rf-answer-col">
            <div class="rf-name">${r.partner1_name}</div>
            <div class="rf-text">"${ref.partner1_answer}"</div>
          </div>
          <div class="rf-answer-col">
            <div class="rf-name">${r.partner2_name}</div>
            <div class="rf-text">"${ref.partner2_answer}"</div>
          </div>
        </div>
      `;
      reflList.appendChild(card);
    });
  } else {
    reflSec.classList.add('hidden');
  }

  // Disclaimer
  document.getElementById('disclaimer-box').textContent = r.disclaimer || '';
}

function getScoreTier(score) {
  if (score >= 90) return '💎 Soulmate Connection';
  if (score >= 80) return '💖 Deeply Compatible';
  if (score >= 70) return '✨ Strong Bond';
  if (score >= 60) return '🌱 Growing Together';
  if (score >= 50) return '🤝 Complementary Pair';
  return '🔍 Differences to Explore';
}

function animateCount(id, from, to, duration) {
  const el    = document.getElementById(id);
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ================================================================
   START AGAIN
   ================================================================ */
document.getElementById('btn-start-again').addEventListener('click', () => {
  // Reset state
  Object.assign(state, {
    partnerRole: null, sessionId: null, partnerId: null,
    partnerName: null, inviteCode: null, coupleId: null,
    p1Name: null, p2Name: null, questions: [], currentQ: 0, answers: {},
  });
  clearInterval(state.pollInterval);
  clearInterval(joinPollInterval);

  // Reset join form
  document.getElementById('input-invite-code').value = '';
  document.getElementById('input-p2-name').value = '';
  document.getElementById('join-name-group').style.display = 'none';
  document.getElementById('join-error').classList.add('hidden');
  document.getElementById('btn-join-label').textContent = 'Verify Code →';
  joinStep = 'code';

  // Reset create form
  document.getElementById('input-p1-name').value = '';

  showScreen('landing');
});

/* ================================================================
   AUTO-JOIN VIA URL  — handles /join/HEART-XXXX
   ================================================================ */
function checkUrlForJoinCode() {
  const path = window.location.pathname;
  const match = path.match(/\/join\/([A-Z0-9-]+)/i);
  if (match) {
    const code = match[1].toUpperCase();
    document.getElementById('input-invite-code').value = code;
    showScreen('join');
    // Auto-trigger verification
    verifyInviteCode();
  }
}

// Run after loader fades
setTimeout(checkUrlForJoinCode, 3200);
