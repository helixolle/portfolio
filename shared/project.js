// ── SCROLL PROGRESS ───
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('prog').style.width = pct + '%';
});

// ── CONTACT FLASH ───
document.getElementById('contactLink')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.innerWidth <= 700) {
    document.querySelector('.mobile-contact').scrollIntoView({ behavior: 'smooth' });
  } else {
    const b = document.getElementById('cBlock');
    b.classList.remove('flash');
    void b.offsetWidth;
    b.classList.add('flash');
    setTimeout(() => b.classList.remove('flash'), 1000);
  }
});


function updateClock() {
  const el = document.getElementById('footerClock');
  if (!el) return;
  const now = new Date();
  const date = now.toLocaleDateString('sv-SE'); // 2026-04-17
  const time = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `${date} ${time}`;
}
updateClock();
setInterval(updateClock, 1000);




// ── MOBILE NAV ───
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.getElementById('mobileContactLink')?.addEventListener('click', e => {
  e.preventDefault();
  mobileNav.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.querySelector('.mobile-contact').scrollIntoView({ behavior: 'smooth' });
  }, 250);
});
