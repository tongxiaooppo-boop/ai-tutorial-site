const toggle = document.querySelector('.topbar button');
const scrim = document.querySelector('.scrim');
const schedule = document.querySelector('#schedule');
function setDrawer(open) {
  document.body.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '關閉課表' : '打開課表');
  scrim.hidden = !open;
  if (open) (schedule.querySelector('[aria-current]') || schedule.querySelector('a')).focus();
}
toggle.addEventListener('click', () => setDrawer(!document.body.classList.contains('open')));
scrim.addEventListener('click', () => { setDrawer(false); toggle.focus(); });
schedule.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('open')) return;
  if (event.key === 'Escape') { setDrawer(false); toggle.focus(); }
  if (event.key === 'Tab') {
    const links = [...schedule.querySelectorAll('a')];
    const first = links[0], last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
matchMedia('(min-width:768px)').addEventListener('change', event => { if (event.matches) setDrawer(false); });
document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
  const pre = button.parentElement.querySelector('pre');
  try {
    await navigator.clipboard.writeText(pre.textContent);
    button.textContent = '已複製';
    clearTimeout(button.copyTimer);
    button.copyTimer = setTimeout(() => { button.textContent = '複製'; }, 1200);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}));
const tocLinks = [...document.querySelectorAll('.toc a')];
const targets = tocLinks.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
function markSection() {
  const visible = targets.filter(target => target.getClientRects().length);
  const active = visible.filter(target => target.getBoundingClientRect().top <= innerHeight * .3).at(-1) || visible[0];
  tocLinks.forEach(a => {
    const on = active && a.hash === `#${active.id}`;
    a.classList.toggle('on', !!on);
    if (on) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(markSection, { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] });
  targets.forEach(target => observer.observe(target));
}
document.querySelectorAll('.toc a').forEach(a => a.addEventListener('click', () => {
  const target = document.getElementById(a.hash.slice(1));
  for (let parent = target?.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
}));
markSection();
