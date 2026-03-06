/* ============================================================
   HEIDE PARK ROBLOX — script.js  v4 (Final)
   Pending · LocalStorage · Multi-step booking · Park design
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
let currentUser = null;
let currentAge  = null;
let calYear, calMonth;
let captchaAnswer = 0;
let activeDate = null;   // { key:"YYYY-MM-DD", d:N, bookedBy:[] }

// ── LocalStorage ────────────────────────────────────────────
function lsKey(u){ return 'hpr_' + u.toLowerCase(); }
function userData(u){
  try { const r = localStorage.getItem(lsKey(u)); if(r) return JSON.parse(r); } catch(e){}
  return { age:null, pendingDates:[], goldenPending:false };
}
function saveData(u,d){ try{ localStorage.setItem(lsKey(u),JSON.stringify(d)); }catch(e){} }
function isPendingDate(u,k){ return userData(u).pendingDates.includes(k); }
function isBookedDate(u,k){
  const [y,mo,d]=k.split('-').map(Number);
  const cfg=((SETTINGS.bookingDays[y]||{})[mo]||{})[d];
  return !!(cfg&&(cfg.bookedBy||[]).some(x=>x.toLowerCase()===u.toLowerCase()));
}
function isGoldenPending(u){ return userData(u).goldenPending===true; }
function isGoldenConfirmed(u){
  const gt=SETTINGS.goldenTicket;
  return !!(gt.claimedBy&&gt.claimedBy.toLowerCase()===u.toLowerCase());
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  // Animated loader bar
  const fill = document.getElementById('pl-fill');
  const msg  = document.getElementById('pl-msg');
  const msgs = ['Initialising…','Loading event data…','Preparing calendar…','Almost ready…'];
  let p = 0, mi = 0;
  const iv = setInterval(() => {
    p = Math.min(p + (Math.random() * 18 + 6), 100);
    if (fill) fill.style.width = p + '%';
    mi = Math.min(mi + 1, msgs.length - 1);
    if (msg) msg.textContent = msgs[mi];
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => document.getElementById('page-loader')?.classList.add('out'), 200);
    }
  }, 320);

  // Init calendar state
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth() + 1;

  initCanvas();
  buildTicker();
  buildZones();
  buildCalSelects();
  renderCal();
  buildGoldenTicket();
  initScrollReveal();
  wireNav();
  wireBookingFlow();
  wireGoldenFlow();
  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
});

/* ============================================================
   LOGIN CANVAS PARTICLES
   ============================================================ */
function initCanvas() {
  const c = document.getElementById('lc'); if (!c) return;
  const ctx = c.getContext('2d'); let W, H;
  const pts = [];
  function resize(){ W = c.width = innerWidth; H = c.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i=0; i<60; i++) pts.push({
    x: Math.random()*1920, y: Math.random()*1080,
    r: Math.random()*1.8+.4, vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
    a: Math.random()*.4+.06, c: ['#c8380a','#e85020','#8a2200'][Math.floor(Math.random()*3)]
  });
  (function tick(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.globalAlpha=p.a; ctx.fill();
    });
    ctx.globalAlpha=1; requestAnimationFrame(tick);
  })();
}

/* ============================================================
   LOGIN
   ============================================================ */
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = document.getElementById('l-user').value.trim();
  const a = parseInt(document.getElementById('l-age').value);
  const t = document.getElementById('l-terms').checked;
  const err = document.getElementById('login-error');
  err.style.display = 'none';

  if (!u || u.length < 3) return loginErr('Please enter a valid Roblox username (min 3 chars).');
  if (!a || a < 5 || a > 99) return loginErr('Please enter a valid age (5–99).');
  if (!t) return loginErr('You must accept the Terms of Service to continue.');

  currentUser = u; currentAge = a;
  const saved = userData(u);
  if (!saved.age) { saved.age = a; saveData(u, saved); }

  // Hide login, show site
  document.getElementById('login-screen').classList.add('out');
  document.getElementById('site').classList.add('on');

  // Header user info
  document.getElementById('sh-avatar').textContent  = u.charAt(0).toUpperCase();
  document.getElementById('sh-uname').textContent   = u;
  updatePendingBadge();
  checkGoldenNav();

  // Trigger scroll reveal for all sections
  document.querySelectorAll('.section').forEach(s => s.classList.add('on'));
  renderCal();
  buildGoldenTicket();
});

