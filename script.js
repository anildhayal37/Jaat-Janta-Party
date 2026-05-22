// JJP — Jaat Janta Party (Parody) — minor interactivity

document.getElementById('year').textContent = new Date().getFullYear();

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

/* ====== Live "members" counter in the hero ticks slowly upward ====== */
let memberBase = 342108;
const memberEl = document.getElementById('count-members');
const lassiEl = document.getElementById('count-lassi');
const villageEl = document.getElementById('count-villages');

setInterval(() => {
  memberBase += Math.floor(Math.random() * 4) + 1;
  if (memberEl) memberEl.textContent = memberBase.toLocaleString('en-IN');
}, 2400);

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

/* ====== Mock signup form ====== */
const form = document.getElementById('join-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || 'bhai').toString().trim();
    const id = Math.floor(100000 + Math.random() * 899999);
    document.getElementById('join-name').textContent = name || 'bhai';
    document.getElementById('join-id').textContent = id;
    const success = document.getElementById('join-success');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.querySelectorAll('input[type="text"], input:not([type]), textarea').forEach((i) => (i.value = ''));
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
