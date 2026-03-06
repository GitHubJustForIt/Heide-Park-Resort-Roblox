/* ============================================================
   HEIDE PARK ROBLOX — SCRIPT.JS  (v2 — fully fixed)
   ============================================================ */

let currentUser  = null;
let currentAge   = null;
let selectedDate = null;
let calYear, calMonth;
let captchaAnswer = 0;
let factIndex = 0;
let factTimer = null;

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { document.getElementById('loading-screen')?.classList.add('hidden'); }, 1800);

  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth() + 1;

  initLoginParticles();
  buildNewsTicker();
  buildGallery();
  buildBookingHints();
  buildAttractions();
  buildVisitorTips();
  buildFunFacts();
  buildGoldenTicket();
  buildCalendarSelects();
  renderCalendar();
  initScrollReveal();
  attachHeroButtons();
  attachModalClose();

  // Claim golden ticket button
  document.getElementById('btn-claim-golden')?.addEventListener('click', claimGoldenTicket);
});

/* ─── LOGIN PARTICLES ─────────────────────────────────────── */
function initLoginParticles() {
  const canvas = document.getElementById('login-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const pts = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 70; i++) {
    pts.push({ x:Math.random()*1920, y:Math.random()*1080, r:Math.random()*2.2+0.4,
      vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45, a:Math.random()*.55+.08,
      c:['#ff6a00','#ff8c38','#ffaa60'][Math.floor(Math.random()*3)] });
  }

  (function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x = (p.x+p.vx+W)%W; p.y = (p.y+p.vy+H)%H;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
}

/* ─── LOGIN / LOGOUT ──────────────────────────────────────── */
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const age      = parseInt(document.getElementById('login-age').value);
  const terms    = document.getElementById('login-terms').checked;
  document.getElementById('login-error').classList.remove('show');

  if (!username || username.length < 3) return showLoginError('Please enter a valid Roblox username (min 3 characters).');
  if (!age || age < 5 || age > 99)      return showLoginError('Please enter a valid age between 5 and 99.');
  if (!terms)                           return showLoginError('You must accept the Terms of Service to continue.');

  currentUser = username; currentAge = age;

  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('main-site').classList.add('visible');
  document.getElementById('navbar-avatar-letter').textContent  = username.charAt(0).toUpperCase();
  document.getElementById('navbar-username-label').textContent = username;

  // Force reveal all sections after login
  document.querySelectorAll('.section').forEach(s => s.classList.add('revealed'));

  renderCalendar();
  checkGoldenTicketClaim();
});

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg; el.classList.add('show');
}

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('main-site').classList.remove('visible');
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-age').value = '';
  document.getElementById('login-terms').checked = false;
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('navbar-username-label').textContent = 'Guest';
});

/* ─── NEWS TICKER ─────────────────────────────────────────── */
function buildNewsTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;
  const news = SETTINGS.parkNews || [];
  if (!news.length) { document.querySelector('.news-ticker')?.style && (document.querySelector('.news-ticker').style.display='none'); return; }
  let html = '';
  for (let p = 0; p < 3; p++) news.forEach(item => {
    html += `<span class="ticker-item"><strong>${item.date}</strong><span class="ticker-sep"> — </span>${item.text}</span>`;
  });
  inner.innerHTML = html;
}

