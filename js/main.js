'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const menu = $('#mobile-menu'), toggle = $('#menu-toggle'), header = $('header');
  function closeMenu(focus = false) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'メニューを開く'); if (focus) toggle.focus(); }
  toggle.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く'); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', (event) => { if (!header.contains(event.target)) closeMenu(); });
  header.addEventListener('focusout', () => { setTimeout(() => { if (!header.contains(document.activeElement)) closeMenu(); }, 0); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  const desktop = matchMedia('(min-width:768px)'); desktop.addEventListener('change', () => closeMenu());
  const updateHeader = () => header.classList.toggle('scrolled', scrollY > 20); addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
  // Keep normal section spacing; compensate only native anchor destinations.
  const anchorTargets = ['brand', 'product', 'ingredients', 'voice', 'apply', 'usage']
    .map(id => document.getElementById(id));
  function layoutTop(element) {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  }
  function updateAnchorOffsets() {
    // The expanded mobile menu is temporary and must not enter the offset.
    const fixedHeight = header.firstElementChild.offsetHeight + header.querySelector('.demo-banner').offsetHeight;
    anchorTargets.forEach(target => {
      const label = target.querySelector('.font-label');
      const inset = label ? layoutTop(label) - layoutTop(target) : 0;
      target.style.setProperty('--anchor-offset', `${fixedHeight + 24 - inset}px`);
    });
  }
  updateAnchorOffsets();
  addEventListener('resize', updateAnchorOffsets);
  new ResizeObserver(updateAnchorOffsets).observe(header.querySelector('.demo-banner'));
  // Correct the browser's early hash jump after images/fonts have settled.
  const pageLoaded = document.readyState === 'complete' ? Promise.resolve()
    : new Promise(resolve => addEventListener('load', resolve, { once: true }));
  Promise.all([pageLoaded, document.fonts.ready]).then(() => {
    updateAnchorOffsets();
    const target = anchorTargets.find(element => `#${element.id}` === location.hash);
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  const sizes = { '30mL': {price:'¥18,000', unit:'¥600', duration:'約1.5か月分'}, '50mL': {price:'¥27,000', unit:'¥540', duration:'約2.5か月分'} };
  function setSize(size) {
    const data = sizes[size];
    document.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === size)));
    if (!data) { $('#product-price').textContent = '容量をご相談'; $('#unit-price').textContent = 'デモ表示'; $('#product-duration').textContent = '未選択'; return; }
    $('#apply-size').value = size; $('#product-price').textContent = data.price; $('#unit-price').textContent = '1mLあたり ' + data.unit; $('#product-duration').textContent = data.duration;
  }
  document.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => setSize(b.dataset.size)));
  $('#apply-size').addEventListener('change', e => setSize(e.target.value));
  $('#ingredients-toggle').addEventListener('click', () => { const b = $('#ingredients-toggle'), panel = $('#full-ingredients'), open = panel.hidden; panel.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.firstChild.textContent = open ? '全成分表示を閉じる' : '全成分を見る'; });
  const form = $('#lumera-serum-apply');
  $('#apply-message').addEventListener('input', e => { $('#message-count').textContent = `${e.target.value.length} / 500`; });
  form.addEventListener('submit', e => { e.preventDefault(); if (!form.reportValidity()) return; $('#form-result').textContent = `デモの入力確認が完了しました（${$('#apply-size').value}）。実際の注文・送信は行われていません。入力内容は外部に保存されません。`; $('#form-result').focus(); });
  form.querySelector('[type="submit"]').disabled = false;
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
})();
