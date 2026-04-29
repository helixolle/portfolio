// ── GLOBALS ───
const psbBar      = document.getElementById('preScrollBar');
const psbWordmark = document.getElementById('psbWordmark');
const psbNav      = document.getElementById('preScrollNav');
const desktopNav  = document.getElementById('desktopNav');
const spaces      = psbWordmark.querySelectorAll('.wm-space');
const sufO        = document.getElementById('suf-o');
const sufL        = document.getElementById('suf-l');
const sufD        = document.getElementById('suf-d');
const charsO      = sufO.querySelectorAll('.wm-c');
const charsL      = sufL.querySelectorAll('.wm-c');
const charsD      = sufD.querySelectorAll('.wm-c');
const aboutLeft   = document.querySelector('.about-left');
const sidebarWm   = document.getElementById('sidebarWordmark');

let widths       = {};
let currentY     = 0, targetY = 0, lastScrollY = window.scrollY;
let clones       = [], aboutHeading, flipRafId = null;
let navClones    = [], navSrcRects = [], navDstRects = [], navRectsReady = false;

const laggedP      = [0, 0, 0];
const laggedTilt   = [0, 0, 0];
const LAG          = 0.03, TILT_LAG = 0.5;
const staggerDelay = [0, 0.1, 0.2];








// ── CONTENT PIN ───
// ── CONSTANTS ───
const BLUR_END      = 150;
const COLLAPSE_LEAD = 650; // how long wordmark collapses before content scrolls
const PHASE_START   = BLUR_END;

function PHASE_END() {
  return document.getElementById('about').offsetTop * 0.18 + 200;
}


function updateContentPin() {
  if (window.innerWidth <= 700) return;
  const main = document.getElementById('colMain');
  const pinReleaseStart = BLUR_END + COLLAPSE_LEAD;
  const pinReleaseEnd   = pinReleaseStart + 150;

  if (window.scrollY <= BLUR_END) {
    // blur phase — counteract scroll fully
    main.style.transform = `translateY(${window.scrollY}px)`;
  } else if (window.scrollY <= pinReleaseStart) {
    // collapse phase — hold at BLUR_END offset, wordmark collapses
    main.style.transform = `translateY(${BLUR_END}px)`;
  } else if (window.scrollY <= pinReleaseEnd) {
    // ease release
    const t = easeInOut((window.scrollY - pinReleaseStart) / 150);
    main.style.transform = `translateY(${BLUR_END * (1 - t)}px)`;
  } else {
    main.style.transform = '';
  }
}







// ── SCROLL LISTENER ───
window.addEventListener('scroll', () => {
  const pct = window.scrollY /
    (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('prog').style.width = pct + '%';

  const delta  = window.scrollY - lastScrollY;
  targetY     += delta * 0.01;
  lastScrollY  = window.scrollY;

  updateHeader();
  updateScrolledState();
  updateNav();
  kickFlipRaf();
  updateBlurReveal();
  updateContentPin()
});


// ── LERP / EASE ───
function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeSpring(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -8 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}


// ── CACHE WIDTHS ───
function cacheWidths() {
  sufO.style.width = sufL.style.width = sufD.style.width = 'auto';
  spaces[0].style.width = spaces[1].style.width = '0.28em';
  widths.sufD  = sufD.scrollWidth;
  widths.sufL  = sufL.scrollWidth;
  widths.sufO  = sufO.scrollWidth;
  widths.space = spaces[0].offsetWidth;
}

function collapseLetters(suffix, chars, p) {
  const naturalW = suffix === sufD ? widths.sufD
                 : suffix === sufL ? widths.sufL
                 : widths.sufO;
  suffix.style.overflow = 'visible';
  suffix.style.width    = naturalW * (1 - p) + 'px';
  chars.forEach((c, i) => {
    const threshold   = (chars.length - i) / chars.length;
    c.style.opacity   = p >= threshold ? '0' : '1';
    c.style.transform = c.style.transition = 'none';
  });
}


// ── SMOOTH SCROLL ───
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = window.innerWidth <= 700 ? 56 : 24;
  const top    = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
  const hash = link.getAttribute('href');
  if (hash === '#projects') link.addEventListener('click', e => { e.preventDefault(); scrollToSection('projects'); });
  if (hash === '#about')    link.addEventListener('click', e => { e.preventDefault(); scrollToSection('about'); });
});