/* ─── GALLERY ─────────────────────────────────────────────── */
function buildGallery() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;
  const zones = [
    { icon:'🎢', name:'Thunder Zone',    desc:'Extreme coasters & adrenaline drops',  clr:'#ff6a00' },
    { icon:'🎠', name:'Fantasy Land',    desc:'Family rides & magical worlds',         clr:'#ff8c38' },
    { icon:'🌊', name:'Aqua World',      desc:'Water slides & splash attractions',     clr:'#0099ff' },
    { icon:'👻', name:'Haunted Hollow',  desc:'Horror mazes & scare experiences',      clr:'#9b59b6' },
    { icon:'🚀', name:'Space Launch',    desc:'Sci-fi zones & zero-gravity rides',     clr:'#1abc9c' },
    { icon:'🌲', name:'Wild Forest',     desc:'Nature trails & outdoor adventures',    clr:'#27ae60' },
  ];
  container.innerHTML = zones.map(z => `
    <div class="gallery-card" style="--zone-clr:${z.clr}">
      <div class="gallery-card-bg">
        <div class="gallery-card-icon">${z.icon}</div>
        <div class="gallery-card-label">${z.name}</div>
      </div>
      <div class="gallery-card-overlay"></div>
      <div class="gallery-card-info"><h4>${z.name}</h4><p>${z.desc}</p></div>
    </div>`).join('');
}

/* ─── BOOKING HINTS ───────────────────────────────────────── */
function buildBookingHints() {
  const c = document.getElementById('hints-grid'); if (!c) return;
  const max = SETTINGS.park.maxBookingsPerDay, win = SETTINGS.park.bookingWindowDays;
  c.innerHTML = [
    { icon:'🎟', title:'Limited Spots',       text:`Only ${max} tickets per event day. Spots are gone fast — book early!` },
    { icon:'📅', title:'Date-Locked',          text:'Tickets are strictly tied to your selected date. No date changes allowed.' },
    { icon:'⏱', title:`${win}-Day Window`,   text:`Maximum ${win} days advance booking. You can not book further ahead.` },
    { icon:'🚫', title:'No Refunds',           text:'All sales are 100% final. Tickets cannot be refunded or transferred.' },
    { icon:'⚡', title:'Instant Confirm',      text:'Your booking is instant. A Discord notification fires immediately after.' },
    { icon:'🔑', title:'Roblox ID Required',  text:'Your exact Roblox username verifies your identity at park entry.' },
  ].map(h => `<div class="hint-card"><div class="hint-icon">${h.icon}</div><div class="hint-title">${h.title}</div><div class="hint-text">${h.text}</div></div>`).join('');
}

/* ─── NEXT ATTRACTIONS ────────────────────────────────────── */
function buildAttractions() {
  const c = document.getElementById('attractions-list'); if (!c) return;
  const items = SETTINGS.nextAttractions || [];
  c.innerHTML = items.map(a => `
    <div class="attraction-item">
      <div class="attraction-icon">${a.icon}</div>
      <div class="attraction-info"><div class="attraction-name">${a.name}</div><div class="attraction-eta">Opening: ${a.eta}</div></div>
      <div class="attraction-badge">COMING SOON</div>
    </div>`).join('');
}

/* ─── VISITOR TIPS ────────────────────────────────────────── */
function buildVisitorTips() {
  const c = document.getElementById('tips-list'); if (!c) return;
  c.innerHTML = (SETTINGS.visitorTips||[]).map((t,i) =>
    `<div class="tip-item"><div class="tip-num">0${i+1}</div><div class="tip-text">${t}</div></div>`).join('');
}

/* ─── FUN FACTS ───────────────────────────────────────────── */
function buildFunFacts() {
  const facts = SETTINGS.funFacts || [];
  const textEl = document.getElementById('fact-text');
  const dotsEl = document.getElementById('facts-dots');
  if (!textEl || !facts.length) return;

  function renderDots() {
    dotsEl.innerHTML = facts.map((_,i) =>
      `<div class="fact-dot${i===factIndex?' active':''}" data-i="${i}"></div>`).join('');
    dotsEl.querySelectorAll('.fact-dot').forEach(d =>
      d.addEventListener('click', () => { factIndex=+d.dataset.i; showFact(false); }));
  }

  function showFact(anim=true) {
    if (anim) {
      textEl.classList.add('fade');
      setTimeout(() => { textEl.textContent=`"${facts[factIndex]}"`; textEl.classList.remove('fade'); }, 400);
    } else { textEl.textContent = `"${facts[factIndex]}"`; }
    renderDots();
    clearInterval(factTimer);
    factTimer = setInterval(() => { factIndex=(factIndex+1)%facts.length; showFact(true); }, 5000);
  }

  textEl.textContent = `"${facts[0]}"`;
  renderDots();
  factTimer = setInterval(() => { factIndex=(factIndex+1)%facts.length; showFact(true); }, 5000);
}