function loginErr(m) {
  const el = document.getElementById('login-error');
  el.textContent = m; el.style.display = 'block';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake .38s ease';
}

function doLogout() {
  currentUser = null; currentAge = null;
  document.getElementById('site').classList.remove('on');
  document.getElementById('login-screen').classList.remove('out');
  document.getElementById('l-user').value = '';
  document.getElementById('l-age').value = '';
  document.getElementById('l-terms').checked = false;
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('sh-avatar').textContent = '?';
  document.getElementById('sh-uname').textContent  = 'Guest';
  document.getElementById('sh-pending').style.display = 'none';
}

function updatePendingBadge() {
  if (!currentUser) return;
  const d = userData(currentUser);
  const has = d.pendingDates.length > 0 || d.goldenPending;
  document.getElementById('sh-pending').style.display = has ? 'block' : 'none';
}

function checkGoldenNav() {
  const gt = SETTINGS.goldenTicket;
  if (gt && gt.enabled) document.getElementById('nav-golden').style.display = '';
}

/* ============================================================
   NAV WIRING
   ============================================================ */
function wireNav() {
  const scroll = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };
  document.getElementById('nav-park')?.addEventListener('click', scroll('gallery-section'));
  document.getElementById('nav-tickets')?.addEventListener('click', scroll('calendar-section'));
  document.getElementById('nav-golden')?.addEventListener('click', scroll('golden-ticket-section'));
  document.getElementById('hero-book-btn')?.addEventListener('click', scroll('calendar-section'));
  document.getElementById('hero-park-btn')?.addEventListener('click', scroll('gallery-section'));
  document.getElementById('zones-cta-btn')?.addEventListener('click', scroll('calendar-section'));
}

/* ============================================================
   NEWS TICKER
   ============================================================ */
function buildTicker() {
  const el = document.getElementById('ticker-inner'); if (!el) return;
  const news = SETTINGS.parkNews || [];
  if (!news.length) { document.querySelector('.ticker-bar')?.remove(); return; }
  let html = '';
  for (let p = 0; p < 3; p++)
    news.forEach(n => html += `<span>${n.date} &ensp;${n.text}</span>`);
  el.innerHTML = html;
}

/* ============================================================
   ZONES / GALLERY
   ============================================================ */
function buildZones() {
  const g = document.getElementById('gallery-grid'); if (!g) return;
  const zones = [
    { icon:'🎢', name:'Thunder Zone',    desc:'Extreme coasters & high-speed drops',  grad:'linear-gradient(145deg,#8a1a00,#c83010)' },
    { icon:'🎠', name:'Fantasy Land',    desc:'Family rides & enchanted worlds',       grad:'linear-gradient(145deg,#3a0060,#8040c0)' },
    { icon:'🌊', name:'Aqua World',      desc:'Water slides & cooling splash zones',   grad:'linear-gradient(145deg,#003880,#0070c0)' },
    { icon:'👻', name:'Haunted Hollow',  desc:'Horror mazes & scare experiences',      grad:'linear-gradient(145deg,#1a0030,#500080)' },
    { icon:'🚀', name:'Space Launch',    desc:'Zero-gravity sci-fi adventures',        grad:'linear-gradient(145deg,#002a40,#005880)' },
    { icon:'🌲', name:'Wild Forest',     desc:'Nature trails & outdoor adventures',    grad:'linear-gradient(145deg,#0a2200,#1e5000)' },
  ];
  g.innerHTML = zones.map(z => `
    <div class="zone-card">
      <div class="zone-card-top" style="background:${z.grad}">
        <div class="zone-icon">${z.icon}</div>
      </div>
      <div class="zone-card-body">
        <div class="zone-name">${z.name}</div>
        <div class="zone-desc">${z.desc}</div>
        <div class="zone-tag">Explore →</div>
      </div>
    </div>`).join('');
}

/* ============================================================
   GOLDEN TICKET
   ============================================================ */
