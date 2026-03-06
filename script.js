/* ============================================================
   HEIDE PARK ROBLOX — SCRIPT.JS  v3
   Pending system · LocalStorage · Park design
   ============================================================ */

// ── State ────────────────────────────────────────────────────
let currentUser  = null;
let currentAge   = null;
let selectedDate = null;
let calYear, calMonth;
let captchaAnswer = 0;
let factIndex = 0;
let factTimer = null;

// LocalStorage key prefix
const LS_PREFIX = 'hpr_';

/* ============================================================
   LOCAL STORAGE HELPERS
   Per-user data: { age, pendingDates: ["YYYY-MM-DD",...], goldenPending: bool }
   ============================================================ */
function lsKey(username) {
  return LS_PREFIX + username.toLowerCase();
}

function loadUserData(username) {
  try {
    const raw = localStorage.getItem(lsKey(username));
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { age: null, pendingDates: [], goldenPending: false };
}

function saveUserData(username, data) {
  try {
    localStorage.setItem(lsKey(username), JSON.stringify(data));
  } catch(e) {}
}

function isDatePendingForUser(username, dateKey) {
  const d = loadUserData(username);
  return d.pendingDates.includes(dateKey);
}

function isDateBookedForUser(username, dateKey) {
  // Check settings.js confirmed list
  const [y, mo, day] = dateKey.split('-').map(Number);
  const cfg = ((SETTINGS.bookingDays[y]||{})[mo]||{})[day];
  if (!cfg) return false;
  return (cfg.bookedBy||[]).some(u => u.toLowerCase() === username.toLowerCase());
}

function isGoldenPendingForUser(username) {
  const d = loadUserData(username);
  return d.goldenPending === true;
}

function isGoldenBookedForUser(username) {
  const gt = SETTINGS.goldenTicket;
  return !!(gt.claimedBy && gt.claimedBy.toLowerCase() === username.toLowerCase());
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loading-screen')?.classList.add('hidden'), 1900);

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
  document.getElementById('btn-claim-golden')?.addEventListener('click', claimGoldenTicket);
});

/* ============================================================
   LOGIN PARTICLES
   ============================================================ */
function initLoginParticles() {
  const canvas = document.getElementById('login-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const pts = [];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 65; i++) pts.push({
    x: Math.random()*1920, y: Math.random()*1080,
    r: Math.random()*2+.4, vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4,
    a: Math.random()*.5+.07, c: ['#ff6a00','#ff8c38','#c0510b'][Math.floor(Math.random()*3)]
  });
  (function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.globalAlpha=p.a; ctx.fill();
    });
    ctx.globalAlpha=1; requestAnimationFrame(draw);
  })();
}

/* ============================================================
   LOGIN / LOGOUT
   ============================================================ */
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const age      = parseInt(document.getElementById('login-age').value);
  const terms    = document.getElementById('login-terms').checked;
  document.getElementById('login-error').classList.remove('show');

  if (!username || username.length < 3) return showLoginError('Please enter a valid Roblox username (min 3 characters).');
  if (!age || age < 5 || age > 99)      return showLoginError('Please enter a valid age between 5 and 99.');
  if (!terms)                           return showLoginError('You must accept the Terms of Service to continue.');

  currentUser = username;
  currentAge  = age;

  // Load saved data for this user
  const saved = loadUserData(username);
  if (!saved.age) {
    saved.age = age;
    saveUserData(username, saved);
  }

  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('main-site').classList.add('visible');
  document.getElementById('navbar-avatar-letter').textContent  = username.charAt(0).toUpperCase();
  document.getElementById('navbar-username-label').textContent = username;

  // Show pending badge in navbar if user has pending items
  updateNavbarPendingBadge();

  document.querySelectorAll('.section').forEach(s => s.classList.add('revealed'));
  renderCalendar();
  buildGoldenTicket(); // re-render with user context
  checkGoldenTicketNavbar();
});

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg; el.classList.add('show');
}

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null; currentAge = null;
  document.getElementById('main-site').classList.remove('visible');
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-age').value = '';
  document.getElementById('login-terms').checked = false;
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('navbar-username-label').textContent = 'Guest';
  document.getElementById('navbar-avatar-letter').textContent = '?';
  const av = document.querySelector('.navbar-avatar');
  if (av) { av.style.background=''; av.style.color=''; av.title=''; }
  hidePendingBadge();
});