/* ─── GOLDEN TICKET ───────────────────────────────────────── */
function buildGoldenTicket() {
  const section = document.getElementById('golden-ticket-section');
  if (!section) return;

  const gt = SETTINGS.goldenTicket;

  if (!gt || !gt.enabled) {
    section.style.display = 'none';
    return;
  }

  // Must be visible
  section.style.display = '';

  const isClaimed = !!(gt.claimedBy && gt.claimedBy.trim());

  // Rebuild sparkles
  const card = document.getElementById('golden-ticket-card');
  if (card) {
    card.querySelectorAll('.golden-sparkle').forEach(s => s.remove());
    for (let i = 0; i < 22; i++) {
      const sp = document.createElement('div');
      sp.className = 'golden-sparkle';
      const tx = ((Math.random()-.5)*90).toFixed(0);
      const ty = (-(Math.random()*70+20)).toFixed(0);
      sp.style.cssText = `left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;--dur:${(Math.random()*2+1.5).toFixed(2)}s;--delay:${(Math.random()*2.5).toFixed(2)}s;--tx:${tx}px;--ty:${ty}px;width:${(Math.random()*5+3).toFixed(0)}px;height:${(Math.random()*5+3).toFixed(0)}px`;
      card.appendChild(sp);
    }
  }

  // Date badge
  const dateBadge = document.getElementById('gt-date-badge');
  if (dateBadge) {
    if (gt.bookingDate) {
      dateBadge.innerHTML = `<span>📅</span> Valid: <strong>${gt.bookingDate}</strong>&nbsp;·&nbsp;${gt.label||'Golden Event'}`;
      dateBadge.style.display = 'inline-flex';
    } else { dateBadge.style.display = 'none'; }
  }

  const claimBtn   = document.getElementById('btn-claim-golden');
  const claimedBdg = document.getElementById('gt-claimed-badge');

  if (isClaimed) {
    if (claimBtn)   claimBtn.style.display   = 'none';
    if (claimedBdg) { claimedBdg.style.display='inline-flex'; claimedBdg.innerHTML=`🔒 Claimed by <strong style="margin-left:4px">${gt.claimedBy}</strong>`; }
  } else {
    if (claimBtn)   claimBtn.style.display   = 'inline-flex';
    if (claimedBdg) claimedBdg.style.display = 'none';
  }
}

function checkGoldenTicketClaim() {
  const gt = SETTINGS.goldenTicket;
  if (!gt || !currentUser) return;
  if (gt.claimedBy && gt.claimedBy.toLowerCase() === currentUser.toLowerCase()) {
    const av = document.querySelector('.navbar-avatar');
    if (av) { av.style.background='linear-gradient(135deg,#ffd700,#ffe566)'; av.style.color='#111'; av.title='✨ Golden Ticket Holder'; }
  }
}

function claimGoldenTicket() {
  if (!currentUser) return;
  const gt = SETTINGS.goldenTicket;
  if (!gt || gt.claimedBy) return;

  gt.claimedBy = currentUser;
  sendWebhook(SETTINGS.webhooks.goldenTicket, {
    username: currentUser, date: gt.bookingDate||'Open Entry',
    type: '🏆 GOLDEN TICKET', age: currentAge, label: gt.label||'Golden Event',
  });
  buildGoldenTicket(); checkGoldenTicketClaim();
  launchConfetti(); launchConfetti();
  showSuccess('🏆 GOLDEN TICKET CLAIMED!',
    `Legendary! ${currentUser}, you hold the rarest ticket in Heide Park Roblox history. Your exclusive entry for "${gt.bookingDate||'your event'}" is confirmed. Discord has been notified!`);
}