// ── CONTACT FLASH ───
function flashContact() {
  const scrolled = document.body.classList.contains('scrolled');
  const cBlock = document.getElementById('cBlock');
  const cBlockSidebar = document.getElementById('cBlockSidebar');

  ['cBlock', 'cBlockSidebar'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.classList.remove('flash');
    void b.offsetWidth;
    b.classList.add('flash');
    setTimeout(() => b.classList.remove('flash'), 1000);
  });
}

document.getElementById('contactLink')?.addEventListener('click', e => { e.preventDefault(); flashContact(); });
document.getElementById('sidebarContactLink')?.addEventListener('click', e => { e.preventDefault(); flashContact(); });
document.getElementById('mobileContactTrigger')?.addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.mobile-contact').scrollIntoView({ behavior: 'smooth' });
});


// ── CAPTURE NAV RECTS ───
function captureNavRects() {
  const srcLinks = Array.from(psbNav.querySelectorAll('.nav-link'));

  desktopNav.style.position   = 'fixed';
  desktopNav.style.left       = '44px';
  desktopNav.style.top        = '-9999px';
  desktopNav.style.opacity    = '0';
  desktopNav.style.visibility = 'visible';
  const dstLinks = Array.from(desktopNav.querySelectorAll('.nav-link'));

  navSrcRects = srcLinks.map(l => {
    const r = l.getBoundingClientRect();
    return { left: r.left, top: r.top };
  });

  const sidebarSz  = parseFloat(getComputedStyle(sidebarWm).fontSize);
  const destNavTop = 28 + sidebarSz + 20;
  const firstDstTop = dstLinks[0].getBoundingClientRect().top;
  navDstRects = dstLinks.map(l => {
    const r = l.getBoundingClientRect();
    return { left: 44, top: destNavTop + (r.top - firstDstTop) };
  });

  desktopNav.style.position   = '';
  desktopNav.style.left       = '';
  desktopNav.style.top        = '';
  desktopNav.style.opacity    = '';
  desktopNav.style.visibility = '';

  navClones.forEach(c => c.remove());
  navClones = srcLinks.map((link, i) => {
    const clone         = document.createElement('div');
    clone.className     = 'nav-fly-clone';
    clone.textContent   = link.textContent;
    clone.style.left    = navSrcRects[i].left + 'px';
    clone.style.top     = navSrcRects[i].top  + 'px';
    clone.style.opacity = '0';
    clone.style.cursor  = 'pointer';

    clone.addEventListener('click', () => {
      if (link.id === 'contactLink')  flashContact();
      else if (link.getAttribute('href') === '#projects') scrollToSection('projects');
      else if (link.getAttribute('href') === '#about')    scrollToSection('about');
    });

    document.body.appendChild(clone);
    return clone;
  });

  navRectsReady = true;
}


