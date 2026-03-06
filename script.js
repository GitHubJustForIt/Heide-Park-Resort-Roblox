/* ============================================================
   HEIDE PARK ROBLOX — SCRIPT.JS
   All application logic, calendar, booking, webhooks
   ============================================================ */

// ── State ────────────────────────────────────────────────────
let currentUser = null;
let currentAge  = null;
let selectedDate = null;
let calYear, calMonth;
let captchaAnswer = 0;
let factIndex = 0;
let factTimer = null;

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Fake loading screen
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 1800);

  // Init calendar to current month
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth() + 1;

  buildCalendarSelects();
  renderCalendar();
  initLoginParticles();
  buildNewsTicker();
  buildFunFacts();
  buildAttractions();
  buildVisitorTips();
  buildBookingHints();
  buildGallery();
  buildGoldenTicket();
  initScrollReveal();
});

// ── PARTICLES (login) ─────────────────────────────────────────
function initLoginParticles() {
  const canvas = document.getElementById('login-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.6 + 0.1,
      c: Math.random() > 0.5 ? '#ff6a00' : '#ff8c38',
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── LOGIN ─────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const age      = parseInt(document.getElementById('login-age').value);
  const terms    = document.getElementById('login-terms').checked;
  const errEl    = document.getElementById('login-error');

  errEl.classList.remove('show');

  if (!username || username.length < 3) {
    showLoginError('Please enter a valid Roblox username (min 3 characters).'); return;
  }
  if (!age || age < 5 || age > 99) {
    showLoginError('Please enter a valid age between 5 and 99.'); return;
  }
  if (!terms) {
    showLoginError('You must accept the Terms of Service to continue.'); return;
  }

  currentUser = username;
  currentAge  = age;

  // Animate out login, show site
  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('main-site').classList.add('visible');

  // Update navbar
  document.getElementById('navbar-username').textContent = currentUser;
  document.getElementById('navbar-avatar-letter').textContent = currentUser.charAt(0).toUpperCase();

  // Re-render calendar with user context
  renderCalendar();
  checkGoldenTicketClaim();
});

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.add('show');
}

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('main-site').classList.remove('visible');
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-age').value = '';
  document.getElementById('login-terms').checked = false;
  document.getElementById('login-error').classList.remove('show');
});

// ── NEWS TICKER ───────────────────────────────────────────────
function buildNewsTicker() {
  const inner = document.querySelector('.ticker-inner');
  if (!inner) return;
  const news = SETTINGS.parkNews || [];
  if (!news.length) { document.querySelector('.news-ticker').style.display='none'; return; }

  // Double the content for seamless loop
  let html = '';
  for (let pass = 0; pass < 2; pass++) {
    news.forEach((item, i) => {
      html += `<span class="ticker-item">
        <strong>${item.date}</strong>
        <span class="ticker-sep">—</span>
        ${item.text}
      </span>`;
    });
  }
  inner.innerHTML = html;
}

// ── GALLERY ───────────────────────────────────────────────────
function buildGallery() {
  const zones = [
    { icon: '🎢', name: 'Thunder Zone',   desc: 'Extreme roller coasters' },
    { icon: '🎠', name: 'Fantasy Land',   desc: 'Family-friendly rides' },
    { icon: '🌊', name: 'Aqua World',     desc: 'Water attractions' },
    { icon: '👻', name: 'Haunted Hollow', desc: 'Horror experience' },
    { icon: '🚀', name: 'Space Launch',   desc: 'Sci-fi themed rides' },
    { icon: '🌲', name: 'Wild Forest',    desc: 'Nature adventure zone' },
  ];

  const container = document.getElementById('gallery-grid');
  if (!container) return;
  container.innerHTML = zones.map(z => `
    <div class="gallery-card">
      <div class="gallery-card-bg">
        <div class="gallery-card-icon">${z.icon}</div>
        <div class="gallery-card-label">${z.name}</div>
      </div>
      <div class="gallery-card-overlay"></div>
      <div class="gallery-card-info">
        <h4>${z.name}</h4>
        <p>${z.desc}</p>
      </div>
    </div>
  `).join('');
}

