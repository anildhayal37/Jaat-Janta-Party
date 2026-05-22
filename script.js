// JJP — Jaat Janta Party (Parody) — minor interactivity + real counts

document.getElementById('year').textContent = new Date().getFullYear();

const memberEl = document.getElementById('count-members');
const lassiEl = document.getElementById('count-lassi');
const villageEl = document.getElementById('count-villages');

/* ====== Fetch real signup count from Netlify Function ====== */
let memberBase = 0; // real count; overwritten by /.netlify/functions/count

async function loadRealCount() {
  try {
    const res = await fetch('/.netlify/functions/count', { cache: 'no-store' });
    if (!res.ok) return;
    const json = await res.json();
    if (typeof json.count === 'number') {
      memberBase = json.count;
      if (memberEl) memberEl.textContent = memberBase.toLocaleString('en-IN');

      // Also point the Numbers section "Card-carrying members" tile at real count
      const tile = document.querySelector('.numbers__grid strong[data-target]');
      if (tile) tile.dataset.target = String(memberBase);
    }
  } catch (e) {
    // Silently fall back to 0
  }
}
loadRealCount();

/* ====== Animated counters in the "Numbers" section ====== */
const counters = document.querySelectorAll('.numbers__grid strong[data-target]');
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10) || 0;
  if (target === 0) {
    el.textContent = '0';
    return;
  }
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.floor(target * eased);
    el.textContent = value.toLocaleString('en-IN');
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('en-IN');
  };
  requestAnimationFrame(step);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
counters.forEach((c) => observer.observe(c));

/* ====== Hero ticking counters (cosmetic, non-member numbers only) ====== */
let lassiBase = 82919;
setInterval(() => {
  lassiBase += Math.floor(Math.random() * 7) + 1;
  if (lassiEl) lassiEl.textContent = lassiBase.toLocaleString('en-IN') + ' L';
}, 1700);

let villageBase = 11734;
setInterval(() => {
  if (Math.random() < 0.35) {
    villageBase += 1;
    if (villageEl) villageEl.textContent = villageBase.toLocaleString('en-IN');
  }
}, 5200);

/* ====== Form submission — posts to Netlify Forms ====== */
const form = document.getElementById('join-form');
const successEl = document.getElementById('join-success');
const errorEl = document.getElementById('join-error');

/* ====== Math captcha: regenerated on load + after each attempt ====== */
const captchaAEl = document.getElementById('captcha-a');
const captchaBEl = document.getElementById('captcha-b');
const captchaInputEl = document.getElementById('captcha-input');
let captchaAnswer = 0;
function newCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  if (captchaAEl) captchaAEl.textContent = a;
  if (captchaBEl) captchaBEl.textContent = b;
  if (captchaInputEl) captchaInputEl.value = '';
  captchaAnswer = a + b;
}
newCaptcha();

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successEl.hidden = true;
    errorEl.hidden = true;

    const data = new FormData(form);

    // Spam check 1: honeypot field must be empty
    if (data.get('bot-field')) {
      // Looks like a bot. Pretend success, don't actually submit.
      successEl.hidden = false;
      return;
    }

    // Spam check 2: math captcha
    const captchaGiven = parseInt(data.get('captcha'), 10);
    if (captchaGiven !== captchaAnswer) {
      errorEl.textContent = 'Galat jawab bhai. Captcha bohot easy hai — dobara try kar.';
      errorEl.hidden = false;
      newCaptcha();
      return;
    }

    // Strip the captcha field before submitting — it's not part of the real signup
    data.delete('captcha');
    const body = new URLSearchParams(data).toString();

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Joining…';

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error('Submit failed: ' + res.status);

      const name = (data.get('name') || 'bhai').toString().trim() || 'bhai';

      // Optimistic bump on the live counter; the membership # IS that count
      memberBase += 1;
      if (memberEl) memberEl.textContent = memberBase.toLocaleString('en-IN');

      document.getElementById('join-name').textContent = name;
      document.getElementById('join-id').textContent = memberBase;
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      form.reset();
      newCaptcha();
    } catch (err) {
      errorEl.textContent = "Arre, signup failed. Please try again — Choudhary saab's WiFi may be down.";
      errorEl.hidden = false;
      newCaptcha();
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

/* ====== Easter egg: type "ghee" anywhere to summon the buffalo ====== */
let buf = '';
const codeword = 'ghee';
document.addEventListener('keydown', (e) => {
  if (!/^[a-z]$/i.test(e.key)) return;
  buf = (buf + e.key.toLowerCase()).slice(-codeword.length);
  if (buf === codeword) {
    const buffalo = document.createElement('div');
    buffalo.textContent = '🐃';
    Object.assign(buffalo.style, {
      position: 'fixed',
      left: '-80px',
      bottom: '20px',
      fontSize: '64px',
      zIndex: 9999,
      transition: 'transform 6s linear',
      pointerEvents: 'none',
    });
    document.body.appendChild(buffalo);
    requestAnimationFrame(() => {
      buffalo.style.transform = `translateX(${window.innerWidth + 120}px)`;
    });
    setTimeout(() => buffalo.remove(), 6500);
  }
});