/* ─── CALENDAR ────────────────────────────────────────────── */
function buildCalendarSelects() {
  const yearSel = document.getElementById('cal-year');
  const monSel  = document.getElementById('cal-month');
  if (!yearSel || !monSel) return;
  yearSel.innerHTML = ''; monSel.innerHTML = '';

  const now = new Date();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  for (let y = now.getFullYear(); y <= now.getFullYear()+2; y++) {
    const o = document.createElement('option'); o.value=y; o.textContent=y;
    if (y===calYear) o.selected=true; yearSel.appendChild(o);
  }
  MONTHS.forEach((m,i) => {
    const o = document.createElement('option'); o.value=i+1; o.textContent=m;
    if (i+1===calMonth) o.selected=true; monSel.appendChild(o);
  });
  yearSel.addEventListener('change', () => { calYear  = +yearSel.value; renderCalendar(); });
  monSel.addEventListener('change',  () => { calMonth = +monSel.value;  renderCalendar(); });
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const today   = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + SETTINGS.park.bookingWindowDays);

  const firstDow    = new Date(calYear, calMonth-1, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const monthCfg    = ((SETTINGS.bookingDays[calYear]||{})[calMonth]) || {};
  const max         = SETTINGS.park.maxBookingsPerDay;
  const gt          = SETTINGS.goldenTicket;

  // Leading empty cells
  for (let i = 0; i < firstDow; i++) {
    const c = document.createElement('div'); c.className='cal-day empty'; grid.appendChild(c);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDt = new Date(calYear, calMonth-1, d); cellDt.setHours(0,0,0,0);
    const dateKey = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cfg      = monthCfg[d];
    const enabled  = !!(cfg && cfg.enabled === true);
    const bookedBy = enabled ? (cfg.bookedBy || []) : [];
    const soldOut  = bookedBy.length >= max;
    const isYours  = !!(currentUser && bookedBy.some(u => u.toLowerCase() === currentUser.toLowerCase()));
    const isPast   = cellDt < today;
    const inWindow = cellDt >= today && cellDt <= maxDate;

    // Is this day the golden ticket day?
    const isGoldenDay = !!(gt && gt.enabled && gt.bookingDate === dateKey);

    let cls = 'cal-day';
    let lbl = '';
    let clickable = false;

    if (isPast) {
      cls += ' past';
    } else if (!enabled) {
      cls += ' not-bookable';
    } else if (!inWindow) {
      cls += ' out-of-window';
    } else if (isYours) {
      cls += ' yours'; lbl = 'YOURS';
    } else if (soldOut) {
      cls += ' soldout'; lbl = 'FULL';
    } else if (bookedBy.length > 0) {
      cls += ' booked'; lbl = `${bookedBy.length}/${max}`; clickable = true;
    } else {
      cls += ' available'; lbl = 'BOOK'; clickable = true;
    }

    if (isGoldenDay) cls += ' golden-day';

    const cell = document.createElement('div');
    cell.className = cls;
    cell.innerHTML = `
      ${isGoldenDay ? '<div class="cal-golden-dot">✦</div>' : ''}
      <span class="day-num">${d}</span>
      ${lbl ? `<span class="day-lbl">${lbl}</span>` : ''}
    `;

    if (clickable) cell.addEventListener('click', () => openBookingModal(dateKey, d, [...bookedBy]));

    grid.appendChild(cell);
  }
}