function buildGoldenTicket() {
  const sec = document.getElementById('golden-ticket-section'); if (!sec) return;
  const gt  = SETTINGS.goldenTicket;
  if (!gt || !gt.enabled) { sec.style.display = 'none'; return; }
  sec.style.display = '';

  const confirmed = !!(gt.claimedBy && gt.claimedBy.trim());
  const byMe      = currentUser && isGoldenConfirmed(currentUser);
  const pendMe    = currentUser && isGoldenPending(currentUser);

  // Date badge
  const db = document.getElementById('gt-date-badge');
  if (db && gt.bookingDate) {
    db.innerHTML = `📅 Valid: <strong>${gt.bookingDate}</strong> · ${gt.label||'Golden Event'}`;
    db.style.display = 'inline-flex';
  }

  const claimBtn = document.getElementById('btn-claim-golden');
  const pendBdg  = document.getElementById('gt-pending-badge');
  const clmBdg   = document.getElementById('gt-claimed-badge');
  claimBtn.style.display = 'none'; pendBdg.style.display = 'none'; clmBdg.style.display = 'none';

  if (byMe) {
    clmBdg.innerHTML = '✅ You hold this ticket!'; clmBdg.style.display = 'inline-flex';
  } else if (confirmed) {
    clmBdg.innerHTML = `🔒 Claimed by <strong style="margin-left:4px">${gt.claimedBy}</strong>`;
    clmBdg.style.display = 'inline-flex';
  } else if (pendMe) {
    pendBdg.style.display = 'inline-flex';
  } else {
    claimBtn.style.display = 'inline-flex';
  }
}

/* ============================================================
   CALENDAR
   ============================================================ */
function buildCalSelects() {
  const ms = document.getElementById('cal-month');
  const ys = document.getElementById('cal-year');
  if (!ms||!ys) return;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  MONTHS.forEach((m,i) => {
    const o = document.createElement('option'); o.value=i+1; o.textContent=m;
    if(i+1===calMonth) o.selected=true; ms.appendChild(o);
  });
  for (let y=now.getFullYear(); y<=now.getFullYear()+2; y++) {
    const o = document.createElement('option'); o.value=y; o.textContent=y;
    if(y===calYear) o.selected=true; ys.appendChild(o);
  }
  ms.addEventListener('change', () => { calMonth=+ms.value; renderCal(); });
  ys.addEventListener('change', () => { calYear=+ys.value;  renderCal(); });
  // Update the displayed max capacity
  const maxEl = document.getElementById('cal-max');
  if (maxEl) maxEl.textContent = SETTINGS.park.maxBookingsPerDay;
}

function renderCal() {
  const grid = document.getElementById('calendar-grid'); if (!grid) return;
  grid.innerHTML = '';

  const today   = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + SETTINGS.park.bookingWindowDays);
  const first   = new Date(calYear, calMonth-1, 1).getDay();
  const daysInM = new Date(calYear, calMonth, 0).getDate();
  const mCfg    = ((SETTINGS.bookingDays[calYear]||{})[calMonth])||{};
  const MAX     = SETTINGS.park.maxBookingsPerDay;
  const gt      = SETTINGS.goldenTicket;

  // Empty cells
  for (let i=0; i<first; i++) {
    const c=document.createElement('div'); c.className='cal-day empty'; grid.appendChild(c);
  }

  for (let d=1; d<=daysInM; d++) {
    const dt = new Date(calYear, calMonth-1, d); dt.setHours(0,0,0,0);
    const dk = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cfg = mCfg[d];
    const enabled   = !!(cfg && cfg.enabled);
    const bookedBy  = enabled ? (cfg.bookedBy||[]) : [];
    const soldOut   = bookedBy.length >= MAX;
    const isPast    = dt < today;
    const inWindow  = dt >= today && dt <= maxDate;
    const isGolden  = !!(gt && gt.enabled && gt.bookingDate === dk);
    const isBooked  = !!(currentUser && isBookedDate(currentUser, dk));
    const isPend    = !!(currentUser && isPendingDate(currentUser, dk));

    let cls = 'cal-day';
    let label = '';
    let clickable = false;

    if (isPast) {
      cls += ' past';
    } else if (!enabled) {
      cls += ' off';
    } else if (!inWindow) {
      cls += ' far';
    } else if (isBooked) {
      cls += ' confirmed'; label = 'Booked';
    } else if (isPend) {
      cls += ' pend-day'; label = 'Pending';
    } else if (soldOut) {
      cls += ' soldout'; label = 'Full';
    } else if (bookedBy.length > 0) {
      cls += ' partial'; label = `${bookedBy.length}/${MAX}`; clickable = true;
    } else {
      cls += ' available'; label = 'Book'; clickable = true;
    }

    if (isGolden) cls += ' golden-day';

    const cell = document.createElement('div');
    cell.className = cls;
    cell.innerHTML = `
      ${isGolden ? '<div class="cal-gdot">✦</div>' : ''}
      <span class="dn">${d}</span>
      ${label ? `<span class="dl">${label}</span>` : ''}
    `;
    if (clickable) cell.addEventListener('click', () => openBooking(dk, d, bookedBy));
    grid.appendChild(cell);
  }
}