// ── BOOKING HINTS ─────────────────────────────────────────────
function buildBookingHints() {
  const hints = [
    { icon: '🎟', title: 'Limited Spots',      text: `Only ${SETTINGS.park.maxBookingsPerDay} tickets per day. Book early!` },
    { icon: '📅', title: 'Date Specific',       text: 'Your ticket is valid only on the exact date you select.' },
    { icon: '⏱', title: 'Book 2 Weeks Ahead',  text: `Maximum ${SETTINGS.park.bookingWindowDays} days in advance. Plan smart.` },
    { icon: '🚫', title: 'No Refunds',          text: 'All bookings are final. Tickets are non-transferable.' },
    { icon: '✅', title: 'Instant Confirmation', text: 'You receive immediate Discord confirmation after booking.' },
    { icon: '🔑', title: 'Roblox Required',     text: 'A valid Roblox username is required to enter the park.' },
  ];
  const container = document.getElementById('hints-grid');
  if (!container) return;
  container.innerHTML = hints.map(h => `
    <div class="hint-card">
      <div class="hint-icon">${h.icon}</div>
      <div class="hint-title">${h.title}</div>
      <div class="hint-text">${h.text}</div>
    </div>
  `).join('');
}

// ── NEXT ATTRACTIONS ──────────────────────────────────────────
function buildAttractions() {
  const container = document.getElementById('attractions-list');
  if (!container) return;
  const items = SETTINGS.nextAttractions || [];
  container.innerHTML = items.map(a => `
    <div class="attraction-item">
      <div class="attraction-icon">${a.icon}</div>
      <div class="attraction-info">
        <div class="attraction-name">${a.name}</div>
        <div class="attraction-eta">Opening: ${a.eta}</div>
      </div>
      <div class="attraction-badge">COMING SOON</div>
    </div>
  `).join('');
}