function updateNavbarPendingBadge() {
  if (!currentUser) return;
  const data = loadUserData(currentUser);
  const hasPending = data.pendingDates.length > 0 || data.goldenPending;
  if (hasPending) showPendingBadge(); else hidePendingBadge();
}

function showPendingBadge() {
  let badge = document.getElementById('navbar-pending-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'navbar-pending-badge';
    badge.className = 'navbar-pending-badge';
    badge.textContent = 'PENDING';
    document.querySelector('.navbar-user')?.insertBefore(badge, document.getElementById('btn-logout'));
  }
  badge.style.display = 'inline-flex';
}

function hidePendingBadge() {
  const badge = document.getElementById('navbar-pending-badge');
  if (badge) badge.style.display = 'none';
}

function checkGoldenTicketNavbar() {
  if (!currentUser) return;
  const gt = SETTINGS.goldenTicket;
  if (gt.claimedBy && gt.claimedBy.toLowerCase() === currentUser.toLowerCase()) {
    const av = document.querySelector('.navbar-avatar');
    if (av) { av.style.background='linear-gradient(135deg,#ffd700,#ffe566)'; av.style.color='#111'; av.title='✨ Golden Ticket Holder'; }
  }
}

/* ============================================================
   NEWS TICKER
   ============================================================ */
function buildNewsTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;
  const news = SETTINGS.parkNews || [];
  if (!news.length) { document.querySelector('.news-ticker')?.remove(); return; }
  let html = '';
  for (let p = 0; p < 3; p++) news.forEach(n =>
    html += `<span class="ticker-item"><span class="ticker-dot">●</span><strong>${n.date}</strong>&ensp;${n.text}</span>`);
  inner.innerHTML = html;
}

/* ============================================================
   GALLERY
   ============================================================ */
function buildGallery() {
  const c = document.getElementById('gallery-grid'); if (!c) return;
  const zones = [
    { icon:'🎢', name:'Thunder Zone',    desc:'Extreme coasters & drops',     gradient:'linear-gradient(135deg,#c0390b,#ff6a00)' },
    { icon:'🎠', name:'Fantasy Land',    desc:'Family rides & magic worlds',  gradient:'linear-gradient(135deg,#8a4fff,#bf80ff)' },
    { icon:'🌊', name:'Aqua World',      desc:'Water slides & splash zones',  gradient:'linear-gradient(135deg,#0060c0,#00a8ff)' },
    { icon:'👻', name:'Haunted Hollow',  desc:'Mazes & horror experiences',   gradient:'linear-gradient(135deg,#3a0060,#8b00ff)' },
    { icon:'🚀', name:'Space Launch',    desc:'Sci-fi & zero-gravity rides',  gradient:'linear-gradient(135deg,#004a6e,#00baff)' },
    { icon:'🌲', name:'Wild Forest',     desc:'Nature trails & adventures',   gradient:'linear-gradient(135deg,#1a4a00,#40a000)' },
  ];
  c.innerHTML = zones.map(z => `
    <div class="gallery-card">
      <div class="gallery-card-bg" style="background:${z.gradient}">
        <div class="gallery-card-icon">${z.icon}</div>
      </div>
      <div class="gallery-card-body">
        <div class="gallery-card-name">${z.name}</div>
        <div class="gallery-card-desc">${z.desc}</div>
        <div class="gallery-card-tag">EXPLORE →</div>
      </div>
    </div>`).join('');
}

/* ============================================================
   BOOKING HINTS
   ============================================================ */