/* ============================================================
   BOOKING FLOW  (5-step modal)
   ============================================================ */
function wireBookingFlow() {
  document.getElementById('bk-x')?.addEventListener('click', closeBooking);
  document.getElementById('bk-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('bk-overlay')) closeBooking();
  });
  document.getElementById('bk-n1')?.addEventListener('click', step1to2);
  document.getElementById('bk-n2')?.addEventListener('click', step2to3);
  document.getElementById('bk-b2')?.addEventListener('click', () => showStep('bk-s1'));
  document.getElementById('bk-b3')?.addEventListener('click', () => showStep('bk-s2'));
  document.getElementById('bk-submit')?.addEventListener('click', submitBooking);
  document.getElementById('bk-done-close')?.addEventListener('click', closeBooking);
}

function showStep(id) {
  document.querySelectorAll('#bk-overlay .bk-step').forEach(s => {
    s.classList.remove('active'); s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.classList.add('active'); }
}

function openBooking(dk, d, bookedBy) {
  if (!currentUser) return;
  activeDate = { key: dk, d, bookedBy };

  // Reset form state
  document.getElementById('bk-uname').value = '';
  document.getElementById('bk-cap-a').value = '';
  ['cb1','cb2','cb3','cb4','cb5'].forEach(id => { const el=document.getElementById(id); if(el) el.checked=false; });
  ['bk-e1','bk-e2','bk-e3'].forEach(id => { const el=document.getElementById(id); if(el) el.style.display='none'; });

  // Set captcha
  const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  captchaAnswer = a+b;
  document.getElementById('bk-cap-q').textContent = `${a} + ${b} = ?`;

  // Populate date card
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('bkdc-date').textContent = `${d} ${MONTHS[calMonth-1]} ${calYear}`;
  const MAX = SETTINGS.park.maxBookingsPerDay;
  const open = MAX - bookedBy.length;
  document.getElementById('bkdc-meta').textContent = `${open} spot${open!==1?'s':''} remaining · ${bookedBy.length} confirmed`;

  // Capacity dots
  const dotsEl = document.getElementById('bkdc-dots');
  dotsEl.innerHTML = Array.from({length:MAX},(_,i)=>
    `<div class="bkd-dot ${i<bookedBy.length?'taken':'open'}"></div>`).join('');

  // Show overlay with loading step
  document.getElementById('bk-overlay').classList.add('open');
  document.querySelectorAll('#bk-overlay .bk-step').forEach(s => { s.classList.remove('active'); s.style.display='none'; });
  const s0 = document.getElementById('bk-s0'); s0.style.display='block'; s0.classList.add('active');

  // Animated loading sequence
  const prog = document.getElementById('bk-prog');
  const msgEl = document.getElementById('bk-load-msg');
  const items = ['bkci-1','bkci-2','bkci-3'];
  const stepMsgs = [
    'Verifying date availability…',
    'Loading capacity data…',
    'Securing your session…',
    'Ready!'
  ];
  let pct = 0;
  items.forEach(id => {
    const el = document.getElementById(id);
    if(el) { el.className='bkci'; el.querySelector('span').style.background=''; }
  });
  if(prog) prog.style.width = '0%';

  let step = 0;
  const seq = setInterval(() => {
    step++;
    pct = Math.min(pct + 33, 100);
    if(prog) prog.style.width = pct+'%';
    if(msgEl && stepMsgs[step]) msgEl.textContent = stepMsgs[step];
    if(step <= items.length) {
      // Mark previous done
      if(step > 1) {
        const prev = document.getElementById(items[step-2]);
        if(prev) prev.className = 'bkci done';
      }
      // Mark current active
      const cur = document.getElementById(items[step-1]);
      if(cur) cur.className = 'bkci active';
    }
    if(step >= items.length) {
      clearInterval(seq);
      // Mark last done
      const last = document.getElementById(items[items.length-1]);
      if(last) last.className = 'bkci done';
      setTimeout(() => showStep('bk-s1'), 520);
    }
  }, 580);
}

function closeBooking() {
  document.getElementById('bk-overlay').classList.remove('open');
  activeDate = null;
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg; el.style.display = 'block';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake .38s ease';
}

function step1to2() {
  const uname = document.getElementById('bk-uname').value.trim();
  const cap   = parseInt(document.getElementById('bk-cap-a').value);
  if (uname.toLowerCase() !== currentUser.toLowerCase())
    return showErr('bk-e1', 'Username does not match your login. Please enter it exactly.');
  if (isNaN(cap) || cap !== captchaAnswer)
    return showErr('bk-e1', 'Incorrect answer to the security question. Please try again.');
  document.getElementById('bk-e1').style.display = 'none';
  showStep('bk-s2');
}

function step2to3() {
  const allChecked = ['cb1','cb2','cb3','cb4','cb5'].every(id => document.getElementById(id)?.checked);
  if (!allChecked) return showErr('bk-e2', 'Please confirm all five points before continuing.');
  document.getElementById('bk-e2').style.display = 'none';

  // Populate summary
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('bks-guest').textContent = currentUser;
  document.getElementById('bks-date').textContent  = activeDate
    ? `${activeDate.d} ${MONTHS[calMonth-1]} ${calYear}` : '—';
  showStep('bk-s3');
}

function submitBooking() {
  if (!activeDate || !currentUser) return;

  // Show sending step with realistic messages
  showStep('bk-s4');
  const msgs = [
    'Sending to reservation system…',
    'Recording your request…',
    'Notifying park admin…',
    'Finalising…'
  ];
  const msgEl = document.getElementById('bk-send-msg');
  let mi = 0;
  const iv = setInterval(() => {
    mi++; if(mi < msgs.length && msgEl) msgEl.textContent = msgs[mi];
  }, 600);

  // Save pending in localStorage
  const { key, bookedBy } = activeDate;
  const d = userData(currentUser);
  if (!d.pendingDates.includes(key)) { d.pendingDates.push(key); saveData(currentUser, d); }

  // Update runtime SETTINGS.bookingDays pendingBy
  const [y,mo,day] = key.split('-').map(Number);
  const bDays = SETTINGS.bookingDays;
  if (!bDays[y]) bDays[y]={};
  if (!bDays[y][mo]) bDays[y][mo]={};
  if (!bDays[y][mo][day]) bDays[y][mo][day]={enabled:true,bookedBy:[],pendingBy:[]};
  if (!bDays[y][mo][day].pendingBy) bDays[y][mo][day].pendingBy=[];
  if (!bDays[y][mo][day].pendingBy.includes(currentUser))
    bDays[y][mo][day].pendingBy.push(currentUser);

  // Fire webhook
  sendWebhook(SETTINGS.webhooks.regularBooking, {
    username: currentUser,
    date:     key,
    type:     'Standard Entry',
    age:      currentAge,
    status:   '⏳ PENDING — awaiting admin confirmation',
    openSpots: SETTINGS.park.maxBookingsPerDay - bookedBy.length,
  });

  // After realistic delay show done
  setTimeout(() => {
    clearInterval(iv);
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateStr = `${activeDate.d} ${MONTHS[calMonth-1]} ${calYear}`;
    document.getElementById('bk-done-body').textContent =
      `Your booking request for ${dateStr} has been submitted, ${currentUser}. It is now pending admin approval — you will be notified on Discord once confirmed.`;
    const ref = `REF-${Date.now().toString(36).toUpperCase()}`;
    const refEl = document.getElementById('bk-done-ref');
    if (refEl) refEl.textContent = ref;
    showStep('bk-s5');
    renderCal();
    updatePendingBadge();
    confetti(30);
  }, 2600);
}

/* ============================================================
   GOLDEN TICKET FLOW
   ============================================================ */
function wireGoldenFlow() {
  document.getElementById('btn-claim-golden')?.addEventListener('click', openGolden);
  document.getElementById('gt-close')?.addEventListener('click', closeGolden);
  document.getElementById('gt-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('gt-overlay')) closeGolden();
  });
  document.getElementById('gt-submit')?.addEventListener('click', submitGolden);
  document.getElementById('gt-done-close')?.addEventListener('click', closeGolden);
}

