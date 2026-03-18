// ── SCROLL PROGRESS ───
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('prog').style.width = pct + '%';
});

// ── SMOOTH SCROLL ───
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const headerHeight = document.getElementById('siteHeader').offsetHeight;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
  window.scrollTo({ top, behavior: 'smooth' });
}
document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
  const hash = link.getAttribute('href');
  if (hash === '#projects') link.addEventListener('click', e => { e.preventDefault(); scrollToSection('projects'); });
  if (hash === '#about') link.addEventListener('click', e => { e.preventDefault(); scrollToSection('about'); });
});

// ── NAV ACTIVE ───
function updateNav() {
  const headerHeight = document.getElementById('siteHeader').offsetHeight + 24;
  const aboutTop = document.getElementById('about').offsetTop;
  const cur = window.scrollY >= aboutTop - headerHeight ? 'about' : 'projects';
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
  });
}
window.addEventListener('scroll', updateNav);
updateNav();

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

// ── MOBILE NAV ───
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link tap
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Mobile contact link in overlay
document.getElementById('mobileContactLink')?.addEventListener('click', e => {
  e.preventDefault();
  mobileNav.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.querySelector('.mobile-contact').scrollIntoView({ behavior: 'smooth' });
  }, 250);
});



// ── WORDMARK COLLAPSE ───
const wordmark = document.getElementById('wordmark');
const spaces = wordmark.querySelectorAll('.wm-space');
const sufO = document.getElementById('suf-o');
const sufL = document.getElementById('suf-l');
const sufD = document.getElementById('suf-d');
const charsO = sufO.querySelectorAll('.wm-c');
const charsL = sufL.querySelectorAll('.wm-c');
const charsD = sufD.querySelectorAll('.wm-c');

let widths = {};

function cacheWidths() {
  sufO.style.width = 'auto';
  sufL.style.width = 'auto';
  sufD.style.width = 'auto';
  spaces[0].style.width = '0.28em';
  spaces[1].style.width = '0.28em';
  widths.sufD = sufD.scrollWidth;
  widths.sufL = sufL.scrollWidth;
  widths.sufO = sufO.scrollWidth;
  widths.space = spaces[0].offsetWidth;
}

function collapseLetters(suffix, chars, p) {
  const total = chars.length;
  const naturalW = suffix === sufD ? widths.sufD
    : suffix === sufL ? widths.sufL
      : widths.sufO;

  suffix.style.overflow = 'visible';
  suffix.style.width = naturalW * (1 - p) + 'px';

  chars.forEach((c, i) => {
    const idx = total - 1 - i;
    const threshold = (idx + 1) / total;
    c.style.opacity = p >= threshold ? '0' : '1';
    c.style.transform = 'none';
    c.style.transition = 'none';
  });
}

const wmStartScroll = 80;

function getWmEnd() {
  return document.getElementById('about').offsetTop * 0.3;
}

function updateWordmark() {
  if (window.innerWidth <= 700) return;

  const sy = window.scrollY;
  const wmEnd = getWmEnd();

  const progress = Math.max(0, Math.min(1,
    (sy - wmStartScroll) / (wmEnd - wmStartScroll)
  ));

  const pD = Math.max(0, Math.min(1, progress / 0.33));
  const pL = Math.max(0, Math.min(1, (progress - 0.33) / 0.33));
  const pO = Math.max(0, Math.min(1, (progress - 0.66) / 0.34));

  collapseLetters(sufD, charsD, pD);
  collapseLetters(sufL, charsL, pL);
  collapseLetters(sufO, charsO, pO);

  spaces[0].style.width = widths.space * (1 - pL) + 'px';
  spaces[1].style.width = widths.space * (1 - pD) + 'px';

  wordmark.style.transform = `translateX(-${progress * 43}vw)`;

  const nav = document.querySelector('nav');
  if (progress >= 1) {
    nav.classList.add('scrolled');
    nav.style.justifyContent = 'flex-start';
    nav.style.paddingLeft = '0px';
  } else {
    nav.classList.remove('scrolled');
    nav.style.justifyContent = 'center';
    nav.style.paddingLeft = '';
  }

  document.getElementById('wm-o').style.opacity = '1';
  document.getElementById('wm-l').style.opacity = '1';
  document.getElementById('wm-d').style.opacity = '1';
}

// ── FLIP: old → stacked name ───
const staggerDelay = [0, 0.1, 0.2];
let clones = [];
let aboutHeading;
let flipRafId = null;

const laggedP = [0, 0, 0];
const laggedTilt = [0, 0, 0];
const LAG = 0.03;
const TILT_LAG = 0.5;