/* ─── BOOKING MODAL ───────────────────────────────────────── */
function openBookingModal(dateKey, dayNum, bookedBy) {
  if (!currentUser) return;
  selectedDate = { dateKey, dayNum, bookedBy };

  const backdrop = document.getElementById('booking-modal');
  const loadEl   = document.getElementById('modal-loading');
  const formEl   = document.getElementById('modal-form');

  formEl.classList.remove('show');
  loadEl.style.display = 'flex';
  backdrop.classList.add('open');

  const msgs = ['Connecting to reservation system…','Verifying availability…','Loading booking details…','Almost ready…'];
  const textEl = document.getElementById('modal-loading-text');
  let mi = 0;
  const iv = setInterval(() => { if (++mi < msgs.length && textEl) textEl.textContent = msgs[mi]; }, 380);

  setTimeout(() => {
    clearInterval(iv);
    loadEl.style.display = 'none';
    formEl.classList.add('show');
    populateBookingForm(dateKey, dayNum, bookedBy);
  }, 1600);
}

function populateBookingForm(dateKey, dayNum, bookedBy) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('booking-date-label').textContent = `${dayNum} ${M[calMonth-1]} ${calYear}`;
  document.getElementById('booking-confirm-username').value = '';

  const dotsEl  = document.getElementById('booking-spots-dots');
  const labelEl = document.getElementById('booking-spots-label');
  const max = SETTINGS.park.maxBookingsPerDay;
  if (dotsEl)  dotsEl.innerHTML  = Array.from({length:max},(_,i)=>`<div class="spot-dot ${i<bookedBy.length?'taken':'open'}"></div>`).join('');
  if (labelEl) { const o=max-bookedBy.length; labelEl.textContent=`${o} spot${o!==1?'s':''} remaining`; }

  const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  captchaAnswer = a + b;
  const qEl = document.getElementById('captcha-question');
  if (qEl) qEl.textContent = `What is ${a} + ${b}?`;
  const ci = document.getElementById('captcha-input'); if (ci) ci.value = '';

  ['confirm-cb-1','confirm-cb-2','confirm-cb-3','confirm-cb-4','confirm-cb-5'].forEach(id => {
    const el = document.getElementById(id); if (el) el.checked = false;
  });
  const err = document.getElementById('booking-error'); if (err) err.style.display='none';
}

function attachModalClose() {
  document.getElementById('btn-cancel-booking')?.addEventListener('click', closeBookingModal);
  document.getElementById('booking-modal')?.addEventListener('click', e => { if(e.target===document.getElementById('booking-modal')) closeBookingModal(); });
}

function closeBookingModal() {
  document.getElementById('booking-modal')?.classList.remove('open');
  selectedDate = null;
}

document.getElementById('booking-form-el').addEventListener('submit', function(e) {
  e.preventDefault();
  const uname = document.getElementById('booking-confirm-username').value.trim();
  const cap   = parseInt(document.getElementById('captcha-input').value);
  const allChecked = ['confirm-cb-1','confirm-cb-2','confirm-cb-3','confirm-cb-4','confirm-cb-5']
    .every(id => document.getElementById(id)?.checked);

  if (uname.toLowerCase() !== currentUser.toLowerCase()) return showBookingError('Username does not match your login username.');
  if (cap !== captchaAnswer)  return showBookingError('Wrong answer. Please re-read the math question.');
  if (!allChecked)            return showBookingError('Please tick all five boxes to confirm the booking rules.');

  submitBooking();
});

function showBookingError(msg) {
  const el = document.getElementById('booking-error'); if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake 0.4s ease';
}