function showGTStep(id) {
  document.querySelectorAll('#gt-overlay .bk-step').forEach(s => { s.classList.remove('active'); s.style.display='none'; });
  const el = document.getElementById(id); if(el) { el.style.display='block'; el.classList.add('active'); }
}

function openGolden() {
  if (!currentUser) return;
  document.getElementById('gt-uname').value = '';
  document.getElementById('gt-err').style.display = 'none';
  document.getElementById('gt-overlay').classList.add('open');
  showGTStep('gt-s0');
  setTimeout(() => showGTStep('gt-s1'), 1400);
}

function closeGolden() {
  document.getElementById('gt-overlay').classList.remove('open');
}

function submitGolden() {
  const u = document.getElementById('gt-uname').value.trim();
  if (u.toLowerCase() !== currentUser.toLowerCase()) {
    const e=document.getElementById('gt-err');
    e.textContent='Username does not match.'; e.style.display='block'; return;
  }
  const d = userData(currentUser);
  d.goldenPending = true; saveData(currentUser, d);
  SETTINGS.goldenTicket.pendingBy = currentUser;
  sendWebhook(SETTINGS.webhooks.goldenTicket, {
    username: currentUser, date: SETTINGS.goldenTicket.bookingDate||'Open',
    type:'🏆 GOLDEN TICKET REQUEST', age:currentAge, label:SETTINGS.goldenTicket.label,
    status:'⏳ PENDING — awaiting admin confirmation'
  });
  showGTStep('gt-s2');
  buildGoldenTicket();
  updatePendingBadge();
  confetti(60, true);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
  }), { threshold: 0.07 });
  document.querySelectorAll('.section').forEach(el => obs.observe(el));
}