function easeSpring(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -8 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function buildFlipClones() {
  clones.forEach(c => c.remove());
  clones = [];
  aboutHeading = document.getElementById('aboutHeading');

  const wmFontSize = parseFloat(getComputedStyle(wordmark).fontSize);
  const ahFontSize = parseFloat(getComputedStyle(aboutHeading).fontSize);

  ;['o', 'l', 'd'].forEach((letter, i) => {
    const clone = document.createElement('div');
    clone.className      = 'flip-clone';
    clone.textContent    = letter;
    clone.dataset.wmSize = wmFontSize;
    clone.dataset.ahSize = ahFontSize;
    clone.style.opacity  = '0';
    document.body.appendChild(clone);
    clones.push(clone);
  });
}

function getRawProgress() {
  const aboutSection = document.getElementById('about');
  const aboutTop     = aboutSection.getBoundingClientRect().top + window.scrollY;
  const sy           = window.scrollY;
  const flipStart    = aboutTop - window.innerHeight;
  const flipEnd      = aboutTop - window.innerHeight * 0.1;
  return Math.max(0, Math.min(1, (sy - flipStart) / (flipEnd - flipStart)));
}

function renderFlip() {
  if (window.innerWidth <= 700 || !clones.length) return;

  const rawProgress = getRawProgress();
  const isActive    = rawProgress > 0 && rawProgress < 1;
  const isDone      = rawProgress >= 1;

  aboutHeading.classList.toggle('flip-active', !isDone);
  aboutHeading.style.opacity = isDone ? '1' : '0';

  const wmEl = document.getElementById('wordmark');
  const sy   = window.scrollY;
  const aboutSection = document.getElementById('about');
  const aboutTop = aboutSection.getBoundingClientRect().top + window.scrollY;
  const flipStart = aboutTop - window.innerHeight;

  wmEl.style.opacity   = sy < flipStart ? '1' : '0';
  wmEl.style.transition = 'opacity 0.3s';

  const srcIds = ['wm-o', 'wm-l', 'wm-d'];
  srcIds.forEach(id => {
    document.getElementById(id).style.opacity = isActive ? '0' : '1';
  });

  let stillMoving = false;

  clones.forEach((clone, i) => {
    const targetP = Math.max(0, Math.min(1,
      (rawProgress - staggerDelay[i]) / (1 - staggerDelay[i])
    ));

    // Chase target with lag
    const pDiff = targetP - laggedP[i];
    laggedP[i] += pDiff * LAG;

    // Tilt: positive while moving forward, zero at rest
    const targetTilt = (1 - laggedP[i]) * (i % 2 === 0 ? -7 : 5);
    laggedTilt[i] += (targetTilt - laggedTilt[i]) * TILT_LAG;

    if (Math.abs(pDiff) > 0.0001) stillMoving = true;

    if (!isActive && Math.abs(pDiff) < 0.0001) {
      clone.style.opacity = '0';
      return;
    }

    const easedP = easeSpring(laggedP[i]);

    const srcEl = document.getElementById(srcIds[i]);
    const tgtEl = document.getElementById(['ah-olle', 'ah-lomberg', 'ah-davegard'][i]);
    const srcR  = srcEl.getBoundingClientRect();
    const tgtR  = tgtEl.getBoundingClientRect();

    const x        = lerp(srcR.left, tgtR.left, easedP);
    const y        = lerp(srcR.top,  tgtR.top,  easedP);
    const fontSize = lerp(parseFloat(clone.dataset.wmSize), parseFloat(clone.dataset.ahSize), easedP);

    clone.textContent    = laggedP[i] > 0.65 ? ['olle','lomberg','davegård'][i] : ['o','l','d'][i];
    clone.style.left     = x + 'px';
    clone.style.top      = y + 'px';
    clone.style.fontSize = fontSize + 'px';
    clone.style.opacity  = rawProgress > 0 ? '1' : '0';
    clone.style.transform = `rotate(${laggedTilt[i]}deg)`;
  });

  // Keep looping if letters are still coasting
  if (stillMoving || isActive) {
    flipRafId = requestAnimationFrame(renderFlip);
  } else {
    flipRafId = null;
  }
}

function kickFlipRaf() {
  if (!flipRafId) {
    flipRafId = requestAnimationFrame(renderFlip);
  }
}


// ── INIT ───
document.fonts.ready.then(() => {
  cacheWidths();
  updateWordmark();
  buildFlipClones();
  kickFlipRaf(); // was updateFlip()
  initFooterWm();
});

window.addEventListener('scroll', () => {
  updateWordmark();
  kickFlipRaf();
});

window.addEventListener('resize', () => {
  cacheWidths();
  buildFlipClones();
  updateWordmark();
  kickFlipRaf();
});
