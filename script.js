// ============================================
// Terminal boot sequence in hero
// ============================================
const termBody = document.getElementById('termBody');

const termLines = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'vishnu_datta_jayanti' },
  { type: 'cmd', text: './fetch_profile.sh' },
  { type: 'out', text: 'CS @ Purdue, Honors College' },
  { type: 'cmd', text: 'cat focus.txt' },
  { type: 'out', text: 'ML research · applied ML · quant backtesting' },
  { type: 'cmd', text: 'sys.status()' },
  { type: 'out-green', text: '[ OK ] available for research / internships' },
];

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildStaticTerminal() {
  termBody.innerHTML = termLines.map(line => {
    if (line.type === 'cmd') {
      return `<div><span class="prompt">ROOT@SYS:~$</span> <span class="out">${line.text}</span></div>`;
    } else if (line.type === 'out-green') {
      return `<div style="color:var(--neon-green); text-shadow: 0 0 5px var(--green-glow)">${line.text}</div>`;
    } else {
      return `<div class="dim">${line.text}</div>`;
    }
  }).join('');
}

async function simulateCompilation(element, duration) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
  const start = Date.now();
  element.className = 'compile';
  while (Date.now() - start < duration) {
    element.textContent = Array.from({length: 15}).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    await sleep(30);
  }
  element.textContent = '';
  element.className = 'out';
}

async function typeTerminal() {
  if (prefersReduced) { buildStaticTerminal(); return; }

  for (const line of termLines) {
    const row = document.createElement('div');
    termBody.appendChild(row);

    if (line.type === 'cmd') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = 'ROOT@SYS:~$';
      row.appendChild(promptSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'out';
      row.appendChild(textSpan);

      for (const ch of line.text) {
        textSpan.textContent += ch;
        await sleep(35);
      }
      await sleep(200);
    } else {
      row.className = line.type === 'out-green' ? '' : 'dim';
      if (line.type === 'out-green') {
        row.style.color = 'var(--neon-green)';
        row.style.textShadow = '0 0 5px var(--green-glow)';
      }
      
      // Simulate data stream parsing
      const compileSpan = document.createElement('span');
      row.appendChild(compileSpan);
      await simulateCompilation(compileSpan, 1000);
      
      compileSpan.textContent = line.text;
      await sleep(300);
    }
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

typeTerminal();

// ============================================
// Scroll reveal with staging
// ============================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============================================
// Nav background state on scroll
// ============================================
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 40) {
    nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.8), 0 1px 0 var(--glass-border)';
    nav.style.background = 'rgba(3, 6, 10, 0.95)';
  } else {
    nav.style.boxShadow = 'none';
    nav.style.background = 'rgba(3, 6, 10, 0.85)';
  }
}, { passive: true });

// ============================================
// Mouse-reactive spotlight on hero grid
// ============================================
(function heroSpotlight() {
  const hero = document.getElementById('top');
  const spotlight = document.getElementById('gridSpotlight');
  if (!hero || !spotlight || prefersReduced) return;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--mx', `${x}%`);
    spotlight.style.setProperty('--my', `${y}%`);
  });
})();

// ============================================
// Active nav-link tracking on scroll
// ============================================
(function activeNavTracking() {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;
  const intersecting = new Set();

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        intersecting.add(entry.target.id);
      } else {
        intersecting.delete(entry.target.id);
      }
    });

    navLinks.forEach(l => l.classList.remove('is-active'));

    if (intersecting.size > 0) {
      const activeId = sections.find(sec => intersecting.has(sec.id))?.id;
      const link = navLinks.find(l => l.getAttribute('href') === `#${activeId}`);
      if (link) link.classList.add('is-active');
    }
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));
})();

// ============================================
// Animated stat counters
// ============================================
(function statCounters() {
  const statVals = document.querySelectorAll('.stat-val');
  if (!statVals.length) return;

  const numericPattern = /^([\d,]+(?:\.\d+)?)(.*)$/;
  const targets = [];
  
  statVals.forEach(el => {
    const raw = el.textContent.trim();
    if (/^\d{4}\s?[-–]\s?\d{4}$/.test(raw)) return;

    const match = raw.match(numericPattern);
    if (!match) return;

    const numStr = match[1];
    const suffix = match[2]; 
    const hasComma = numStr.includes(',');
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;

    targets.push({ el, target, suffix, hasComma, decimals, raw });
  });

  if (!targets.length || prefersReduced) return;

  function formatNumber(value, hasComma, decimals) {
    const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    if (!hasComma) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  function animateCount(item) {
    const { el, target, suffix, hasComma, decimals } = item;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = formatNumber(current, hasComma, decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target, hasComma, decimals) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = targets.find(t => t.el === entry.target);
      if (item) {
        animateCount(item);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  targets.forEach(item => counterObserver.observe(item.el));
})();