/* ============================================================
   CONFETTI
   ============================================================ */
function confetti(count=40, golden=false) {
  const clrs = golden
    ? ['#f0b800','#ffe066','#fff7cc','#ffffff','#ffd700']
    : ['#c8380a','#e85020','#ffffff','#ffaa50','#00c47a','#ffe566'];
  for (let i=0; i<count; i++) {
    const el = document.createElement('div'); el.className='confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${clrs[Math.floor(Math.random()*clrs.length)]};width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;border-radius:${Math.random()>.5?'50%':'2px'};--dur:${(Math.random()*2+2.2).toFixed(2)}s;--delay:${(Math.random()*.7).toFixed(2)}s;--tx:${((Math.random()-.5)*180).toFixed(0)}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* ============================================================
   WEBHOOK
   ============================================================ */
async function sendWebhook(url, data) {
  if (!url) return;
  const isGolden   = String(data.type).includes('GOLDEN');
  const isPending  = String(data.status).includes('PENDING');
  const color      = isGolden ? 0xFFD700 : isPending ? 0xFF9900 : 0xFF6A00;

  const embed = {
    title: isGolden ? '🏆 Golden Ticket Request!' : '⏳ New Booking Request (Pending)',
    description: isGolden
      ? `A Golden Ticket request was submitted!\n\n> Move **${data.username}** to \`goldenTicket.claimedBy\` in \`settings.js\` to confirm.`
      : `New booking request — needs admin review.\n\n> Add **${data.username}** to \`bookedBy[]\` for **${data.date}** in \`settings.js\` to confirm.`,
    color,
    fields: [
      { name:'👤 Username', value:String(data.username), inline:true },
      { name:'📅 Date',     value:String(data.date),     inline:true },
      { name:'🎫 Type',     value:String(data.type),     inline:true },
      { name:'🎂 Age',      value:String(data.age||'?'), inline:true },
      { name:'📊 Status',   value:String(data.status),   inline:true },
    ],
    footer: { text:`Heide Park Roblox · ${new Date().toLocaleString()}` }
  };
  if (!isGolden && data.openSpots != null)
    embed.fields.push({ name:'🪑 Open Spots', value:String(data.openSpots), inline:true });
  if (isGolden && data.label)
    embed.fields.push({ name:'✨ Event', value:String(data.label), inline:true });

  try {
    await fetch(url, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username:'Heide Park Roblox', embeds:[embed] })
    });
  } catch(e) { console.warn('Webhook blocked by CORS on GitHub Pages (expected):', e.message); }
}