// ── FUN FACTS ─────────────────────────────────────────────────
function buildFunFacts() {
  const facts = SETTINGS.funFacts || [];
  const textEl = document.getElementById('fact-text');
  const dotsEl = document.getElementById('facts-dots');
  if (!textEl || !facts.length) return;

  function buildDots() {
    dotsEl.innerHTML = facts.map((_, i) =>
      `<div class="fact-dot ${i===factIndex?'active':''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.fact-dot').forEach(d =>
      d.addEventListener('click', () => { factIndex = +d.dataset.i; showFact(); })
    );
  }

  function showFact() {
    textEl.classList.add('fade');
    setTimeout(() => {
      textEl.textContent = `"${facts[factIndex]}"`;
      textEl.classList.remove('fade');
      buildDots();
    }, 400);
    clearInterval(factTimer);
    factTimer = setInterval(nextFact, 5000);
  }

  function nextFact() {
    factIndex = (factIndex + 1) % facts.length;
    showFact();
  }

  textEl.textContent = `"${facts[0]}"`;
  buildDots();
  factTimer = setInterval(nextFact, 5000);
}

// ── VISITOR TIPS ──────────────────────────────────────────────
function buildTips() {
  const container = document.getElementById('tips-list');
  if (!container) return;
  const tips = SETTINGS.visitorTips || [];
  container.innerHTML = tips.map((t, i) => `
    <div class="tip-item">
      <div class="tip-num">0${i+1}</div>
      <div class="tip-text">${t}</div>
    </div>
  `).join('');
}

// ── CALENDAR ──────────────────────────────────────────────────
function buildCalendarSelects() {
  const yearSel  = document.getElementById('cal-year');
  const monthSel = document.getElementById('cal-month');
  if (!yearSel || !monthSel) return;

  const now = new Date();
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  // Years: current + next
  for (let y = now.getFullYear(); y <= now.getFullYear() + 2; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === calYear) opt.selected = true;
    yearSel.appendChild(opt);
  }
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1; opt.textContent = m;
    if (i + 1 === calMonth) opt.selected = true;
    monthSel.appendChild(opt);
  });

  yearSel.addEventListener('change',  () => { calYear  = +yearSel.value;  renderCalendar(); });
  monthSel.addEventListener('change', () => { calMonth = +monthSel.value; renderCalendar(); });
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const now       = new Date();
  now.setHours(0,0,0,0);
  const maxDate   = new Date(now);
  maxDate.setDate(maxDate.getDate() + SETTINGS.park.bookingWindowDays);

  // First day of month (0=Sun)
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  // Days in month
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();

  const monthConfig = (SETTINGS.bookingDays[calYear] || {})[calMonth] || {};

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day empty';
    grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const cellDate = new Date(calYear, calMonth - 1, d);
    cellDate.setHours(0,0,0,0);

    const dateKey = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayConfig = monthConfig[d];

    const isPast       = cellDate < now;
    const isInWindow   = cellDate >= now && cellDate <= maxDate;
    const isConfigured = dayConfig && dayConfig.enabled;
    const bookedBy     = isConfigured ? (dayConfig.bookedBy || []) : [];
    const isSoldOut    = bookedBy.length >= SETTINGS.park.maxBookingsPerDay;
    const isYours      = currentUser && bookedBy.includes(currentUser);

    cell.innerHTML = `<span class="day-num">${d}</span><span class="day-lbl">${getDayLbl(cellDate, isSoldOut, isYours, isConfigured, isPast, isInWindow)}</span>`;

    if (isPast) {
      cell.classList.add('cal-day', 'past');
    } else if (!isConfigured || !isInWindow) {
      cell.classList.add('cal-day', 'not-bookable');
      if (!isInWindow && !isPast) cell.classList.add('out-of-window');
    } else if (isYours) {
      cell.classList.add('cal-day', 'yours');
    } else if (isSoldOut) {
      cell.classList.add('cal-day', 'soldout');
    } else if (bookedBy.length > 0) {
      cell.classList.add('cal-day', 'booked');
      cell.addEventListener('click', () => openBooking(dateKey, d, bookedBy, dayConfig));
    } else {
      cell.classList.add('cal-day', 'available');
      cell.addEventListener('click', () => openBooking(dateKey, d, bookedBy, dayConfig));
    }

    grid.appendChild(cell);
  }
}

function getDayLbl(date, soldOut, yours, configured, past, inWindow) {
  if (past) return '';
  if (yours) return 'YOURS';
  if (soldOut) return 'FULL';
  if (!configured || !inWindow) return '';
  return 'BOOK';
}

// ── BOOKING MODAL ─────────────────────────────────────────────
function openBooking(dateKey, dayNum, bookedBy, dayConfig) {
  if (!currentUser) return;
  selectedDate = { dateKey, dayNum, bookedBy: [...bookedBy], dayConfig };

  const backdrop = document.getElementById('booking-modal');
  const loadingEl = document.getElementById('modal-loading');
  const formEl    = document.getElementById('modal-form');

  formEl.classList.remove('show');
  loadingEl.style.display = 'flex';
  backdrop.classList.add('open');

  // Animate loading for 1.5s then show form
  const msgs = [
    'Connecting to reservation system…',
    'Checking availability…',
    'Loading booking details…',
    'Almost ready…',
  ];
  const textEl = document.getElementById('modal-loading-text');
  let mi = 0;
  const msgInterval = setInterval(() => {
    mi++;
    if (textEl && msgs[mi]) textEl.textContent = msgs[mi];
  }, 350);

  setTimeout(() => {
    clearInterval(msgInterval);
    loadingEl.style.display = 'none';
    formEl.classList.add('show');
    populateBookingForm(dateKey, dayNum, bookedBy);
  }, 1500);
}

function populateBookingForm(dateKey, dayNum, bookedBy) {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label = `${dayNum} ${monthNames[calMonth-1]} ${calYear}`;

  document.getElementById('booking-date-label').textContent = label;
  document.getElementById('booking-confirm-username').value = '';

  // Spots
  const spotsEl = document.getElementById('booking-spots-dots');
  if (spotsEl) {
    let html = '';
    for (let i = 0; i < SETTINGS.park.maxBookingsPerDay; i++) {
      html += `<div class="spot-dot ${i < bookedBy.length ? 'taken' : 'open'}"></div>`;
    }
    spotsEl.innerHTML = html;
  }
  const spotsLabel = document.getElementById('booking-spots-label');
  if (spotsLabel) {
    const open = SETTINGS.park.maxBookingsPerDay - bookedBy.length;
    spotsLabel.textContent = `${open} spot${open !== 1 ? 's' : ''} remaining`;
  }

  // CAPTCHA
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  captchaAnswer = a + b;
  const captchaQ = document.getElementById('captcha-question');
  if (captchaQ) captchaQ.textContent = `What is ${a} + ${b}?`;
  const captchaInput = document.getElementById('captcha-input');
  if (captchaInput) captchaInput.value = '';
}

document.getElementById('btn-cancel-booking').addEventListener('click', closeBookingModal);
document.getElementById('booking-modal').addEventListener('click', function(e) {
  if (e.target === this) closeBookingModal();
});

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
  selectedDate = null;
}

document.getElementById('booking-form-el').addEventListener('submit', function(e) {
  e.preventDefault();

  const username   = document.getElementById('booking-confirm-username').value.trim();
  const captchaVal = parseInt(document.getElementById('captcha-input').value);
  const cb1        = document.getElementById('confirm-cb-1').checked;
  const cb2        = document.getElementById('confirm-cb-2').checked;
  const cb3        = document.getElementById('confirm-cb-3').checked;
  const cb4        = document.getElementById('confirm-cb-4').checked;
  const cb5        = document.getElementById('confirm-cb-5').checked;
  const errEl      = document.getElementById('booking-error');
  errEl.style.display = 'none';

  if (username.toLowerCase() !== currentUser.toLowerCase()) {
    showBookingError('Username does not match your login. Please try again.'); return;
  }
  if (captchaVal !== captchaAnswer) {
    showBookingError('Incorrect answer. Please solve the math problem correctly.'); return;
  }
  if (!cb1 || !cb2 || !cb3 || !cb4 || !cb5) {
    showBookingError('Please accept all booking rules to continue.'); return;
  }

  submitBooking();
});

function showBookingError(msg) {
  const el = document.getElementById('booking-error');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'shake 0.4s ease';
}

function submitBooking() {
  const btn = document.getElementById('btn-book');
  btn.disabled = true;
  btn.textContent = 'BOOKING…';

  const { dateKey, bookedBy } = selectedDate;
  bookedBy.push(currentUser);

  // Save into SETTINGS (runtime only — can't write to file from browser)
  const [y, mo, d] = dateKey.split('-').map(Number);
  if (!SETTINGS.bookingDays[y]) SETTINGS.bookingDays[y] = {};
  if (!SETTINGS.bookingDays[y][mo]) SETTINGS.bookingDays[y][mo] = {};
  if (!SETTINGS.bookingDays[y][mo][d]) SETTINGS.bookingDays[y][mo][d] = { enabled: true, bookedBy: [] };
  SETTINGS.bookingDays[y][mo][d].bookedBy = bookedBy;

  // Send webhook
  sendWebhook(SETTINGS.webhooks.regularBooking, {
    username: currentUser,
    date: dateKey,
    type: 'Regular Ticket',
    age: currentAge,
    timestamp: new Date().toISOString(),
    spots_left: SETTINGS.park.maxBookingsPerDay - bookedBy.length,
  });

  // Close modal, show success, confetti
  closeBookingModal();
  renderCalendar();
  showSuccess(`🎟 Ticket confirmed for ${dateKey}!`, `Your spot is reserved, ${currentUser}. See you at Heide Park Roblox!`);
  launchConfetti();

  btn.disabled = false;
  btn.textContent = 'CONFIRM BOOKING';
}

// ── SUCCESS OVERLAY ───────────────────────────────────────────
function showSuccess(title, sub) {
  document.getElementById('success-title').textContent = title;
  document.getElementById('success-sub').textContent   = sub;
  document.getElementById('success-overlay').classList.add('show');
}

document.getElementById('btn-close-success').addEventListener('click', () => {
  document.getElementById('success-overlay').classList.remove('show');
});

// ── CONFETTI ──────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#ff6a00','#ff8c38','#ffffff','#ffd700','#00c47a'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 8 + 6}px;
      height: ${Math.random() * 8 + 6}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --dur: ${Math.random() * 2 + 2}s;
      --delay: ${Math.random() * 0.8}s;
      --tx: ${(Math.random() - 0.5) * 200}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ── GOLDEN TICKET ─────────────────────────────────────────────
function buildGoldenTicket() {
  const section = document.getElementById('golden-ticket-section');
  if (!section) return;

  if (!SETTINGS.goldenTicket.enabled) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  const gt = SETTINGS.goldenTicket;
  const isClaimed = gt.claimedBy && gt.claimedBy.trim() !== '';

  // Build sparkles
  const card = document.getElementById('golden-ticket-card');
  for (let i = 0; i < 16; i++) {
    const sp = document.createElement('div');
    sp.className = 'golden-sparkle';
    sp.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${Math.random() * 2 + 1.5}s;
      --delay: ${Math.random() * 2}s;
      --tx: ${(Math.random() - 0.5) * 80}px;
      --ty: ${-(Math.random() * 60 + 20)}px;
      width: ${Math.random() * 5 + 3}px;
      height: ${Math.random() * 5 + 3}px;
    `;
    card.appendChild(sp);
  }

  // Set date badge
  const dateBadge = document.getElementById('gt-date-badge');
  if (dateBadge && gt.bookingDate) {
    dateBadge.innerHTML = `<span>📅</span> Valid for: ${gt.bookingDate} — ${gt.label || 'Golden Event'}`;
    dateBadge.style.display = 'inline-flex';
  } else if (dateBadge) {
    dateBadge.style.display = 'none';
  }

  // Claimed vs claimable
  const claimBtn   = document.getElementById('btn-claim-golden');
  const claimedBdg = document.getElementById('gt-claimed-badge');

  if (isClaimed) {
    if (claimBtn)   claimBtn.style.display   = 'none';
    if (claimedBdg) {
      claimedBdg.style.display = 'inline-flex';
      claimedBdg.innerHTML = `🔒 Claimed by ${gt.claimedBy}`;
    }
  } else {
    if (claimBtn)   claimBtn.style.display   = 'inline-flex';
    if (claimedBdg) claimedBdg.style.display = 'none';
  }
}

function checkGoldenTicketClaim() {
  // Check if current user is the claimed one (for display purposes)
  const gt = SETTINGS.goldenTicket;
  if (gt.claimedBy && currentUser && gt.claimedBy.toLowerCase() === currentUser.toLowerCase()) {
    // Show special indicator in navbar
    const avatar = document.querySelector('.navbar-avatar');
    if (avatar) {
      avatar.style.background = 'linear-gradient(135deg, #ffd700, #ffe566)';
      avatar.style.color = '#111';
      avatar.title = '✨ Golden Ticket Holder';
    }
  }
}

document.getElementById('btn-claim-golden') && document.getElementById('btn-claim-golden').addEventListener('click', claimGoldenTicket);
// Attach after DOM is ready, handle null
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-claim-golden');
  if (btn) btn.addEventListener('click', claimGoldenTicket);
});

