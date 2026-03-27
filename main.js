// ── GLOBALS ───
const wordmark = document.getElementById('wordmark');
const spaces = wordmark.querySelectorAll('.wm-space');
const sufO = document.getElementById('suf-o');
const sufL = document.getElementById('suf-l');
const sufD = document.getElementById('suf-d');
const charsO = sufO.querySelectorAll('.wm-c');
const charsL = sufL.querySelectorAll('.wm-c');
const charsD = sufD.querySelectorAll('.wm-c');
const aboutLeft = document.querySelector('.about-left');
const nav = document.querySelector('nav');

let widths = {};
let wmVelocity = 0, wmLastY = window.scrollY, wmRafId = null;
let currentWmX = 0, targetWmX = 0, navTravelPx = 0;
let currentY = 0, targetY = 0, lastScrollY = window.scrollY;
let clones = [], aboutHeading, flipRafId = null;

const laggedP = [0, 0, 0];
const laggedTilt = [0, 0, 0];
const LAG = 0.03, TILT_LAG = 0.5;
const staggerDelay = [0, 0.1, 0.2];
const wmStartScroll = 80;


// ── SCROLL LISTENER ───
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('prog').style.width = pct + '%';

  if (window.innerWidth <= 700) {
    wmVelocity = Math.abs(window.scrollY - wmLastY);
    if (!wmRafId) wmRafId = requestAnimationFrame(decayWmWeight);
  }

  wmLastY = window.scrollY;

  const delta = window.scrollY - lastScrollY;
  targetY += delta * 0.01;
  lastScrollY = window.scrollY;

  updateWordmark();
  kickFlipRaf();
  updateNav();
});


// ── MOBILE FONT WEIGHT DECAY ───
function decayWmWeight() {
  wmVelocity *= 0.88;
  const weight = 700 + Math.min(wmVelocity * 6, 200);
  if (wordmark) wordmark.style.fontVariationSettings = `'wght' ${Math.round(weight)}`;
  if (wmVelocity > 0.5) {
    wmRafId = requestAnimationFrame(decayWmWeight);
  } else {
    if (wordmark) wordmark.style.fontVariationSettings = `'wght' 700`;
    wmRafId = null;
  }
}


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
  setTimeout(() => document.querySelector('.mobile-contact').scrollIntoView({ behavior: 'smooth' }), 250);
});


// ── WORDMARK COLLAPSE ───
function cacheWidths() {
  sufO.style.width = sufL.style.width = sufD.style.width = 'auto';
  spaces[0].style.width = spaces[1].style.width = '0.28em';
  widths.sufD = sufD.scrollWidth;
  widths.sufL = sufL.scrollWidth;
  widths.sufO = sufO.scrollWidth;
  widths.space = spaces[0].offsetWidth;
}

function collapseLetters(suffix, chars, p) {
  const naturalW = suffix === sufD ? widths.sufD : suffix === sufL ? widths.sufL : widths.sufO;
  suffix.style.overflow = 'visible';
  suffix.style.width = naturalW * (1 - p) + 'px';
  chars.forEach((c, i) => {
    const threshold = (chars.length - i) / chars.length;
    c.style.opacity = p >= threshold ? '0' : '1';
    c.style.transform = c.style.transition = 'none';
  });
}

function getWmEnd() {
  return document.getElementById('about').offsetTop * 0.3;
}

function updateWordmark() {
  if (window.innerWidth <= 700) return;
  const progress = Math.max(0, Math.min(1, (window.scrollY - wmStartScroll) / (getWmEnd() - wmStartScroll)));

  collapseLetters(sufD, charsD, Math.min(1, progress / 0.33));
  collapseLetters(sufL, charsL, Math.min(1, Math.max(0, (progress - 0.33) / 0.33)));
  collapseLetters(sufO, charsO, Math.min(1, Math.max(0, (progress - 0.66) / 0.34)));

  spaces[0].style.width = widths.space * (1 - Math.min(1, Math.max(0, (progress - 0.33) / 0.33))) + 'px';
  spaces[1].style.width = widths.space * (1 - Math.min(1, progress / 0.33)) + 'px';

  targetWmX = progress * 43;

  ['wm-o', 'wm-l', 'wm-d'].forEach(id => document.getElementById(id).style.opacity = '1');
}