// ── MAIN HEADER UPDATE ───
function updateHeader() {
  if (window.innerWidth <= 700) return;

  const p = Math.max(0, Math.min(1,
    (window.scrollY - PHASE_START) / (PHASE_END() - PHASE_START)
  ));
  const e = easeInOut(p);

  // ── 1. Collapse letters ───
  collapseLetters(sufD, charsD, Math.min(1, p / 0.33));
  collapseLetters(sufL, charsL, Math.min(1, Math.max(0, (p - 0.33) / 0.33)));
  collapseLetters(sufO, charsO, Math.min(1, Math.max(0, (p - 0.66) / 0.34)));
  spaces[0].style.width = widths.space * (1 - Math.min(1, Math.max(0, (p - 0.33) / 0.33))) + 'px';
  spaces[1].style.width = widths.space * (1 - Math.min(1, p / 0.33)) + 'px';
  ['wm-o','wm-l','wm-d'].forEach(id => document.getElementById(id).style.opacity = '1');

  // ── 2. Slide wordmark left + scale down ───
  psbWordmark.style.transform       = 'none';
  psbWordmark.style.transformOrigin = 'top left';
  const wmRect    = psbWordmark.getBoundingClientRect();
  const largeSz   = parseFloat(getComputedStyle(psbWordmark).fontSize);
  const sidebarSz = parseFloat(getComputedStyle(sidebarWm).fontSize);
  const scale     = lerp(1, sidebarSz / largeSz, e);
  const destWmX   = 44;
  const destWmY   = 28;
  psbWordmark.style.transform = p > 0
    ? `translate(${(destWmX - wmRect.left) * e}px, ${(destWmY - wmRect.top) * e}px) scale(${scale})`
    : '';

  // ── 3. Nav clones fly from horizontal → vertical ───
  if (p <= 0 || document.body.classList.contains('scrolled')) {
    psbNav.style.opacity       = '';
    psbNav.style.pointerEvents = '';
    navClones.forEach(c => c.remove());
    navClones     = [];
    navRectsReady = false;
    desktopNav.style.opacity  = '';
    desktopNav.style.position = '';
    desktopNav.style.left     = '';
    desktopNav.style.top      = '';
  } else {
    if (!navRectsReady) captureNavRects();

    psbNav.style.opacity       = '0';
    psbNav.style.pointerEvents = 'none';
    desktopNav.style.opacity   = '0';
    desktopNav.style.position  = 'fixed';
    desktopNav.style.left      = '-9999px';
    desktopNav.style.top       = '-9999px';

    navClones.forEach((clone, i) => {
      const src     = navSrcRects[i];
      const dst     = navDstRects[i];
      const stagger = i * 0.05;
      const linkP   = Math.max(0, Math.min(1, (p - stagger) / (1 - stagger)));
      const linkE   = easeInOut(linkP);

      clone.style.left    = lerp(src.left, dst.left, linkE) + 'px';
      clone.style.top     = lerp(src.top,  dst.top,  linkE) + 'px';
      clone.style.opacity = '1';
    });
  }

  // ── 4. Fade background gradient ───
  psbBar.style.setProperty('--bg-fade', String(1 - e));
}


// ── SCROLLED STATE ───
function updateScrolledState() {
  if (window.innerWidth <= 700) return;

  const shouldBeScrolled = window.scrollY >= PHASE_END();

  if (shouldBeScrolled && !document.body.classList.contains('scrolled')) {

    
    document.body.classList.add('scrolled');

    navClones.forEach(c => c.remove());
    navClones     = [];
    navRectsReady = false;
    psbWordmark.style.transform = '';
    psbNav.style.opacity        = '';
    desktopNav.style.position   = '';
    desktopNav.style.left       = '';
    desktopNav.style.top        = '';
    desktopNav.style.opacity    = '';
    desktopNav.querySelectorAll('.nav-link').forEach(link => {
      link.style.transform = '';
      link.style.opacity   = '';
    });
    sidebarWm.style.opacity = '1';

    desktopNav.querySelectorAll('.nav-link').forEach((link, i) => {
      link.classList.remove('flip-in');
      setTimeout(() => link.classList.add('flip-in'), i * 80);
    });

  } else if (!shouldBeScrolled && document.body.classList.contains('scrolled')) {
    document.body.classList.remove('scrolled');

    navClones.forEach(c => c.remove());
    navClones     = [];
    navRectsReady = false;
    sidebarWm.style.opacity     = '0';
    psbWordmark.style.transform = '';
    psbNav.style.opacity        = '';
    psbNav.style.pointerEvents  = '';
    desktopNav.style.position   = '';
    desktopNav.style.left       = '';
    desktopNav.style.top        = '';
    desktopNav.style.opacity    = '';
    desktopNav.querySelectorAll('.nav-link').forEach(link => {
      link.style.transform = '';
      link.style.opacity   = '';
      link.classList.remove('flip-in');
    });
  }
}


// ── NAV ACTIVE ───
function updateNav() {
  const offset   = 80;
  const aboutTop = document.getElementById('about').offsetTop;
  const cur      = window.scrollY >= aboutTop - offset ? 'about' : 'projects';
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
  });
}
updateNav();