function buildBookingHints() {
  const c = document.getElementById('hints-grid'); if (!c) return;
  const max = SETTINGS.park.maxBookingsPerDay, win = SETTINGS.park.bookingWindowDays;
  c.innerHTML = [
    { icon:'🎟', title:'Limited Capacity',    text:`Only ${max} confirmed tickets per event day. Pending requests do not hold spots.` },
    { icon:'📋', title:'Pending → Confirmed', text:'After requesting, your booking is PENDING until the admin confirms it in settings.' },
    { icon:'⏱', title:`${win}-Day Window`,   text:`You may only request bookings up to ${win} days ahead.` },
    { icon:'🚫', title:'No Refunds',          text:'All confirmed bookings are final. Tickets cannot be refunded or transferred.' },
    { icon:'🔔', title:'Discord Notification',text:'Every request fires a Discord webhook instantly so we can review and confirm it.' },
    { icon:'🔑', title:'Roblox ID Required',  text:'Your exact Roblox username is tied to your entry ticket — no substitutions.' },
  ].map(h => `
    <div class="hint-card">
      <div class="hint-icon-wrap">${h.icon}</div>
      <div class="hint-body"><div class="hint-title">${h.title}</div><div class="hint-text">${h.text}</div></div>
    </div>`).join('');
}

/* ============================================================
   NEXT ATTRACTIONS
   ============================================================ */
function buildAttractions() {
  const c = document.getElementById('attractions-list'); if (!c) return;
  c.innerHTML = (SETTINGS.nextAttractions||[]).map(a => `
    <div class="attraction-item">
      <div class="attraction-icon">${a.icon}</div>
      <div class="attraction-info">
        <div class="attraction-name">${a.name}</div>
        <div class="attraction-eta">${a.eta}</div>
      </div>
      <div class="attraction-pill">SOON</div>
    </div>`).join('');
}

/* ============================================================
   VISITOR TIPS
   ============================================================ */
function buildVisitorTips() {
  const c = document.getElementById('tips-list'); if (!c) return;
  c.innerHTML = (SETTINGS.visitorTips||[]).map((t,i) => `
    <div class="tip-item">
      <div class="tip-num">${String(i+1).padStart(2,'0')}</div>
      <div class="tip-text">${t}</div>
    </div>`).join('');
}

/* ============================================================
   FUN FACTS
   ============================================================ */
function buildFunFacts() {
  const facts = SETTINGS.funFacts||[];
  const textEl = document.getElementById('fact-text');
  const dotsEl = document.getElementById('facts-dots');
  if (!textEl||!facts.length) return;

  function renderDots() {
    dotsEl.innerHTML = facts.map((_,i)=>
      `<button class="fact-dot${i===factIndex?' active':''}" data-i="${i}" aria-label="Fact ${i+1}"></button>`).join('');
    dotsEl.querySelectorAll('.fact-dot').forEach(d=>
      d.addEventListener('click',()=>{factIndex=+d.dataset.i; showFact(false);}));
  }

  function showFact(anim=true) {
    if(anim){
      textEl.classList.add('fade');
      setTimeout(()=>{textEl.textContent=`"${facts[factIndex]}"`;textEl.classList.remove('fade');},380);
    } else textEl.textContent=`"${facts[factIndex]}"`;
    renderDots();
    clearInterval(factTimer);
    factTimer=setInterval(()=>{factIndex=(factIndex+1)%facts.length;showFact(true);},5200);
  }

  textEl.textContent=`"${facts[0]}"`;
  renderDots();
  factTimer=setInterval(()=>{factIndex=(factIndex+1)%facts.length;showFact(true);},5200);
}

/* ============================================================
   GOLDEN TICKET
   ============================================================ */