// ── FLIP: old → stacked name ───
function easeSpring(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -8 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function buildFlipClones() {
  clones.forEach(c => c.remove());
  clones = [];
  aboutHeading = document.getElementById('aboutHeading');
  const wmFontSize = parseFloat(getComputedStyle(wordmark).fontSize);
  const ahFontSize = parseFloat(getComputedStyle(aboutHeading).fontSize);
  ['o', 'l', 'd'].forEach((letter, i) => {
    const clone = document.createElement('div');
    clone.className = 'flip-clone';
    clone.textContent = letter;
    clone.dataset.wmSize = wmFontSize;
    clone.dataset.ahSize = ahFontSize;
    clone.style.opacity = '0';
    document.body.appendChild(clone);
    clones.push(clone);
  });
}

function getRawProgress() {
  const aboutTop = document.getElementById('about').getBoundingClientRect().top + window.scrollY;
  const flipStart = aboutTop - window.innerHeight;
  const flipEnd = aboutTop - window.innerHeight * 0.1;
  return Math.max(0, Math.min(1, (window.scrollY - flipStart) / (flipEnd - flipStart)));
}

function renderFlip() {
  if (window.innerWidth <= 700 || !clones.length) return;

  const rawProgress = getRawProgress();
  const isActive = rawProgress > 0 && rawProgress < 1;
  const isDone = rawProgress >= 1;
  const wmEl = document.getElementById('wordmark');
  const aboutTop = document.getElementById('about').getBoundingClientRect().top + window.scrollY;
  const flipStart = aboutTop - window.innerHeight;
  const srcIds = ['wm-o', 'wm-l', 'wm-d'];
  const tgtIds = ['ah-olle', 'ah-lomberg', 'ah-davegard'];
  const words = ['olle', 'lomberg', 'davegård'];

  aboutHeading.classList.toggle('flip-active', !isDone);
  aboutHeading.style.opacity = isDone ? '1' : '0';
  wmEl.style.opacity = window.scrollY < flipStart ? '1' : '0';
  wmEl.style.transition = 'opacity 0.3s';
  srcIds.forEach(id => document.getElementById(id).style.opacity = isActive ? '0' : '1');

  let stillMoving = false;
  clones.forEach((clone, i) => {
    const targetP = Math.max(0, Math.min(1, (rawProgress - staggerDelay[i]) / (1 - staggerDelay[i])));
    const pDiff = targetP - laggedP[i];
    laggedP[i] += pDiff * LAG;
    laggedTilt[i] += ((1 - laggedP[i]) * (i % 2 === 0 ? -7 : 5) - laggedTilt[i]) * TILT_LAG;
    if (Math.abs(pDiff) > 0.0001) stillMoving = true;
    if (!isActive && Math.abs(pDiff) < 0.0001) { clone.style.opacity = '0'; return; }

    const easedP = easeSpring(laggedP[i]);
    const srcR = document.getElementById(srcIds[i]).getBoundingClientRect();
    const tgtR = document.getElementById(tgtIds[i]).getBoundingClientRect();

    clone.textContent = laggedP[i] > 0.65 ? words[i] : ['o', 'l', 'd'][i];
    clone.style.left = lerp(srcR.left, tgtR.left, easedP) + 'px';
    clone.style.top = lerp(srcR.top, tgtR.top, easedP) + 'px';
    clone.style.fontSize = lerp(parseFloat(clone.dataset.wmSize), parseFloat(clone.dataset.ahSize), easedP) + 'px';
    clone.style.opacity = rawProgress > 0 ? '1' : '0';
    clone.style.transform = `rotate(${laggedTilt[i]}deg)`;
  });

  flipRafId = (stillMoving || isActive) ? requestAnimationFrame(renderFlip) : null;
}

function kickFlipRaf() {
  if (!flipRafId) flipRafId = requestAnimationFrame(renderFlip);
}


// ── ABOUT LEFT PARALLAX ───
function animateLeft() {
  currentY += (targetY - currentY) * 0.001;
  aboutLeft.style.transform = `translateY(${currentY}px)`;
  requestAnimationFrame(animateLeft);
}
animateLeft();


// ── WORDMARK + NAV SLIDE ───
function animateWordmark() {
  currentWmX += (targetWmX - currentWmX) * 0.08;
  wordmark.style.transform = `translateX(-${currentWmX}vw)`;

  const solidEnd = 55 - currentWmX;
  const fadeEnd = 59 - currentWmX;
  document.getElementById('siteHeader').style.setProperty(
    '--header-bg',
    `linear-gradient(to right, #FFF ${solidEnd}vw, transparent ${fadeEnd}vw)`
  );

  const progress = Math.min(1, currentWmX / 43);
  if (currentWmX >= 42) {
    nav.classList.add('scrolled');
    nav.style.transform = '';
  } else {
    nav.classList.remove('scrolled');
    nav.style.transform = currentWmX > 0.5
      ? `translateX(-${progress * navTravelPx}px)`
      : '';
  }

  requestAnimationFrame(animateWordmark);
}
animateWordmark();


// ── INIT ───
document.fonts.ready.then(() => {
  cacheWidths();
  updateWordmark();
  buildFlipClones();
  kickFlipRaf();
  if (typeof initFooterWm === 'function') initFooterWm();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const firstLink = document.querySelector('#desktopNav .nav-link');
      navTravelPx = firstLink.getBoundingClientRect().left - 44;
    });
  });
});

window.addEventListener('resize', () => {
  cacheWidths();
  buildFlipClones();
  updateWordmark();
  kickFlipRaf();
  const firstLink = document.querySelector('#desktopNav .nav-link');
  navTravelPx = firstLink.getBoundingClientRect().left - 44;
});
