import { JOBS, ESTIMATES } from './jobs.js?v=4';
import { initScene, sayFromFuhs, setSceneActive, setProgressGlow } from './scene.js?v=4';

const KEY = 'lmg-jobcenter-v1';
const $ = (s, el = document) => el.querySelector(s);
const MIN_TEXT = 15;

// ---------- storage ----------
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('⚠️ Could not save – is private browsing on?'); }
}
let state = load();

// ---------- deterministic job assignment (one job per tier) ----------
function hash(str) {
  let h = 2166136261;
  for (const c of str.toLowerCase().replace(/\s+/g, ' ').trim()) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  return () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function assignJobs(name) {
  const r = rng(hash(name));
  const picks = ['A', 'B', 'C', 'D'].map(t => { const pool = JOBS.filter(j => j.tier === t); return pool[Math.floor(r() * pool.length)].id; });
  for (let i = picks.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [picks[i], picks[j]] = [picks[j], picks[i]]; }
  return picks;
}
const jobById = id => JOBS.find(j => j.id === id);

// ---------- completion ----------
function emptyAnswer() { return { tasks: '', pro: ['', ''], contra: ['', ''], risk: 50, estimate: 0, advice: '', sources: '' }; }
function answer(id) { return state.answers[id] ||= emptyAnswer(); }
function checks(a) {
  const filled = arr => arr.filter(s => s.trim().length >= 5).length;
  return {
    tasks: a.tasks.trim().length >= MIN_TEXT,
    pro: filled(a.pro) >= 2,
    contra: filled(a.contra) >= 2,
    estimate: a.estimate > 0,
    advice: a.advice.trim().length >= MIN_TEXT,
  };
}
const CHECK_LABELS = { tasks: 'job tasks', pro: '2 arguments FOR', contra: '2 arguments AGAINST', estimate: 'a time estimate', advice: 'your advice' };
function jobProgress(id) { const c = checks(answer(id)); return Object.values(c).filter(Boolean).length / 5; }
function totalProgress() { return state.jobs.reduce((s, id) => s + jobProgress(id), 0) / state.jobs.length; }
const isDone = id => jobProgress(id) === 1;

// ---------- views ----------
function show(view) {
  $('#login').hidden = view !== 'login';
  $('#dashboard').hidden = view !== 'dashboard';
}

function renderDashboard() {
  $('#researcherName').textContent = state.name;
  const p = totalProgress();
  const pct = Math.round(p * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressText').textContent = `${pct} % · ${state.jobs.filter(isDone).length} / 4 jobs`;
  $('#progressBar').setAttribute('aria-valuenow', pct);
  $('#progressJobs').innerHTML = state.jobs.map(id => `<span class="${isDone(id) ? 'done' : ''}">${isDone(id) ? '✓ ' : ''}${jobById(id).title}</span>`).join('');
  setProgressGlow(p);

  $('#cards').innerHTML = state.jobs.map((id, i) => {
    const j = jobById(id); const jp = jobProgress(id);
    return `<button class="card ${jp === 1 ? 'complete' : ''}" data-job="${id}" type="button">
      <span class="icon">${j.icon}</span>
      <span class="file">JOB FILE #${i + 1}</span>
      <h3>${j.title}</h3>
      <span class="mini"><div style="width:${jp * 100}%"></div></span>
      <span class="status"><span>${jp === 0 ? 'Not started' : jp === 1 ? '' : 'In progress'}</span><strong>${jp === 1 ? '✓ Research complete' : Math.round(jp * 100) + ' %'}</strong></span>
    </button>`;
  }).join('');
}

// ---------- job sheet ----------
let current = null;
const form = $('#jobForm');

function argRow(list, i, value) {
  const div = document.createElement('div');
  div.className = 'arg';
  div.innerHTML = `<textarea rows="2" data-arg="${list}" data-i="${i}" placeholder="${list === 'pro' ? 'AI could … because …' : 'Humans are still needed because …'}"></textarea>
    <button class="del" type="button" aria-label="Delete argument" data-del="${list}" data-i="${i}">✕</button>`;
  div.querySelector('textarea').value = value;
  return div;
}
function renderArgs(list) {
  const box = $(`[data-list="${list}"]`);
  box.replaceChildren(...answer(current)[list].map((v, i) => argRow(list, i, v)));
}

function openJob(id) {
  current = id;
  const j = jobById(id); const a = answer(id);
  $('#jobIcon').textContent = j.icon;
  $('#jobKicker').textContent = `Job file #${state.jobs.indexOf(id) + 1} of 4`;
  $('#jobTitle').textContent = j.title;
  $('#jobDesc').textContent = j.desc;
  $('#jobHints').innerHTML = j.hints.map(h => `<li>${h}</li>`).join('');
  form.tasks.value = a.tasks;
  form.advice.value = a.advice;
  form.sources.value = a.sources;
  form.risk.value = a.risk;
  $('#riskVal').textContent = a.risk + ' %';
  renderArgs('pro'); renderArgs('contra');
  renderChips();
  updateSheetStatus();
  $('#sheet').hidden = false;
  $('#sheet').scrollTop = 0;
  document.body.style.overflow = 'hidden';
  setSceneActive(false);
}
function closeJob() {
  $('#sheet').hidden = true;
  document.body.style.overflow = '';
  setSceneActive(true);
  const wasDone = current && isDone(current);
  renderDashboard();
  if (wasDone) {
    const all = state.jobs.every(isDone);
    sayFromFuhs(all ? 'All four jobs done?! Wow. Put the report on my desk… I\'ll read it after my nap. 😴' : 'Nice work. One file less on my desk. ☕');
  }
  current = null;
}

function renderChips() {
  const a = answer(current);
  $('#estimateChips').innerHTML = ESTIMATES.map(e => `<button type="button" class="chip" data-est="${e.value}" aria-pressed="${a.estimate === e.value}">${e.label}</button>`).join('');
}

function updateSheetStatus() {
  const c = checks(answer(current));
  for (const [k, ok] of Object.entries(c)) $(`[data-check="${k}"]`).classList.toggle('ok', ok);
  $('#sheetFill').style.width = jobProgress(current) * 100 + '%';
  const missing = Object.keys(c).filter(k => !c[k]).map(k => CHECK_LABELS[k]);
  const m = $('#missing');
  m.classList.toggle('ok', !missing.length);
  m.textContent = missing.length ? `Still missing: ${missing.join(', ')}` : '✓ This job file is complete!';
}

let savedTimer;
function changed() {
  save();
  updateSheetStatus();
  const s = $('#savedNote'); s.classList.add('show');
  clearTimeout(savedTimer); savedTimer = setTimeout(() => s.classList.remove('show'), 1200);
}

form.addEventListener('input', e => {
  const a = answer(current); const t = e.target;
  if (t.dataset.arg) a[t.dataset.arg][+t.dataset.i] = t.value;
  else if (t.name === 'risk') { a.risk = +t.value; $('#riskVal').textContent = t.value + ' %'; }
  else if (t.name in a) a[t.name] = t.value;
  changed();
});
form.addEventListener('click', e => {
  const a = answer(current);
  const add = e.target.closest('[data-add]');
  const del = e.target.closest('[data-del]');
  const chip = e.target.closest('[data-est]');
  if (add) {
    const list = add.dataset.add;
    if (a[list].length >= 6) return toast('6 arguments are enough 🙂');
    a[list].push(''); renderArgs(list);
    $(`[data-list="${list}"] .arg:last-child textarea`).focus();
    changed();
  } else if (del) {
    const list = del.dataset.del;
    a[list].splice(+del.dataset.i, 1);
    if (a[list].length < 2) a[list].push('');
    renderArgs(list); changed();
  } else if (chip) {
    a.estimate = +chip.dataset.est; renderChips(); changed();
  }
});
form.addEventListener('submit', e => e.preventDefault());
$('#closeSheet').onclick = closeJob;
$('#doneBtn').onclick = closeJob;

// ---------- report ----------
function esc(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function list(arr) { const f = arr.filter(s => s.trim()); return f.length ? `<ul>${f.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p><em>–</em></p>'; }
function estLabel(v) { return ESTIMATES.find(e => e.value === v)?.label || 'not decided yet'; }

function renderReport() {
  const jobs = state.jobs.map(id => ({ j: jobById(id), a: answer(id) }));
  const sorted = [...jobs].sort((x, y) => (x.a.estimate || 99) - (y.a.estimate || 99) || y.a.risk - x.a.risk);
  // spread pins with the same estimate so they don't overlap
  const seen = {};
  const pins = jobs.filter(x => x.a.estimate).map(x => {
    const n = seen[x.a.estimate] = (seen[x.a.estimate] || 0) + 1;
    const left = ((x.a.estimate - 0.5) / 6) * 100;
    return `<div class="pin" style="left:${left}%;top:${-(n - 1) * 46}px">${x.j.icon}<small>${x.j.title}</small></div>`;
  }).join('');
  const maxStack = Math.max(0, ...Object.values(seen));
  const all = state.jobs.every(isDone);
  const date = new Date().toLocaleDateString('de-DE');

  $('#reportBody').innerHTML = `
    <div class="report-head">
      <div class="kicker">LMG Job Center · Consulting report · ${date}</div>
      <h2 id="reportTitle">Which job has a future?</h2>
      <p>Researcher: <strong>${esc(state.name)}</strong> · Progress: ${Math.round(totalProgress() * 100)} %</p>
    </div>
    <h3>Timeline: when will AI / robots do most of the job?</h3>
    <div class="timeline" style="margin-top:${30 + maxStack * 46}px">
      ${pins}
      <div class="axis"></div>
      <div class="labels">${ESTIMATES.map(e => `<span>${e.label}</span>`).join('')}</div>
    </div>
    ${sorted.map(({ j, a }) => `
      <article class="rjob">
        <h3>${j.icon} ${j.title}</h3>
        <div class="meta"><span>⏳ ${estLabel(a.estimate)}</span><span>🤖 ${a.risk} % automatable</span><span>${isDone(j.id) ? '✓ complete' : '⚠️ incomplete'}</span></div>
        <p><strong>Tasks:</strong> ${esc(a.tasks) || '–'}</p>
        <div class="cols">
          <div><strong>🤖 For replaceability</strong>${list(a.pro)}</div>
          <div><strong>🧑 Against replaceability</strong>${list(a.contra)}</div>
        </div>
        <p><strong>Our advice:</strong> ${esc(a.advice) || '–'}</p>
        ${a.sources.trim() ? `<p><strong>Sources:</strong> ${esc(a.sources)}</p>` : ''}
      </article>`).join('')}
    <div class="fuhs-note">☕ <strong>Note from Mr Fuhs:</strong> ${all
      ? 'Excellent. I will present this as my own work at the next conference. Just kidding. Mostly.'
      : 'This report is not finished yet. Come back when all four job files are complete. I\'ll be… here. Resting my eyes.'}</div>`;
}
$('#reportBtn').onclick = () => { renderReport(); $('#report').hidden = false; $('#report').scrollTop = 0; document.body.style.overflow = 'hidden'; setSceneActive(false); };
$('#closeReport').onclick = () => { $('#report').hidden = true; document.body.style.overflow = ''; setSceneActive(true); };
$('#printBtn').onclick = () => window.print();

// ---------- menu: export / copy / reset ----------
function asText() {
  const lines = [`LMG Job Center – Research of ${state.name}`, `Progress: ${Math.round(totalProgress() * 100)} %`, ''];
  for (const id of state.jobs) {
    const j = jobById(id); const a = answer(id);
    lines.push(`=== ${j.title} ===`, `Tasks: ${a.tasks}`, 'FOR replaceability:', ...a.pro.filter(s => s.trim()).map(s => ` + ${s}`),
      'AGAINST replaceability:', ...a.contra.filter(s => s.trim()).map(s => ` - ${s}`),
      `Automatable: ${a.risk} %`, `Most of the job automated in: ${estLabel(a.estimate)}`, `Advice: ${a.advice}`, `Sources: ${a.sources}`, '');
  }
  return lines.join('\n');
}
const menu = $('#menu');
$('#menuBtn').onclick = () => menu.showModal();
$('#closeMenu').onclick = () => menu.close();
menu.addEventListener('click', e => { if (e.target === menu) menu.close(); });
$('#exportBtn').onclick = () => {
  const blob = new Blob([asText()], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `jobcenter-${state.name.replace(/[^\w]+/g, '_')}.txt`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  menu.close();
};
$('#copyBtn').onclick = async () => {
  try { await navigator.clipboard.writeText(asText()); toast('Copied! Paste it into Notes, Pages or an email.'); }
  catch { toast('Copying is not allowed here – use download instead.'); }
  menu.close();
};
$('#resetBtn').onclick = () => {
  if (!confirm('Really delete all your answers on this iPad? This cannot be undone.')) return;
  localStorage.removeItem(KEY); state = null; menu.close();
  $('#nameInput').value = ''; show('login'); sayFromFuhs('Bye. Close the door on your way out. 💤');
};

// ---------- login ----------
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#nameInput').value.trim();
  if (name.length < 2) return;
  state = { name, jobs: assignJobs(name), answers: {}, created: Date.now() };
  save(); renderDashboard(); show('dashboard');
  $('#nameInput').blur(); window.scrollTo({ top: 0, behavior: 'smooth' });
  sayFromFuhs(`Ah, ${name.split(' ')[0]}. Your four job files are on the table. Wake me when you're done. 😴`);
});

// ---------- misc ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
}
$('#cards').addEventListener('click', e => { const c = e.target.closest('[data-job]'); if (c) openJob(c.dataset.job); });

// ---------- boot ----------
initScene($('#scene'), $('#bubble'));
if (state?.name && state.jobs?.length === 4 && state.jobs.every(jobById)) { renderDashboard(); show('dashboard'); }
else { state = null; show('login'); }