function claimGoldenTicket() {
  if (!currentUser) { showLoginError('Please log in first.'); return; }
  const gt = SETTINGS.goldenTicket;
  if (gt.claimedBy) { return; } // already claimed

  // Claim it
  gt.claimedBy = currentUser;

  // Send golden webhook
  sendWebhook(SETTINGS.webhooks.goldenTicket, {
    username: currentUser,
    date: gt.bookingDate || 'Open',
    type: '🏆 GOLDEN TICKET',
    age: currentAge,
    label: gt.label,
    timestamp: new Date().toISOString(),
    message: `🌟 A GOLDEN TICKET HAS BEEN CLAIMED by ${currentUser}!`,
  });

  // Update UI
  buildGoldenTicket();
  checkGoldenTicketClaim();

  // Big celebration
  launchConfetti();
  launchConfetti(); // double!
  showSuccess('🏆 GOLDEN TICKET CLAIMED!', `Congratulations ${currentUser}! You hold the legendary Golden Ticket for ${gt.bookingDate || 'your exclusive event'}. A confirmation has been sent to our Discord server.`);
}

// ── WEBHOOK ───────────────────────────────────────────────────
async function sendWebhook(url, data) {
  if (!url) return;

  const isGolden = data.type && data.type.includes('GOLDEN');

  const embed = {
    title:       isGolden ? '🏆 Golden Ticket Claimed!' : '🎟 New Ticket Booked!',
    description: isGolden
      ? `A legendary golden ticket has been claimed at Heide Park Roblox!`
      : `A new ticket has been reserved for an upcoming event.`,
    color: isGolden ? 0xFFD700 : 0xFF6A00,
    fields: [
      { name: '👤 Roblox Username', value: data.username,  inline: true },
      { name: '📅 Date',            value: data.date,       inline: true },
      { name: '🎫 Ticket Type',     value: data.type,       inline: true },
      { name: '🎂 Age',             value: String(data.age || 'N/A'), inline: true },
    ],
    footer: { text: `Heide Park Roblox Ticket System • ${new Date().toLocaleString()}` },
    thumbnail: { url: isGolden
      ? 'https://emojicdn.elk.sh/🏆'
      : 'https://emojicdn.elk.sh/🎢' },
  };

  if (!isGolden && data.spots_left !== undefined) {
    embed.fields.push({ name: '📊 Spots Left', value: String(data.spots_left), inline: true });
  }
  if (isGolden && data.label) {
    embed.fields.push({ name: '✨ Event', value: data.label, inline: true });
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Heide Park Roblox', embeds: [embed] }),
    });
  } catch (err) {
    console.warn('Webhook failed (CORS expected in browser):', err.message);
  }
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
function initScrollReveal() {
  const sections = document.querySelectorAll('.section');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('revealed');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach(s => obs.observe(s));
}

// ── HERO SCROLL ───────────────────────────────────────────────
document.getElementById('hero-book-btn') && document.getElementById('hero-book-btn').addEventListener('click', () => {
  document.getElementById('calendar-section').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('hero-explore-btn') && document.getElementById('hero-explore-btn').addEventListener('click', () => {
  document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
});