function submitBooking() {
  const btn = document.getElementById('btn-book');
  if (btn) { btn.disabled=true; btn.textContent='BOOKING…'; }

  const { dateKey, bookedBy } = selectedDate;
  bookedBy.push(currentUser);

  const [y, mo, d] = dateKey.split('-').map(Number);
  if (!SETTINGS.bookingDays[y])     SETTINGS.bookingDays[y]     = {};
  if (!SETTINGS.bookingDays[y][mo]) SETTINGS.bookingDays[y][mo] = {};
  if (!SETTINGS.bookingDays[y][mo][d]) SETTINGS.bookingDays[y][mo][d] = { enabled:true, bookedBy:[] };
  SETTINGS.bookingDays[y][mo][d].bookedBy = bookedBy;

  sendWebhook(SETTINGS.webhooks.regularBooking, {
    username: currentUser, date: dateKey, type: 'Regular Ticket',
    age: currentAge, spots_left: SETTINGS.park.maxBookingsPerDay - bookedBy.length,
  });

  closeBookingModal();
  renderCalendar();
  showSuccess(`🎟 Confirmed for ${dateKey}!`, `Your spot is locked in, ${currentUser}! See you at Heide Park Roblox. Check Discord for your confirmation message.`);
  launchConfetti();

  if (btn) { btn.disabled=false; btn.textContent='CONFIRM BOOKING'; }
}

/* ─── SUCCESS ─────────────────────────────────────────────── */
function showSuccess(title, sub) {
  document.getElementById('success-title').textContent = title;
  document.getElementById('success-sub').textContent   = sub;
  document.getElementById('success-overlay').classList.add('show');
}
document.getElementById('btn-close-success').addEventListener('click', () => {
  document.getElementById('success-overlay').classList.remove('show');
});

/* ─── CONFETTI ────────────────────────────────────────────── */
function launchConfetti() {
  const clrs = ['#ff6a00','#ff8c38','#ffffff','#ffd700','#00c47a','#ffe566'];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div'); el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${clrs[Math.floor(Math.random()*clrs.length)]};width:${Math.random()*9+5}px;height:${Math.random()*9+5}px;border-radius:${Math.random()>.5?'50%':'2px'};--dur:${(Math.random()*2+2).toFixed(2)}s;--delay:${(Math.random()*.8).toFixed(2)}s;--tx:${((Math.random()-.5)*220).toFixed(0)}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* ─── WEBHOOK ─────────────────────────────────────────────── */
async function sendWebhook(url, data) {
  if (!url) return;
  const isGolden = String(data.type).includes('GOLDEN');
  const embed = {
    title:       isGolden ? '🏆 Golden Ticket Claimed!' : '🎟 New Ticket Reserved!',
    description: isGolden ? `A legendary Golden Ticket has been claimed at **Heide Park Roblox**!` : `A new ticket reservation was just made at **Heide Park Roblox**.`,
    color:       isGolden ? 0xFFD700 : 0xFF6A00,
    fields: [
      { name:'👤 Roblox Username', value:String(data.username),         inline:true },
      { name:'📅 Date',            value:String(data.date),             inline:true },
      { name:'🎫 Type',            value:String(data.type),             inline:true },
      { name:'🎂 Age',             value:String(data.age||'N/A'),       inline:true },
    ],
    footer: { text:`Heide Park Roblox Ticket System · ${new Date().toLocaleString()}` },
  };
  if (!isGolden && data.spots_left !== undefined) embed.fields.push({ name:'📊 Spots Left', value:String(data.spots_left), inline:true });
  if (isGolden && data.label) embed.fields.push({ name:'✨ Event', value:String(data.label), inline:true });
  try {
    await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:'Heide Park Roblox',embeds:[embed]}) });
  } catch(e) { console.warn('Webhook note (CORS on GH Pages is fine):', e.message); }
}

/* ─── SCROLL REVEAL ───────────────────────────────────────── */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('revealed'); obs.unobserve(en.target); } });
  }, { threshold: 0.07 });
  document.querySelectorAll('.section').forEach(el => obs.observe(el));
}

/* ─── HERO BUTTONS ────────────────────────────────────────── */
function attachHeroButtons() {
  document.getElementById('hero-book-btn')?.addEventListener('click',    () => document.getElementById('calendar-section')?.scrollIntoView({behavior:'smooth'}));
  document.getElementById('hero-explore-btn')?.addEventListener('click', () => document.getElementById('gallery-section')?.scrollIntoView({behavior:'smooth'}));
}
