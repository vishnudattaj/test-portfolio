// ============================================
// Utility
// ============================================
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// Nav scroll state
// ============================================
(function navState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ============================================
// Active nav tracking
// ============================================
(function activeNavTracking() {
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  if (!links.length) return;

  const sections = links
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;
  const intersecting = new Set();

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) intersecting.add(e.target.id);
      else intersecting.delete(e.target.id);
    });
    links.forEach(l => l.classList.remove('is-active'));
    const activeId = sections.find(s => intersecting.has(s.id))?.id;
    const activeLink = links.find(l => l.getAttribute('href') === `#${activeId}`);
    if (activeLink) activeLink.classList.add('is-active');
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
})();

// ============================================
// Scroll reveal
// ============================================
(function scrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

// ============================================
// Stat counters
// ============================================
(function statCounters() {
  if (prefersReduced) return;
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
    targets.push({ el, target, suffix, hasComma, decimals });
  });

  if (!targets.length) return;

  function formatNum(val, hasComma, decimals) {
    const fixed = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
    if (!hasComma) return fixed;
    const [int, dec] = fixed.split('.');
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec ? `${withCommas}.${dec}` : withCommas;
  }

  function animateCount(item) {
    const { el, target, suffix, hasComma, decimals } = item;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(target * eased, hasComma, decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target, hasComma, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = targets.find(t => t.el === entry.target);
      if (item) { animateCount(item); counterObs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });

  targets.forEach(item => counterObs.observe(item.el));
})();

// ============================================
// Hero orb parallax (very subtle)
// ============================================
(function heroParallax() {
  if (prefersReduced) return;
  const hero = document.getElementById('top');
  const orbs = document.querySelectorAll('.orb');
  if (!hero || !orbs.length) return;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    orbs.forEach((orb, i) => {
      const strength = (i + 1) * 14;
      orb.style.transform = `translate(${cx * strength}px, ${cy * strength}px)`;
    });
  });

  hero.addEventListener('pointerleave', () => {
    orbs.forEach(orb => {
      orb.style.transform = '';
    });
  });
})();

// ============================================
// Card tilt on hover (Butter smooth 3D lift)
// ============================================
(function cardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  
  document.querySelectorAll('.card').forEach(card => {
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      // The CSS 0.3s transition will cause this to glide smoothly behind the cursor
      // without snapping on the initial hover.
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale3d(1.01, 1.01, 1.01)`;
    });
    
    card.addEventListener('mouseleave', () => {
      // Clear the inline style so it glides back to the default CSS state seamlessly
      card.style.transform = '';
    });
  });
})();