function buildGoldenTicket() {
  const section = document.getElementById('golden-ticket-section');
  if (!section) return;
  const gt = SETTINGS.goldenTicket;
  if (!gt||!gt.enabled) { section.style.display='none'; return; }
  section.style.display='';

  const isConfirmedClaimed = !!(gt.claimedBy && gt.claimedBy.trim());
  const isPendingByMe      = currentUser && isGoldenPendingForUser(currentUser);
  const isBookedByMe       = currentUser && isGoldenBookedForUser(currentUser);

  // Also check if any pendingBy is set in settings (already sent webhook)
  const hasPendingInSettings = !!(gt.pendingBy && gt.pendingBy.trim());

  // Sparkles
  const card = document.getElementById('golden-ticket-card');
  if (card) {
    card.querySelectorAll('.golden-sparkle').forEach(s=>s.remove());
    for (let i=0;i<24;i++) {
      const sp=document.createElement('div'); sp.className='golden-sparkle';
      const tx=((Math.random()-.5)*100).toFixed(0), ty=(-(Math.random()*80+20)).toFixed(0);
      sp.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;--dur:${(Math.random()*2+1.4).toFixed(2)}s;--delay:${(Math.random()*2.8).toFixed(2)}s;--tx:${tx}px;--ty:${ty}px;width:${(Math.random()*5+2).toFixed(0)}px;height:${(Math.random()*5+2).toFixed(0)}px`;
      card.appendChild(sp);
    }
  }

  // Date badge
  const dateBadge = document.getElementById('gt-date-badge');
  if (dateBadge && gt.bookingDate) {
    dateBadge.innerHTML=`📅 Valid: <strong>${gt.bookingDate}</strong>&ensp;·&ensp;${gt.label||'Golden Event'}`;
    dateBadge.style.display='inline-flex';
  } else if (dateBadge) dateBadge.style.display='none';

  const claimBtn   = document.getElementById('btn-claim-golden');
  const claimedBdg = document.getElementById('gt-claimed-badge');
  const pendingBdg = document.getElementById('gt-pending-badge');

  // Reset all
  if (claimBtn)   claimBtn.style.display='none';
  if (claimedBdg) claimedBdg.style.display='none';
  if (pendingBdg) pendingBdg.style.display='none';

  if (isBookedByMe) {
    if (claimedBdg) { claimedBdg.style.display='inline-flex'; claimedBdg.innerHTML='✅ You hold this ticket!'; }
  } else if (isConfirmedClaimed) {
    if (claimedBdg) { claimedBdg.style.display='inline-flex'; claimedBdg.innerHTML=`🔒 Claimed by <strong style="margin-left:4px">${gt.claimedBy}</strong>`; }
  } else if (isPendingByMe || hasPendingInSettings) {
    if (pendingBdg) { pendingBdg.style.display='inline-flex'; pendingBdg.textContent='⏳ Your request is pending approval…'; }
  } else {
    if (claimBtn) claimBtn.style.display='inline-flex';
  }
}

function claimGoldenTicket() {
  if (!currentUser) return;
  const gt = SETTINGS.goldenTicket;
  if (!gt||gt.claimedBy) return;

  const userData = loadUserData(currentUser);
  if (userData.goldenPending) return; // already requested

  // Mark pending in localStorage
  userData.goldenPending = true;
  saveUserData(currentUser, userData);

  // Set pendingBy in runtime SETTINGS (won't persist, but lets UI update)
  gt.pendingBy = currentUser;

  // Send webhook
  sendWebhook(SETTINGS.webhooks.goldenTicket, {
    username: currentUser,
    date:     gt.bookingDate||'Open',
    type:     '🏆 GOLDEN TICKET REQUEST',
    age:      currentAge,
    label:    gt.label||'Golden Event',
    status:   'PENDING — awaiting admin confirmation',
  });

  buildGoldenTicket();
  updateNavbarPendingBadge();
  launchConfetti();
  showSuccess(
    '⏳ Request Sent!',
    `Your Golden Ticket request has been submitted, ${currentUser}! The admin will review it and confirm your spot. Check back soon — or watch Discord for updates.`
  );
}

/* ============================================================
   CALENDAR SELECTS
   ============================================================ */
function buildCalendarSelects() {
  const yearSel = document.getElementById('cal-year');
  const monSel  = document.getElementById('cal-month');
  if (!yearSel||!monSel) return;
  yearSel.innerHTML=''; monSel.innerHTML='';
  const now=new Date();
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  for(let y=now.getFullYear();y<=now.getFullYear()+2;y++){
    const o=document.createElement('option'); o.value=y; o.textContent=y;
    if(y===calYear) o.selected=true; yearSel.appendChild(o);
  }
  MONTHS.forEach((m,i)=>{
    const o=document.createElement('option'); o.value=i+1; o.textContent=m;
    if(i+1===calMonth) o.selected=true; monSel.appendChild(o);
  });
  yearSel.addEventListener('change',()=>{calYear=+yearSel.value; renderCalendar();});
  monSel.addEventListener('change', ()=>{calMonth=+monSel.value; renderCalendar();});
}

/* ============================================================
   CALENDAR RENDER
   ============================================================ */
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const today   = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate()+SETTINGS.park.bookingWindowDays);
  const firstDow    = new Date(calYear,calMonth-1,1).getDay();
  const daysInMonth = new Date(calYear,calMonth,0).getDate();
  const monthCfg    = ((SETTINGS.bookingDays[calYear]||{})[calMonth])||{};
  const max = SETTINGS.park.maxBookingsPerDay;
  const gt  = SETTINGS.goldenTicket;

  for(let i=0;i<firstDow;i++){const c=document.createElement('div');c.className='cal-day empty';grid.appendChild(c);}

  for(let d=1;d<=daysInMonth;d++){
    const cellDt = new Date(calYear,calMonth-1,d); cellDt.setHours(0,0,0,0);
    const dateKey = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cfg = monthCfg[d];
    const enabled  = !!(cfg&&cfg.enabled===true);
    const bookedBy = enabled?(cfg.bookedBy||[]):[];
    const pendingByArr = enabled?(cfg.pendingBy||[]):[];
    const soldOut  = bookedBy.length>=max;
    const isYours  = !!(currentUser&&bookedBy.some(u=>u.toLowerCase()===currentUser.toLowerCase()));
    const isPending= !!(currentUser&&(
      isDatePendingForUser(currentUser,dateKey) ||
      pendingByArr.some(u=>u.toLowerCase()===currentUser.toLowerCase())
    ));
    const isPast   = cellDt<today;
    const inWindow = cellDt>=today&&cellDt<=maxDate;
    const isGoldenDay = !!(gt&&gt.enabled&&gt.bookingDate===dateKey);

    let cls='cal-day', lbl='', clickable=false;

    if(isPast){
      cls+=' past';
    } else if(!enabled){
      cls+=' not-bookable';
    } else if(!inWindow){
      cls+=' out-of-window';
    } else if(isYours){
      cls+=' confirmed'; lbl='✓ BOOKED';
    } else if(isPending){
      cls+=' pending'; lbl='⏳ PENDING';
    } else if(soldOut){
      cls+=' soldout'; lbl='SOLD OUT';
    } else if(bookedBy.length>0){
      cls+=' partial'; lbl=`${bookedBy.length}/${max}`; clickable=true;
    } else {
      cls+=' available'; lbl='BOOK'; clickable=true;
    }

    if(isGoldenDay) cls+=' golden-day';

    const cell=document.createElement('div');
    cell.className=cls;

    // Tooltip for partial/booked
    if(bookedBy.length>0&&!isYours) cell.title=`${bookedBy.length} of ${max} spots taken`;

    cell.innerHTML=`
      ${isGoldenDay?'<div class="cal-golden-dot" title="Golden Ticket Day">✦</div>':''}
      <span class="day-num">${d}</span>
      ${lbl?`<span class="day-lbl">${lbl}</span>`:''}
    `;

    if(clickable) cell.addEventListener('click',()=>openBookingModal(dateKey,d,[...bookedBy]));
    grid.appendChild(cell);
  }
}

/* ============================================================
   BOOKING MODAL
   ============================================================ */
function openBookingModal(dateKey,dayNum,bookedBy) {
  if (!currentUser) return;
  // Don't re-open if already pending
  if (isDatePendingForUser(currentUser,dateKey)) return;
  selectedDate={dateKey,dayNum,bookedBy};

  const backdrop=document.getElementById('booking-modal');
  const loadEl=document.getElementById('modal-loading');
  const formEl=document.getElementById('modal-form');
  formEl.classList.remove('show');
  loadEl.style.display='flex';
  backdrop.classList.add('open');

  const msgs=['Connecting to reservation system…','Verifying date availability…','Loading your booking details…','Almost ready…'];
  const textEl=document.getElementById('modal-loading-text');
  let mi=0;
  const iv=setInterval(()=>{if(++mi<msgs.length&&textEl)textEl.textContent=msgs[mi];},400);
  setTimeout(()=>{clearInterval(iv);loadEl.style.display='none';formEl.classList.add('show');populateBookingForm(dateKey,dayNum,bookedBy);},1700);
}

function populateBookingForm(dateKey,dayNum,bookedBy) {
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('booking-date-label').textContent=`${dayNum} ${M[calMonth-1]} ${calYear}`;
  document.getElementById('booking-confirm-username').value='';

  const max=SETTINGS.park.maxBookingsPerDay;
  const dotsEl=document.getElementById('booking-spots-dots');
  const lblEl=document.getElementById('booking-spots-label');
  if(dotsEl) dotsEl.innerHTML=Array.from({length:max},(_,i)=>`<div class="spot-dot ${i<bookedBy.length?'taken':'open'}"></div>`).join('');
  if(lblEl){const o=max-bookedBy.length;lblEl.textContent=`${o} open spot${o!==1?'s':''}  ·  ${bookedBy.length} confirmed`;}

  const a=Math.floor(Math.random()*12)+1, b=Math.floor(Math.random()*12)+1;
  captchaAnswer=a+b;
  const qEl=document.getElementById('captcha-question'); if(qEl)qEl.textContent=`${a} + ${b} = ?`;
  const ci=document.getElementById('captcha-input'); if(ci)ci.value='';

  ['confirm-cb-1','confirm-cb-2','confirm-cb-3','confirm-cb-4','confirm-cb-5'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.checked=false;
  });
  const err=document.getElementById('booking-error');if(err)err.style.display='none';
}

function attachModalClose() {
  document.getElementById('btn-cancel-booking')?.addEventListener('click',closeBookingModal);
  document.getElementById('booking-modal')?.addEventListener('click',e=>{if(e.target===document.getElementById('booking-modal'))closeBookingModal();});
}

function closeBookingModal() {
  document.getElementById('booking-modal')?.classList.remove('open');
  selectedDate=null;
}

document.getElementById('booking-form-el').addEventListener('submit',function(e){
  e.preventDefault();
  const uname=document.getElementById('booking-confirm-username').value.trim();
  const cap=parseInt(document.getElementById('captcha-input').value);
  const allChecked=['confirm-cb-1','confirm-cb-2','confirm-cb-3','confirm-cb-4','confirm-cb-5'].every(id=>document.getElementById(id)?.checked);

  if(uname.toLowerCase()!==currentUser.toLowerCase()) return showBookingError('Username does not match your login username.');
  if(cap!==captchaAnswer) return showBookingError('Wrong answer to the math question. Please try again.');
  if(!allChecked) return showBookingError('Please tick all five boxes to confirm the booking rules.');

  submitBookingRequest();
});

function showBookingError(msg) {
  const el=document.getElementById('booking-error');if(!el)return;
  el.textContent=msg;el.style.display='block';
  el.style.animation='none';void el.offsetWidth;el.style.animation='shake .4s ease';
}

function submitBookingRequest() {
  const btn=document.getElementById('btn-book');
  if(btn){btn.disabled=true;btn.textContent='SENDING…';}

  const {dateKey,bookedBy}=selectedDate;

  // Save as PENDING in localStorage
  const userData=loadUserData(currentUser);
  if(!userData.pendingDates.includes(dateKey)){
    userData.pendingDates.push(dateKey);
    saveUserData(currentUser,userData);
  }

  // Also update runtime SETTINGS pendingBy array (not persisted to file)
  const [y,mo,d]=dateKey.split('-').map(Number);
  if(!SETTINGS.bookingDays[y]) SETTINGS.bookingDays[y]={};
  if(!SETTINGS.bookingDays[y][mo]) SETTINGS.bookingDays[y][mo]={};
  if(!SETTINGS.bookingDays[y][mo][d]) SETTINGS.bookingDays[y][mo][d]={enabled:true,bookedBy:[],pendingBy:[]};
  if(!SETTINGS.bookingDays[y][mo][d].pendingBy) SETTINGS.bookingDays[y][mo][d].pendingBy=[];
  if(!SETTINGS.bookingDays[y][mo][d].pendingBy.includes(currentUser))
    SETTINGS.bookingDays[y][mo][d].pendingBy.push(currentUser);

  // Send webhook — status PENDING
  sendWebhook(SETTINGS.webhooks.regularBooking,{
    username:  currentUser,
    date:      dateKey,
    type:      'Regular Ticket',
    age:       currentAge,
    status:    '⏳ PENDING — awaiting admin confirmation',
    spots_left: SETTINGS.park.maxBookingsPerDay-bookedBy.length,
  });

  closeBookingModal();
  renderCalendar();
  updateNavbarPendingBadge();
  showSuccess(
    '⏳ Request Submitted!',
    `Your booking request for ${dateKey} has been sent, ${currentUser}! It is now PENDING. The admin will confirm your spot and add you to the list. Watch Discord for confirmation.`
  );
  launchConfetti(false); // small confetti for pending

  if(btn){btn.disabled=false;btn.textContent='CONFIRM BOOKING';}
}

/* ============================================================
   SUCCESS OVERLAY
   ============================================================ */
function showSuccess(title,sub) {
  document.getElementById('success-title').textContent=title;
  document.getElementById('success-sub').textContent=sub;
  document.getElementById('success-overlay').classList.add('show');
}
document.getElementById('btn-close-success').addEventListener('click',()=>{
  document.getElementById('success-overlay').classList.remove('show');
});

/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti(big=true) {
  const clrs=['#ff6a00','#ff8c38','#ffffff','#ffd700','#00c47a','#ffe566'];
  const count=big?100:45;
  for(let i=0;i<count;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.cssText=`left:${Math.random()*100}vw;background:${clrs[Math.floor(Math.random()*clrs.length)]};width:${Math.random()*9+5}px;height:${Math.random()*9+5}px;border-radius:${Math.random()>.5?'50%':'2px'};--dur:${(Math.random()*2+2).toFixed(2)}s;--delay:${(Math.random()*.8).toFixed(2)}s;--tx:${((Math.random()-.5)*200).toFixed(0)}px`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),4500);
  }
}

/* ============================================================
   WEBHOOK
   ============================================================ */
async function sendWebhook(url,data) {
  if(!url) return;
  const isGolden=String(data.type).includes('GOLDEN');
  const statusStr=data.status||'';
  const isPending=statusStr.includes('PENDING');

  const color = isGolden ? 0xFFD700 : isPending ? 0xFF9900 : 0xFF6A00;
  const title = isGolden
    ? '🏆 Golden Ticket Request!'
    : isPending ? '⏳ New Booking Request (Pending)' : '🎟 New Ticket Confirmed!';

  const embed={
    title,
    description: isGolden
      ? `A Golden Ticket request was submitted at **Heide Park Roblox**!\n\n> Add **${data.username}** to \`goldenTicket.claimedBy\` in settings.js to confirm.`
      : isPending
        ? `A new booking request needs review.\n\n> Add **${data.username}** to \`bookedBy[]\` for date **${data.date}** in settings.js to confirm.`
        : `A ticket has been confirmed.`,
    color,
    fields:[
      {name:'👤 Roblox Username',value:String(data.username),inline:true},
      {name:'📅 Date',           value:String(data.date),    inline:true},
      {name:'🎫 Type',           value:String(data.type),    inline:true},
      {name:'🎂 Age',            value:String(data.age||'?'),inline:true},
      {name:'📊 Status',         value:statusStr||'Confirmed',inline:true},
    ],
    footer:{text:`Heide Park Roblox · ${new Date().toLocaleString()}`},
  };
  if(!isGolden&&data.spots_left!=null) embed.fields.push({name:'🪑 Spots Left',value:String(data.spots_left),inline:true});
  if(isGolden&&data.label) embed.fields.push({name:'✨ Event',value:String(data.label),inline:true});

  try{
    await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Heide Park Roblox',embeds:[embed]})});
  }catch(e){console.warn('Webhook (CORS on GH Pages is expected):', e.message);}
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const obs=new IntersectionObserver(entries=>entries.forEach(en=>{
    if(en.isIntersecting){en.target.classList.add('revealed');obs.unobserve(en.target);}
  }),{threshold:0.07});
  document.querySelectorAll('.section').forEach(el=>obs.observe(el));
}

/* ============================================================
   HERO BUTTONS
   ============================================================ */
function attachHeroButtons() {
  document.getElementById('hero-book-btn')   ?.addEventListener('click',()=>document.getElementById('calendar-section')?.scrollIntoView({behavior:'smooth'}));
  document.getElementById('hero-explore-btn')?.addEventListener('click',()=>document.getElementById('gallery-section')?.scrollIntoView({behavior:'smooth'}));
}