// ── FLIP: sidebar "old" → about heading ───
function buildFlipClones() {
  clones.forEach(c => c.remove());
  clones = [];
  aboutHeading = document.getElementById('aboutHeading');

  const wmFontSize = parseFloat(getComputedStyle(sidebarWm).fontSize);
  const ahFontSize = parseFloat(getComputedStyle(aboutHeading).fontSize);

  ['o', 'l', 'd'].forEach(letter => {
    const clone          = document.createElement('div');
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
  const aboutTop  = document.getElementById('about').getBoundingClientRect().top + window.scrollY;
  const flipStart = aboutTop - window.innerHeight;
  const flipEnd   = aboutTop - window.innerHeight * 0.1;
  return Math.max(0, Math.min(1, (window.scrollY - flipStart) / (flipEnd - flipStart)));
}

function renderFlip() {
  if (window.innerWidth <= 700 || !clones.length) return;

  const rawProgress = getRawProgress();
  const isActive    = rawProgress > 0 && rawProgress < 1;
  const isDone      = rawProgress >= 1;

  const tgtIds = ['ah-olle', 'ah-lomberg', 'ah-davegard'];
  const words  = ['olle', 'lomberg', 'davegård'];

  aboutHeading.classList.toggle('flip-active', !isDone);
  aboutHeading.style.opacity = isDone ? '1' : '0';
  sidebarWm.style.opacity    = (isActive || isDone) ? '0' : '1';

  let stillMoving = false;
  clones.forEach((clone, i) => {
    const targetP = Math.max(0, Math.min(1,
      (rawProgress - staggerDelay[i]) / (1 - staggerDelay[i])
    ));
    const pDiff   = targetP - laggedP[i];
    laggedP[i]   += pDiff * LAG;
    laggedTilt[i] += ((1 - laggedP[i]) * (i % 2 === 0 ? -7 : 5) - laggedTilt[i]) * TILT_LAG;
    if (Math.abs(pDiff) > 0.0001) stillMoving = true;
    if (!isActive && Math.abs(pDiff) < 0.0001) { clone.style.opacity = '0'; return; }

    const easedP = easeSpring(laggedP[i]);
    const srcR   = sidebarWm.getBoundingClientRect();
    const tgtR   = document.getElementById(tgtIds[i]).getBoundingClientRect();

    clone.textContent     = laggedP[i] > 0.65 ? words[i] : ['o', 'l', 'd'][i];
    clone.style.left      = lerp(srcR.left, tgtR.left, easedP) + 'px';
    clone.style.top       = lerp(srcR.top,  tgtR.top,  easedP) + 'px';
    clone.style.fontSize  = lerp(
      parseFloat(clone.dataset.wmSize),
      parseFloat(clone.dataset.ahSize),
      easedP
    ) + 'px';
    clone.style.opacity   = rawProgress > 0 ? '1' : '0';
    clone.style.transform = `rotate(${laggedTilt[i]}deg)`;
  });

  flipRafId = (stillMoving || isActive) ? requestAnimationFrame(renderFlip) : null;
}

function kickFlipRaf() {
  if (!flipRafId) flipRafId = requestAnimationFrame(renderFlip);
}

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





// ── BLUR CROSSFADE ───

function updateBlurReveal() {
  const psbBottom   = document.querySelector('.psb-bottom');
  const projectGrid = document.querySelector('#projects .project-grid');
  const blurEnd     = window.innerWidth <= 700 ? 30 : BLUR_END;
  const p = Math.max(0, Math.min(1, window.scrollY / blurEnd));
  const e = easeInOut(p);

  if (psbBottom) {
    psbBottom.style.filter  = `blur(${e * 10}px)`;
    psbBottom.style.opacity = String(1 - e);
  }

  if (projectGrid) {
    projectGrid.style.filter  = `blur(${(1 - e) * 10}px)`;
    projectGrid.style.opacity = String(0.2 + 0.8 * e);
  }
}









// ── ABOUT LEFT PARALLAX ───
function animateLeft() {
  if (window.innerWidth <= 700) {
    aboutLeft.style.transform = '';
    requestAnimationFrame(animateLeft);
    return;
  }
  currentY += (targetY - currentY) * 0.006;
  aboutLeft.style.transform = `translateY(${currentY}px)`;
  requestAnimationFrame(animateLeft);
}
animateLeft();


// ── INIT ───
document.fonts.ready.then(() => {
  cacheWidths();
  updateHeader();
  updateContentPin()
  updateBlurReveal();
  updateScrolledState();
  buildFlipClones();
  kickFlipRaf();
  if (typeof initFooterWm === 'function') initFooterWm();
});

window.addEventListener('resize', () => {
  cacheWidths();
  buildFlipClones();
  updateHeader();
  updateContentPin()
  updateBlurReveal();
  updateScrolledState();
  kickFlipRaf();
});