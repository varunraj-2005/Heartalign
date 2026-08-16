let currentSession = null;
let currentPartnerId = null;
let questions = [];

document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();

  document.getElementById('btn-create-session').addEventListener('click', handleCreateSession);
  document.getElementById('btn-join-session').addEventListener('click', handleJoinSession);
  document.getElementById('btn-submit-quiz').addEventListener('click', handleSubmitAnswers);
  document.getElementById('btn-retake-quiz').addEventListener('click', handleRetakeQuiz);
});

async function loadQuestions() {
  try {
    const res = await fetch('/api/questions');
    const data = await res.json();
    if (data.success) {
      questions = data.questions;
    }
  } catch (err) {
    console.error('Failed to load questions:', err);
  }
}

async function handleCreateSession() {
  const p1Name = document.getElementById('p1-name').value.trim();
  if (!p1Name) {
    alert('Please enter Partner 1 name');
    return;
  }

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner1_name: p1Name })
    });
    const data = await res.json();

    if (data.success) {
      currentSession = data.session;
      currentPartnerId = data.session.partner1_id;

      document.getElementById('join-code').value = data.session.invite_code;
      showActiveSessionBanner();
      renderQuestions(`Partner 1 (${p1Name})`);
    } else {
      alert('Error creating session: ' + data.error);
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
}

async function handleJoinSession() {
  const inviteCode = document.getElementById('join-code').value.trim();
  const p2Name = document.getElementById('p2-name').value.trim();

  if (!inviteCode || !p2Name) {
    alert('Please enter invite code and Partner 2 name');
    return;
  }

  try {
    const res = await fetch('/api/sessions/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: inviteCode, partner2_name: p2Name })
    });
    const data = await res.json();

    if (data.success) {
      currentSession = data.session;
      currentPartnerId = data.session.partner2_id;

      showActiveSessionBanner();
      renderQuestions(`Partner 2 (${p2Name})`);
    } else {
      alert('Error joining session: ' + data.error);
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
}

function showActiveSessionBanner() {
  document.getElementById('setup-section').style.display = 'none';
  document.getElementById('session-banner').style.display = 'block';

  const p1 = currentSession.partner1_name || 'Partner 1';
  const p2 = currentSession.partner2_name || 'Partner 2 (Not Joined Yet)';

  document.getElementById('session-info-text').textContent = `Couple: ${p1} & ${p2} | Session ID: ${currentSession.session_id}`;
  document.getElementById('banner-code-display').textContent = currentSession.invite_code;
}

function renderQuestions(partnerLabel) {
  const container = document.getElementById('questions-container');
  document.getElementById('quiz-section').style.display = 'block';
  document.getElementById('active-partner-badge').textContent = `Answering as: ${partnerLabel}`;

  let html = '';
  questions.forEach((q, idx) => {
    html += `
      <div style="background: #0f172a; border-radius: 8px; padding: 18px; margin-bottom: 16px; border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-light); uppercase;">${q.category}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Q${idx + 1} of ${questions.length}</span>
        </div>
        <h4 style="font-size: 1rem; color: #fff; margin-bottom: 6px;">${q.prompt}</h4>
        ${q.subtitle ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${q.subtitle}</p>` : ''}
    `;

    if (q.question_type === 'open_ended_reflection') {
      html += `<textarea name="q_${q.id}" rows="2" placeholder="Write your thoughts here..."></textarea>`;
    } else if (q.question_type === 'scale_1_to_5' || q.question_type === 'multiple_choice_match') {
      html += `<select name="q_${q.id}">`;
      html += `<option value="">-- Select your answer --</option>`;
      (q.options || []).forEach(opt => {
        html += `<option value="${opt.value}">${opt.label} ${opt.description ? `- ${opt.description}` : ''}</option>`;
      });
      html += `</select>`;
    }

    html += `</div>`;
  });

  container.innerHTML = html;
}

async function handleSubmitAnswers() {
  if (!currentSession || !currentPartnerId) {
    alert('Session not active');
    return;
  }

  const answers = {};
  let missing = false;

  questions.forEach(q => {
    const field = document.querySelector(`[name="q_${q.id}"]`);
    if (field && field.value !== '') {
      answers[q.id] = q.question_type === 'scale_1_to_5' ? Number(field.value) : field.value;
    } else {
      missing = true;
    }
  });

  if (missing) {
    if (!confirm('You left some questions unanswered. Submit anyway?')) {
      return;
    }
  }

  try {
    const res = await fetch(`/api/sessions/${currentSession.session_id}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_id: currentPartnerId,
        answers
      })
    });

    const data = await res.json();

    if (data.success) {
      if (data.both_completed) {
        alert('🎉 Both partners have submitted! Computing results...');
        fetchResults();
      } else {
        alert('✅ Answers submitted for ' + (currentPartnerId === currentSession.partner1_id ? currentSession.partner1_name : currentSession.partner2_name) + '!\n\nSwitching UI to submit Partner 2 answers...');
        
        // Auto switch to Partner 2 for demonstration
        if (currentPartnerId === currentSession.partner1_id) {
          if (!currentSession.partner2_id) {
            // Join partner 2 automatically if not joined
            const joinRes = await fetch('/api/sessions/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invite_code: currentSession.invite_code,
                partner2_name: 'Jordan'
              })
            });
            const joinData = await joinRes.json();
            currentSession = joinData.session;
            currentPartnerId = joinData.session.partner2_id;
          } else {
            currentPartnerId = currentSession.partner2_id;
          }
          showActiveSessionBanner();
          renderQuestions(`Partner 2 (${currentSession.partner2_name || 'Jordan'})`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      alert('Error submitting answers: ' + data.error);
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
}

