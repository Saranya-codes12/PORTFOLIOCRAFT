'use strict';

const Theme = (() => {
  const KEY = 'pc-theme';
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.textContent = t === 'dark' ? '☀️' : '🌙';
    });
  }
  function init() { apply(localStorage.getItem(KEY) || 'dark'); }
  function toggle() {
    const next = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next); apply(next);
  }
  return { init, toggle };
})();

const Toast = (() => {
  let container;
  function getContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    }
    return container;
  }
  function show(message, type = 'default', duration = 3500) {
    const c = getContainer();
    const icons = { success: '✓', error: '✕', info: 'ℹ', default: '◆' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.default}</span> <span>${message}</span>`;
    c.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.35s cubic-bezier(0.23,1,0.32,1) forwards';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }
  return { show };
})();

function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', Theme.toggle));
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('open'));
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  }
}

function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.reveal) || 0;
        setTimeout(() => { entry.target.style.animation = `fade-up 0.7s cubic-bezier(0.23,1,0.32,1) both`; entry.target.style.opacity = '1'; }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => { el.style.opacity = '0'; observer.observe(el); });
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

function initPageTransitions() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s cubic-bezier(0.23,1,0.32,1)';
  requestAnimationFrame(() => requestAnimationFrame(() => { document.body.style.opacity = '1'; }));
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.dataset.noTransition) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 350);
    });
  });
}

function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('dash-hamburger');
  const closeBtn = document.getElementById('sidebar-close');
  const open  = () => { sidebar?.classList.add('open'); overlay?.classList.add('show'); };
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('show'); };
  hamburger?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', Theme.toggle));
}

function initTemplateFilter() {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.filter;
      document.querySelectorAll('.template-card[data-category]').forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.style.display = match ? '' : 'none';
        if (match) card.style.animation = 'fade-in 0.3s cubic-bezier(0.23,1,0.32,1) both';
      });
    });
  });
}

async function copyToClipboard(text, msg = 'Copied!') {
  try { await navigator.clipboard.writeText(text); Toast.show(msg, 'success'); }
  catch { Toast.show('Copy failed', 'error'); }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeJSON(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && value !== null) return value;
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() || '').join('');
}

function debounce(fn, ms = 600) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function calcCompletion(d) {
  if (!d) return 0;
  const checks = [!!d.name, !!d.email, !!d.phone, !!d.about, !!d.portfolio_title,
    !!(safeJSON(d.skills).length), !!(safeJSON(d.education).length),
    !!(safeJSON(d.experience).length), !!(safeJSON(d.projects).length), !!d.github || !!d.linkedin];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function portfolioURL(userId) { return `${location.origin}/portfolio.html?uid=${userId}`; }

function setLoading(btn, loading, label = '') {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> ${label || 'Loading…'}`;
    btn.disabled = true; btn.style.opacity = '0.7';
  } else {
    btn.innerHTML = btn.dataset.originalText || label;
    btn.disabled = false; btn.style.opacity = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  initNavbar();
  initScrollReveal();
  initCounters();
  initTemplateFilter();
  initPageTransitions();
  initSidebar();
});