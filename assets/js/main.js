/* HoneyRaj Recipe Challenge — interactions */
(function () {
  'use strict';

  var HASHTAG = '#RecipewithHoneyRaj';
  var EMAIL = 'brand10@ghorerbazar.com';
  var DEADLINE = new Date('2026-11-30T23:59:59+06:00').getTime();

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Toast + copy ---------- */
  function showToast(message) {
    var box = document.getElementById('toastContainer');
    if (!box) return;
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<svg class="icon"><use href="#i-check"/></svg><span></span>';
    toast.lastChild.textContent = message;
    box.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 320);
    }, 2400);
  }

  function fallbackCopy(text, label) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.fontSize = '16px'; // prevents iOS zoom
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    try {
      document.execCommand('copy');
      showToast(label + ' কপি করা হয়েছে!');
    } catch (err) {
      showToast('কপি করা সম্ভব হয়নি');
    }
    document.body.removeChild(ta);
  }

  function copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(label + ' কপি করা হয়েছে!');
      }).catch(function () { fallbackCopy(text, label); });
    } else {
      fallbackCopy(text, label);
    }
  }

  ['topCopyHashtagBtn', 'heroCopyHashtagBtn', 'footerCopyHashtagBtn'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function () { copyText(HASHTAG, HASHTAG + ' হ্যাশট্যাগ'); });
  });
  var copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) copyEmailBtn.addEventListener('click', function () { copyText(EMAIL, 'ইমেইল (' + EMAIL + ')'); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
    menuBtn.innerHTML = '<svg class="icon"><use href="' + (open ? '#i-x' : '#i-menu') + '"/></svg>';
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () { setMenu(mobileMenu.hidden); });
    $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) {
      if (!mobileMenu.hidden && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setMenu(false); });
  }

  /* ---------- Header shadow + sticky mobile CTA ---------- */
  var header = document.getElementById('siteHeader');
  var stickyCta = document.getElementById('stickyCta');
  var closingCta = document.getElementById('closingCta');
  var heroCta = $('.hero__cta');
  var closingVisible = false;

  function updateSticky() {
    if (!stickyCta) return;
    var passedHeroCta = heroCta ? heroCta.getBoundingClientRect().bottom < 0 : window.pageYOffset > 500;
    stickyCta.classList.toggle('is-on', passedHeroCta && !closingVisible);
  }
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 8);
    updateSticky();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateSticky);
  onScroll();

  if ('IntersectionObserver' in window && closingCta) {
    new IntersectionObserver(function (entries) {
      closingVisible = entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0.15 }).observe(closingCta);
  }

  /* ---------- Scroll-spy ---------- */
  var navLinks = $$('.nav a');
  var spyTargets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Countdown ---------- */
  var cd = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMinutes'),
    s: document.getElementById('cdSeconds'),
    badge: document.getElementById('campaignStatusBadge')
  };
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    if (!cd.d || !cd.h || !cd.m || !cd.s) return;
    var diff = DEADLINE - Date.now();
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = '00';
      if (cd.badge) { cd.badge.textContent = 'ক্যাম্পেইন শেষ'; cd.badge.classList.add('is-ended'); }
      return;
    }
    cd.d.textContent = pad(Math.floor(diff / 86400000));
    cd.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    cd.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
    cd.s.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Weekly prize filter ---------- */
  var weekBtns = $$('.week-filter-btn');
  var weekCards = $$('[data-week-card]');
  weekBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var selected = btn.getAttribute('data-week');
      weekBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      weekCards.forEach(function (card) {
        var show = selected === 'all' || card.getAttribute('data-week-card') === selected;
        card.hidden = !show;
        if (show) card.classList.add('is-visible');
      });
      // keep the active tab in view on small screens
      if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  });

  /* ---------- Rules accordion (below 1000px only) ---------- */
  var ruleMq = window.matchMedia('(max-width: 999px)');
  $$('.rule').forEach(function (rule) {
    var btn = $('.rule__head', rule);
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!ruleMq.matches) return;
      var open = !rule.classList.contains('is-open');
      rule.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- FAQ accordion + search ---------- */
  var faqItems = $$('.faq-item');
  function setFaq(item, open) {
    item.classList.toggle('is-open', open);
    var btn = $('.faq-toggle', item);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  faqItems.forEach(function (item) {
    var btn = $('.faq-toggle', item);
    if (btn) btn.addEventListener('click', function () { setFaq(item, !item.classList.contains('is-open')); });
  });

  var toggleAll = document.getElementById('toggleAllFaqBtn');
  var allExpanded = false;
  if (toggleAll) {
    toggleAll.addEventListener('click', function () {
      allExpanded = !allExpanded;
      faqItems.forEach(function (item) { setFaq(item, allExpanded); });
      toggleAll.textContent = allExpanded ? 'সবগুলো উত্তর বন্ধ করুন' : 'সবগুলো উত্তর খুলুন';
    });
  }

  var faqSearch = document.getElementById('faqSearchInput');
  var faqEmpty = document.getElementById('faqEmpty');
  if (faqSearch) {
    faqSearch.addEventListener('input', function () {
      var q = faqSearch.value.trim().toLowerCase();
      var visible = 0;
      faqItems.forEach(function (item) {
        var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        item.hidden = !match;
        if (match) {
          visible++;
          if (q) setFaq(item, true);
        }
      });
      if (faqEmpty) faqEmpty.hidden = visible !== 0;
    });
  }

  /* ---------- Terms: show more (mobile only) ---------- */
  var termsList = document.getElementById('termsList');
  var termsMore = document.getElementById('termsMoreBtn');
  if (termsList && termsMore) {
    termsMore.addEventListener('click', function () {
      var collapsed = termsList.classList.toggle('is-collapsed');
      termsMore.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      termsMore.querySelector('span').textContent = collapsed ? 'সব শর্তাবলি দেখুন (১৪টি)' : 'কম দেখুন';
      termsMore.querySelector('.icon').style.transform = collapsed ? '' : 'rotate(180deg)';
      if (collapsed) termsList.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
})();