async function fetchResults() {
  try {
    const res = await fetch(`/api/sessions/${currentSession.session_id}/results`);
    const data = await res.json();

    if (data.success) {
      renderResults(data.results);
      fetchHistory(currentSession.couple_id);
    } else {
      alert('Results not ready: ' + data.error);
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
}

function renderResults(results) {
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'block';

  document.getElementById('overall-score-display').textContent = `${results.overall_score}%`;
  document.getElementById('couple-names-display').textContent = `${results.partner1_name} & ${results.partner2_name}`;
  document.getElementById('disclaimer-display').textContent = `⚠️ Disclaimer: ${results.disclaimer}`;

  // Category Breakdown
  const catContainer = document.getElementById('category-breakdown-container');
  let catHtml = '';
  Object.values(results.category_breakdown).forEach(cat => {
    catHtml += `
      <div class="category-bar-wrapper">
        <div class="category-header">
          <strong>${cat.category} <span style="color: var(--text-muted); font-size: 0.8rem;">(Weight: ${cat.weight * 100}%)</span></strong>
          <span style="color: var(--accent-light); font-weight: bold;">${cat.score}%</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill" style="width: ${cat.score}%;"></div>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px; font-style: italic;">
          "${cat.insight}"
        </p>
      </div>
    `;
  });
  catContainer.innerHTML = catHtml;

  // Conflict Flags
  const flagCard = document.getElementById('conflict-flags-card');
  const flagContainer = document.getElementById('conflict-flags-container');
  if (results.conflict_flags.length === 0) {
    flagContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No major conflict style divergences detected. High natural alignment!</p>';
  } else {
    let flagHtml = '';
    results.conflict_flags.forEach(flag => {
      flagHtml += `
        <div class="flag-box">
          <strong style="color: var(--warning); font-size: 0.95rem;">⚡ ${flag.flag_name}</strong>
          <p style="font-size: 0.85rem; color: #fff; margin: 4px 0;">
            ${results.partner1_name}: <em>"${flag.partner1_answer_label}"</em> vs ${results.partner2_name}: <em>"${flag.partner2_answer_label}"</em>
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
            ${flag.note}
          </p>
        </div>
      `;
    });
    flagContainer.innerHTML = flagHtml;
  }

  // Reflections
  const refContainer = document.getElementById('reflections-container');
  let refHtml = '';
  results.reflections.forEach(ref => {
    refHtml += `
      <div class="reflection-box">
        <strong style="font-size: 0.9rem; color: var(--accent-light); display: block; margin-bottom: 6px;">${ref.question_prompt}</strong>
        <div style="font-size: 0.85rem; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><span style="color: var(--primary); font-weight: bold;">${results.partner1_name}:</span> ${ref.partner1_answer || 'No response'}</div>
          <div><span style="color: var(--accent-light); font-weight: bold;">${results.partner2_name}:</span> ${ref.partner2_answer || 'No response'}</div>
        </div>
      </div>
    `;
  });
  refContainer.innerHTML = refHtml;
}

async function fetchHistory(coupleId) {
  try {
    const res = await fetch(`/api/couples/${coupleId}/history`);
    const data = await res.json();

    if (data.success) {
      const container = document.getElementById('history-container');
      const history = data.data.history;

      if (history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No prior quiz history found.</p>';
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
      history.forEach((h, i) => {
        const dateStr = new Date(h.date).toLocaleDateString() + ' ' + new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `
          <div style="background: #0f172a; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Quiz Retake #${i + 1}</strong> - <span style="color: var(--text-muted); font-size: 0.85rem;">${dateStr}</span>
            </div>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">
              ${h.overall_score}%
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    }
  } catch (err) {
    console.error('Error fetching history:', err);
  }
}

async function handleRetakeQuiz() {
  if (!currentSession) return;

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner1_name: currentSession.partner1_name,
        couple_id: currentSession.couple_id
      })
    });
    const data = await res.json();

    if (data.success) {
      currentSession = data.session;
      currentPartnerId = data.session.partner1_id;

      document.getElementById('results-section').style.display = 'none';
      showActiveSessionBanner();
      renderQuestions(`Partner 1 (${currentSession.partner1_name})`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    alert('Failed to start retake session: ' + err.message);
  }
}
