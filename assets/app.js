// ============================================================
//  Premium UI components + user session / activity tracking
// ============================================================
import { esc, qs, toBn, cleanHtml, textToHtml, autoDir, plainText } from './islamic.js';
import { db, doc, getDoc, setDoc } from './firebase.js';
export { esc, qs, toBn, cleanHtml, textToHtml, autoDir, plainText };

/* ---------------- icons (inline svg, no CDN) ---------------- */
const S = (p, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
export const ICON = {
  home: S('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
  search: S('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),
  user: S('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.7-3.8 3.7-5.8 7.5-5.8s6.8 2 7.5 5.8"/>'),
  back: S('<path d="m14.5 5-7 7 7 7"/>'),
  next: S('<path d="m9.5 5 7 7-7 7"/>'),
  check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  out: S('<path d="M9 4.5H5.5v15H9"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9.5"/>'),
  eye: S('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
  flame: S('<path d="M12 3c.5 3.2 4.5 5 4.5 9.5a4.5 4.5 0 0 1-9 0c0-1.8.8-3 1.8-4 .2 1.2.9 1.8 1.7 2C11 8.5 11 5.5 12 3Z"/>'),
  book: S('<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5Z"/><path d="M12 6v13"/>'),
  clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  cal: S('<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  edit: S('<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z"/>'),
  shield: S('<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  eyeoff: S('<path d="M3 3l18 18"/><path d="M10.6 6A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.5 7.5A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.6-.3 3.7-.8"/>'),
  mail: S('<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 8 7.5 5.5L19.5 8"/>'),
  lock: S('<rect x="5" y="10.5" width="14" height="9.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  minus: S('<path d="M5 12h14"/>'),
};
// 8-point star (two squares) — gold line ornament
const OCTA = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="19" y="19" width="62" height="62" rx="3"/><rect x="19" y="19" width="62" height="62" rx="3" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="9"/></svg>`;
const DIA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/></svg>`;
export { OCTA, DIA };

/* ---------------- Islamic backgrounds: green / gold / white only ---------------- */
const rnd = (() => { let x = 13; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();
const pts = (n, ro, ri, c = 100) => Array.from({ length: n * 2 }, (_, i) => { const r = i % 2 ? ri : ro, a = Math.PI * i / n - Math.PI / 2; return (c + r * Math.cos(a)).toFixed(1) + ',' + (c + r * Math.sin(a)).toFixed(1); }).join(' ');
let uid = 0;
const G = '#0F5A46', GD = '#0A3A2C', GOLD = '#E2AF5E', GOLDL = '#F6E4B0', WHITE = '#FFFFFF';

// seamless geometric tile: interlaced 8-point star + corner flowers + leaves
const tile = (line, f1, f2, leaf) => {
  const flower = (x, y) => `<g fill="${f1}"><circle cx="${x - 9}" cy="${y}" r="7"/><circle cx="${x + 9}" cy="${y}" r="7"/><circle cx="${x}" cy="${y - 9}" r="7"/><circle cx="${x}" cy="${y + 9}" r="7"/></g><circle cx="${x}" cy="${y}" r="4.5" fill="${f2}"/>`;
  const lf = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="10" transform="rotate(${r} ${x} ${y})" fill="${leaf}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="none"><g stroke="${line}" stroke-width="3" stroke-linejoin="round"><polygon points="${pts(8, 62, 38, 80)}"/><polygon points="${pts(8, 44, 27, 80)}" stroke-width="2"/><circle cx="80" cy="80" r="9"/><path d="M0 80H18M142 80H160M80 0V18M80 142V160"/></g>${flower(0, 0)}${flower(160, 0)}${flower(0, 160)}${flower(160, 160)}${lf(36, 36, 45)}${lf(124, 36, -45)}${lf(36, 124, -45)}${lf(124, 124, 45)}</svg>`;
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
};
const PETAL = 'M0 0C-22 -30 -22 -66 0 -92C22 -66 22 -30 0 0Z';
const MANDALA = (() => {
  let p = ''; for (let i = 0; i < 12; i++) p += `<path d="${PETAL}" transform="translate(200 200) rotate(${i * 30}) translate(0 -58)"/>`;
  let q = ''; for (let i = 0; i < 12; i++) q += `<path d="M0 0C-12 -18 -12 -38 0 -52C12 -38 12 -18 0 0Z" transform="translate(200 200) rotate(${i * 30 + 15}) translate(0 -148)"/>`;
  let c = ''; for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; c += `<circle cx="${(200 + 190 * Math.cos(a)).toFixed(1)}" cy="${(200 + 190 * Math.sin(a)).toFixed(1)}" r="5"/>`; }
  return `<svg viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="2">${p}${q}${c}<circle cx="200" cy="200" r="46"/><circle cx="200" cy="200" r="20"/><polygon points="${pts(12, 196, 170, 200)}"/></svg>`;
})();
const ROSETTE = (() => {
  let petals = ''; for (let i = 0; i < 12; i++) petals += `<ellipse cx="100" cy="58" rx="9" ry="34" transform="rotate(${i * 30} 100 100)"/>`;
  return `<svg viewBox="0 0 200 200"><polygon points="${pts(16, 99, 72)}" fill="${GOLD}"/><polygon points="${pts(16, 92, 66)}" fill="${G}"/><polygon points="${pts(8, 76, 44)}" fill="${GOLD}"/><polygon points="${pts(8, 70, 40)}" fill="#146B50"/><g fill="none" stroke="${GOLDL}" stroke-width="2.4">${petals}</g><polygon points="${pts(12, 40, 22)}" fill="${GOLD}"/><circle cx="100" cy="100" r="9" fill="${WHITE}"/></svg>`;
})();
const STAR8 = `<svg viewBox="0 0 200 200" fill="currentColor"><polygon points="${pts(8, 98, 52)}"/></svg>`;
const MOON = () => { const m = 'mn' + (uid++); return `<svg viewBox="0 0 100 100"><defs><mask id="${m}"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="40" r="36" fill="#000"/></mask></defs><circle cx="46" cy="52" r="40" fill="currentColor" mask="url(#${m})"/></svg>`; };
const LANT = `<svg viewBox="0 0 60 112"><circle cx="30" cy="5" r="4" fill="none" stroke="${GOLD}" stroke-width="2"/><path d="M20 20 L40 20 L35 10 L25 10Z" fill="#B98A2D"/><path d="M14 22H46L50 58L42 92H18L10 58Z" fill="${GOLD}"/><path d="M22 30H38L41 58L36 82H24L19 58Z" fill="#FFF3C4" class="glow"/><path d="M18 92H42L38 100H22Z" fill="#B98A2D"/><line x1="30" y1="100" x2="30" y2="108" stroke="${GOLD}" stroke-width="2"/><circle cx="30" cy="110" r="2.5" fill="${GOLD}"/></svg>`;
const ARCHWIN = `<svg viewBox="0 0 120 170" fill="none"><path d="M8 166V70C8 40 44 34 60 6C76 34 112 40 112 70V166" stroke="${GOLD}" stroke-width="5"/><path d="M20 166V74C20 50 48 44 60 24C72 44 100 50 100 74V166" stroke="${GOLD}" stroke-width="2" stroke-dasharray="6 5"/><polygon points="${pts(8, 22, 12, 0).replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, x, y) => (+x + 60).toFixed(1) + ',' + (+y + 96).toFixed(1))}" fill="${GOLD}"/></svg>`;
const DOMEI = `<svg viewBox="0 0 120 130"><path d="M14 126C14 92 34 78 48 64C56 56 58 44 60 30C62 44 64 56 72 64C86 78 106 92 106 126Z" fill="${GOLDL}"/><rect x="58" y="12" width="4" height="20" fill="${GOLD}"/><circle cx="60" cy="9" r="6" fill="${GOLD}"/><rect x="8" y="122" width="104" height="6" rx="3" fill="${GOLD}"/></svg>`;
const MOONSTARS = () => `<div style="position:relative;width:100%;padding-bottom:78%"><span style="position:absolute;left:0;top:0;width:62%;color:${GOLD}">${MOON()}</span><span style="position:absolute;right:6%;top:6%;width:22%;color:${WHITE}">${STAR8}</span><span style="position:absolute;right:30%;bottom:6%;width:14%;color:${GOLDL}">${STAR8}</span></div>`;
const STARS3 = `<div style="position:relative;width:100%;padding-bottom:80%"><span style="position:absolute;left:0;top:10%;width:56%;color:${GOLD}">${STAR8}</span><span style="position:absolute;right:0;top:0;width:30%;color:${WHITE}">${STAR8}</span><span style="position:absolute;right:12%;bottom:0;width:22%;color:${GOLDL}">${STAR8}</span></div>`;

const sparks = (n, a = 3, b = 97) => Array.from({ length: n }, () => { const z = 6 + rnd() * 10; return `<i class="p-star" style="left:${(rnd() * 100).toFixed(1)}%;top:${(a + rnd() * (b - a)).toFixed(1)}%;width:${z.toFixed(0)}px;height:${z.toFixed(0)}px;animation-delay:${(rnd() * 3).toFixed(1)}s;animation-duration:${(2 + rnd() * 3).toFixed(1)}s"></i>`; }).join('');
const hang = (x, y, rope, kind, w, delay = 0) => {
  const item = kind === 'lantern' ? LANT : `<span class="pd" style="color:${GOLD}">${kind === 'star' ? STAR8 : MOON()}</span>`;
  return `<div class="p-hang" style="left:${(x / 3).toFixed(2)}%;top:${(y / 4).toFixed(2)}%;animation-delay:-${delay}s"><i class="rope" style="height:${rope}px"></i><div class="it" style="width:${w}px">${item}</div></div>`;
};
const ARCH_OUT = 'M12 396V160C12 105 80 90 150 8C220 90 288 105 288 160V396';
const ARCH_IN = 'M24 396V164C24 116 86 102 150 28C214 102 276 116 276 164V396';
// golden mihrab frame with hanging lanterns / moons / stars (solid inside, text never touches decoration)
export function frameHtml(inner = '', cls = '') {
  return `<div class="p-frame ${cls}"><svg class="fl" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCH_OUT}Z" fill="${GD}"/><path d="${ARCH_OUT}" stroke="${GOLD}" stroke-width="4" fill="none"/><path d="${ARCH_IN}" stroke="${GOLD}" stroke-width="1.6" stroke-dasharray="5 4" fill="none" opacity=".8"/></svg>
    <div class="fh">${hang(70, 128, 18, 'moon', 26, 1)}${hang(105, 88, 50, 'lantern', 46, 0)}${hang(150, 34, 30, 'star', 24, 2)}${hang(196, 92, 24, 'lantern', 36, 3)}${hang(232, 128, 28, 'moon', 22, 4)}${sparks(10, 6, 40)}</div>
    ${inner}</div>`;
}
export function heroHtml(title, sub = '') {
  return frameHtml(`<div class="ft"><div class="p-crest"><span style="color:${GOLD}">${MOON()}</span><span style="color:${WHITE}">${STAR8}</span></div><h1 class="p-sitename p-t">${esc(title)}</h1>${sub ? `<p class="p-subt">${esc(sub)}</p>` : ''}</div>`, 'home');
}

const MOSQUE = (() => {
  const A = '#7FB59E', B = '#CFE8DA', W = '#F6E4B0', m = 'mq' + (uid++);
  const half = `<path d="M118 190V112L130 70L142 112V190Z" fill="${B}"/><rect x="116" y="112" width="28" height="5" fill="${A}"/><rect x="116" y="140" width="28" height="5" fill="${A}"/><path d="M124 70L130 54L136 70Z" fill="${A}"/><circle cx="130" cy="50" r="4" fill="${A}"/>
    <path d="M62 190V124L72 90L82 124V190Z" fill="${A}"/><rect x="60" y="124" width="24" height="5" fill="${B}"/><path d="M67 90L72 76L77 90Z" fill="${B}"/><circle cx="72" cy="72" r="3.5" fill="${B}"/>
    <path d="M150 190C150 156 176 142 192 124C204 112 210 100 214 88C218 100 224 112 236 124C252 142 278 156 278 190Z" fill="${B}"/><rect x="212" y="84" width="4" height="26" fill="${A}"/><g mask="url(#${m})"><circle cx="214" cy="76" r="12" fill="${A}"/></g>`;
  return `<svg viewBox="0 -34 600 234" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><mask id="${m}"><rect width="600" height="200" fill="#fff"/><circle cx="219" cy="72" r="10" fill="#000"/></mask><mask id="${m}b" maskUnits="userSpaceOnUse" x="270" y="-40" width="60" height="60"><rect x="270" y="-40" width="60" height="60" fill="#fff"/><circle cx="306" cy="-18" r="11" fill="#000"/></mask></defs>
    <path d="M200 190C200 136 224 112 258 96C282 84 292 56 300 22C308 56 318 84 342 96C376 112 400 136 400 190Z" fill="${A}"/><rect x="298" y="-4" width="4" height="28" fill="${B}"/><g class="mq-moon" mask="url(#${m}b)"><circle cx="300" cy="-14" r="13" fill="${GOLDL}"/></g>
    <rect x="150" y="150" width="300" height="50" fill="${A}"/>
    <g>${half}</g><g transform="translate(600 0) scale(-1 1)">${half}</g>
    <g class="win" fill="${W}"><rect x="186" y="160" width="9" height="16" rx="4.5"/><rect x="226" y="160" width="9" height="16" rx="4.5"/><rect x="266" y="160" width="9" height="16" rx="4.5"/><rect x="325" y="160" width="9" height="16" rx="4.5"/><rect x="365" y="160" width="9" height="16" rx="4.5"/><rect x="405" y="160" width="9" height="16" rx="4.5"/></g></svg>`;
})();

// ----- footer: clouds that part on scroll and reveal the mosque beneath -----
const cloudMass = () => {
  let back = '', front = '';
  for (let i = 0; i < 7; i++) { const cy = 24 + i * 56, r = 44 + (i % 2) * 10, cx = 262 - (i % 2) * 22; back += `<circle cx="${cx - 14}" cy="${cy + 8}" r="${r}"/>`; front += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; }
  for (let j = 0; j < 5; j++) { front += `<circle cx="${30 + j * 62}" cy="${10 + (j % 2) * 8}" r="${34 + (j % 3) * 6}"/>`; back += `<circle cx="${30 + j * 62}" cy="${18 + (j % 2) * 8}" r="${34 + (j % 3) * 6}"/>`; }
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true"><g fill="#CFE0D6"><rect x="0" y="20" width="250" height="380"/>${back}</g><g fill="#FFFFFF"><rect x="0" y="16" width="246" height="384"/>${front}</g></svg>`;
};
export const cloudFooterHtml = () => `<div class="p-cf"><div class="cf-under"><div class="cf-sky">${sparks(14, 4, 60)}</div><div class="cf-moon" style="color:${GOLD}">${MOON()}</div><div class="cf-m">${MOSQUE}</div></div><div class="cf-l"><div class="cf-in">${cloudMass()}</div></div><div class="cf-r"><div class="cf-in">${cloudMass()}</div></div></div>`;

// ----- scroll-driven scenery: designs slide in beside the content as you scroll -----
const SCENES = [
  [LANT, 64], [MOONSTARS, 130], [ROSETTE, 190], [ARCHWIN, 120], [STARS3, 120], [`<div style="color:${GOLD}">${MANDALA}</div>`, 220], [DOMEI, 130]
];
function mountScenery(theme) {
  const sc = document.createElement('div'); sc.className = 'p-scene'; document.body.appendChild(sc);
  let items = [], H = 0;
  const layout = () => {
    sc.style.height = '0px';
    const nh = Math.max(document.documentElement.scrollHeight, innerHeight);
    if (Math.abs(nh - H) < 30 && items.length) { sc.style.height = H + 'px'; return; }
    H = nh; sc.style.height = H + 'px';
    const vw = innerWidth, wide = vw >= 960, step = wide ? 400 : 320;
    const n = Math.max(2, Math.floor((H - 100) / step));
    sc.innerHTML = '';
    items = [];
    for (let i = 0; i < n; i++) {
      const [svg, w0] = SCENES[(i + (theme === 'list' || theme === 'note' ? 1 : 0)) % SCENES.length];
      const w = wide ? w0 : Math.round(w0 * .78), side = i % 2 ? 1 : -1, top = 150 + i * step;
      const x = wide ? (side < 0 ? Math.max(12, (vw - 720) / 2 - w - 36) : Math.min(vw - w - 12, (vw + 720) / 2 + 36)) : (side < 0 ? -w * .3 : vw - w * .7);
      const el = document.createElement('div'); el.className = 'sc'; el.style.cssText = `left:${x}px;top:${top}px;width:${w}px`; el.dataset.side = side; el.innerHTML = typeof svg === 'function' ? svg() : svg;
      sc.appendChild(el); items.push(el);
    }
    update();
  };
  const update = () => {
    const vh = innerHeight, y = scrollY;
    items.forEach(el => {
      const top = parseFloat(el.style.top), h = el.offsetHeight, rel = (top + h / 2 - y - vh / 2) / vh, e = Math.max(0, 1 - Math.abs(rel) * 1.15), side = +el.dataset.side;
      el.style.translate = (side * (1 - e) * 140).toFixed(1) + 'px 0';
      el.style.rotate = (rel * 50).toFixed(1) + 'deg';
      el.style.scale = (0.7 + 0.3 * e).toFixed(3);
      el.style.opacity = (0.15 + 0.85 * e).toFixed(2);
    });
  };
  let t = 0; const relayout = () => { clearTimeout(t); t = setTimeout(layout, 250); };
  let tick = false; addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
  addEventListener('resize', () => { H = 0; relayout(); }); addEventListener('load', relayout);
  new MutationObserver((rs) => { if (rs.some(r => !(r.target.closest && r.target.closest('.p-scene')))) relayout(); }).observe(document.body, { childList: true, subtree: true });
  layout();
}
function cloudScroll() {
  const f = document.querySelector('.p-cf'); if (!f) return;
  const r = f.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight - r.top - r.height * .15) / (r.height * .8)));
  const l = f.querySelector('.cf-l'), rr = f.querySelector('.cf-r'), u = f.querySelector('.cf-under');
  l.style.transform = `translateX(${(-p * 108).toFixed(1)}%)`; rr.style.transform = `translateX(${(p * 108).toFixed(1)}%)`;
  u.style.opacity = (0.35 + 0.65 * p).toFixed(2); u.style.transform = `scale(${(0.94 + 0.06 * p).toFixed(3)})`;
}

const THEMES = {
  home: { g: ['#2E9A7C', '#0E4A3B'], bar: '#1E7F68', pat: ['#CFE8DA', WHITE, GOLD, '#7FC4A8', .08] },
  section: { g: ['#1F8A6B', '#0B4636'], bar: '#0E5B46', pat: ['#E6F3EC', WHITE, GOLD, '#7FC4A8', .12] },
  list: { g: ['#FFFFFF', '#F2E7C9'], light: 1, bar: '#0E5B46', pat: ['#C9A558', GOLD, GOLDL, '#9CCDB5', .5] },
  note: { g: ['#FFFFFF', '#F3E9CE'], light: 1, bar: '#0E5B46', pat: ['#CDB070', GOLD, GOLDL, '#9CCDB5', .45] },
  search: { g: ['#1F8A6B', '#0B4636'], bar: '#0E5B46', pat: ['#E6F3EC', WHITE, GOLD, '#7FC4A8', .12] },
  profile: { g: ['#17674F', '#0A3A2C'], bar: '#0E5B46', pat: ['#CFE8DA', WHITE, GOLD, '#6BB59A', .1] },
  login: { g: ['#1F8A6B', '#074A3A'], bar: '#0E5B46', pat: ['#CFE8DA', WHITE, GOLD, '#6BB59A', .12] }
};
export function mountBg(theme = 'home') {
  const t = THEMES[theme] || THEMES.home;
  if (document.querySelector('.p-bg')) return;
  document.body.classList.toggle('p-light', !!t.light);
  document.documentElement.style.setProperty('--bar', t.bar);
  document.body.style.backgroundColor = t.g[1];
  const [l, f1, f2, lf, op] = t.pat;
  document.body.insertAdjacentHTML('afterbegin', `<div class="p-bg" style="background:linear-gradient(${t.g[0]},${t.g[1]})" aria-hidden="true"><div class="p-pat" style="background-image:${tile(l, f1, f2, lf)};opacity:${op}"></div>${t.light ? '' : `<div class="par" style="inset:0">${sparks(22)}</div>`}${theme === 'login' ? `<div class="par" style="inset:0">${frameHtml('', 'bgframe')}</div>` : ''}</div>`);
  mountScenery(theme);
  let tk = false; const on = () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; cloudScroll(); }); } };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); setTimeout(on, 400); setInterval(cloudScroll, 700);
}

export function navHtml(active = 'home') {
  const it = (k, href, ic, label) =>
    `<a href="${href}" class="${active === k ? 'on' : ''}" ${active === k ? 'aria-current="page"' : ''}><b>${ic}</b><span>${label}</span></a>`;
  return `<nav class="p-nav" aria-label="মূল মেনু">${it('home', 'index.html', ICON.home, 'হোম')}${it('search', 'search.html', ICON.search, 'খুঁজুন')}${it('profile', 'profile.html', ICON.user, 'প্রোফাইল')}</nav>`;
}
export function mountNav(active) { document.body.insertAdjacentHTML('beforeend', navHtml(active)); }

export function topHtml({ title = '', sub = '', back = 'index.html', right = '' } = {}) {
  return `<header class="p-top"><div class="p-top-in">
    <a class="p-round" id="pBack" href="${esc(back)}" aria-label="পেছনে">${ICON.back}</a>
    <div class="p-top-mid"><h1 id="pTitle">${esc(title)}</h1><small id="pSub">${esc(sub)}</small></div>
    <div class="p-top-r">${right}</div></div></header>`;
}
export function setTop(title, sub) {
  const t = document.getElementById('pTitle'), s = document.getElementById('pSub');
  if (t && title != null) t.textContent = title;
  if (s && sub != null) s.textContent = sub;
}

export const loaderHtml = (n = 4) => `<div class="p-skel">${'<i></i>'.repeat(n)}</div>`;
export const msgHtml = (text, err = false) => `<p class="p-msg${err ? ' err' : ''}">${esc(text)}</p>`;
export const emptyHtml = (icon, title, sub = '') => `<div class="p-empty"><b>${icon}</b><h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`;
export const divider = (text = '') => `<div class="p-div"><i></i>${text ? `<span>${esc(text)}</span>` : `<em>${DIA}</em>`}<i></i></div>`;

/* ---------------- the buttons ---------------- */
// ornate golden cartouche (home button) — outline generated in polar form: 4 pointed tips + fat diagonal lobes
const cartPath = (k) => {
  const q = Math.PI / 2, out = [];
  for (let i = 0; i <= 240; i++) {
    const th = i / 240 * Math.PI * 2, phi = Math.abs(((th + q / 2) % q + q) % q - q / 2);
    const r = (60 + Math.pow(Math.max(0, 1 - phi / 0.62), 1.5) * 31 + 9 * Math.pow(Math.sin(2 * th), 2)) * k;
    out.push((100 + r * Math.sin(th)).toFixed(1) + ' ' + (100 - r * Math.cos(th)).toFixed(1));
  }
  return 'M' + out.join('L') + 'Z';
};
const CART = (() => {
  const dots = [45, 135, 225, 315].map(a => { const r = 67, x = 100 + r * Math.sin(a * Math.PI / 180), y = 100 - r * Math.cos(a * Math.PI / 180); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="#B98A2D"/>`; }).join('');
  const drops = [0, 90, 180, 270].map(a => `<path d="M0 0C-5 -7 -4 -12 0 -16C4 -12 5 -7 0 0Z" fill="${GOLDL}" transform="translate(100 100) rotate(${a}) translate(0 -77)"/>`).join('');
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="${cartPath(1.04)}" fill="${GOLD}" stroke="${GD}" stroke-width="3" stroke-linejoin="round"/><path d="${cartPath(0.9)}" fill="none" stroke="#FFF3C4" stroke-width="2" stroke-linejoin="round"/><path d="${cartPath(0.74)}" fill="${G}" stroke="#FFF3C4" stroke-width="4" stroke-linejoin="round"/><path d="${cartPath(0.7)}" fill="none" stroke="${GOLD}" stroke-width="1.2" stroke-linejoin="round"/>${dots}${drops}</svg>`;
})();
export function homeBtnHtml({ label, href = '#', i = 0 }) {
  return `<a class="p-card rv" href="${esc(href)}" style="--i:${Math.min(i, 10)}">${CART}<span class="p-card-txt"><span class="p-t">${esc(label)}</span></span></a>`;
}
const BODY = ['#FFF6DF', '#E3F1E6', '#F6E4B0', '#FFFFFF'];
const GOURD = 'M50 4C58 22 74 24 74 40C74 50 66 54 66 60C66 66 74 70 74 82C74 100 58 104 50 116C42 104 26 100 26 82C26 70 34 66 34 60C34 54 26 50 26 40C26 24 42 22 50 4Z';
// Numbered button: star badge + curved plaque. Section button: gourd/arch badge + plaque. Text is centred on the whole button.
export function btnHtml({ label, href = '#', num = null, i = 0, read = false }) {
  const isNum = num != null;
  const badge = isNum
    ? `<span class="p-bd"><svg viewBox="0 0 100 100"><polygon points="${pts(8, 49, 35, 50)}" fill="${G}" stroke="#FFF3C4" stroke-width="2"/><polygon points="${pts(8, 41, 29, 50)}" fill="none" stroke="#FFF3C4" stroke-width="1.2" opacity=".7"/></svg><b>${toBn(num)}</b>${read ? `<u>${ICON.check}</u>` : ''}</span>`
    : `<span class="p-bd g"><svg viewBox="0 0 100 120"><path d="${GOURD}" fill="${G}" stroke="#FFF3C4" stroke-width="2.4"/><path d="${GOURD}" fill="none" stroke="#FFF3C4" stroke-width="1.2" opacity=".7" transform="translate(50 60) scale(.8) translate(-50 -60)"/></svg><i>${DIA}</i></span>`;
  return `<a class="p-btn rv ${isNum ? 'num' : 'sec'}${read ? ' is-read' : ''}" href="${esc(href)}" style="--i:${Math.min(i, 8)};--bf:${BODY[i % 4]}">
    ${isNum ? '<span class="p-tail"></span>' : ''}<span class="p-pl"><span class="p-t">${esc(label)}</span></span>${badge}</a>`;
}

/* ---------------- scroll reveal + click animation + page curtain ---------------- */
function initFx() {
  if (!document.body.classList.contains('p-body')) return;
  const curtain = document.createElement('div'); curtain.className = 'p-curtain'; document.body.appendChild(curtain);
  // arriving: open the curtain from where the previous click happened
  try {
    const f = sessionStorage.getItem('p_from');
    if (f) {
      sessionStorage.removeItem('p_from'); const [x, y] = f.split(',');
      curtain.style.setProperty('--cx', x + 'px'); curtain.style.setProperty('--cy', y + 'px');
      curtain.classList.add('full'); void curtain.offsetWidth;
      requestAnimationFrame(() => { curtain.classList.remove('full'); curtain.classList.add('open'); });
    }
  } catch (e) { /* ignore */ }
  addEventListener('pageshow', (e) => { if (e.persisted) { curtain.className = 'p-curtain'; document.querySelectorAll('.go').forEach(n => n.classList.remove('go')); } });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((en) => en.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -20px 0px' }) : null;
  const scan = () => document.querySelectorAll('.rv:not(.in):not([data-o])').forEach(n => { n.dataset.o = 1; io ? io.observe(n) : n.classList.add('in'); });
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); scan();
  setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach(n => { const r = n.getBoundingClientRect(); if (r.top < innerHeight) n.classList.add('in'); }), 1800);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.p-btn, a.p-card, a.p-row'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href'); if (!href || href === '#') return;
    e.preventDefault();
    const r = a.getBoundingClientRect(), x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    const rip = document.createElement('span'); rip.className = 'p-rip'; rip.style.left = (x - r.left) + 'px'; rip.style.top = (y - r.top) + 'px'; (a.querySelector('.p-pl') || (a.classList.contains('p-card') ? null : a))?.appendChild(rip);
    a.classList.add('go');
    curtain.style.setProperty('--cx', x + 'px'); curtain.style.setProperty('--cy', y + 'px');
    setTimeout(() => { curtain.className = 'p-curtain cover'; }, 120);
    setTimeout(() => { try { sessionStorage.setItem('p_from', Math.round(x) + ',' + Math.round(y)); } catch (er) { /* ignore */ } location.href = href; }, 560);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFx); else initFx();

/* ---------------- session + activity ---------------- */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function streakOf(days = []) {
  const set = new Set(days); let n = 0; const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function ago(ts) {
  if (!ts) return '';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'এইমাত্র';
  if (s < 3600) return toBn(Math.floor(s / 60)) + ' মিনিট আগে';
  if (s < 86400) return toBn(Math.floor(s / 3600)) + ' ঘন্টা আগে';
  if (s < 86400 * 30) return toBn(Math.floor(s / 86400)) + ' দিন আগে';
  return fmtDate(ts);
}
export function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
}
export const nameOf = (u, p) => (p && p.name) || (u && (u.displayName || (u.email || '').split('@')[0])) || 'ভাই/বোন';

/* ---- own login system (data lives in Firestore `users`, Firebase Authentication NOT needed) ---- */
const SESSION_KEY = 'isl_uid';
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const need = () => { if (!(window.crypto && crypto.subtle)) throw Object.assign(new Error('https'), { code: 'no-crypto' }); };
export async function hashPw(pass, salt) {
  need();
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return hex(bits);
}
export async function uidOf(email) {
  need();
  return 'u_' + hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(email).trim().toLowerCase()))).slice(0, 32);
}
const publicUser = (d) => ({ uid: d.uid, email: d.email, displayName: d.name || '', photoURL: '' });
export async function signUp({ name, email, pass }) {
  email = email.trim().toLowerCase();
  const uid = await uidOf(email), ref = doc(db, 'users', uid);
  if ((await getDoc(ref)).exists()) throw Object.assign(new Error('exists'), { code: 'email-exists' });
  const salt = hex(crypto.getRandomValues(new Uint8Array(12))), now = Date.now();
  const d = { uid, name: name.trim(), email, salt, passHash: await hashPw(pass, salt), createdAt: now, lastLoginAt: now, activeDays: [dayKey()] };
  await setDoc(ref, d);
  localStorage.setItem(SESSION_KEY, uid);
  return publicUser(d);
}
export async function signIn(email, pass) {
  email = email.trim().toLowerCase();
  const uid = await uidOf(email), snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw Object.assign(new Error('nouser'), { code: 'no-user' });
  const d = snap.data();
  if ((await hashPw(pass, d.salt || '')) !== d.passHash) throw Object.assign(new Error('bad'), { code: 'bad-pass' });
  localStorage.setItem(SESSION_KEY, uid);
  return publicUser(d);
}

export async function requireUser() {
  let uid = null; try { uid = localStorage.getItem(SESSION_KEY); } catch (e) {}
  const goLogin = () => {
    const here = location.pathname.split('/').pop() || 'index.html';
    location.replace('login.html?next=' + encodeURIComponent(here + location.search));
    return new Promise(() => {});
  };
  if (!uid) return goLogin();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) { localStorage.removeItem(SESSION_KEY); return goLogin(); }
    profileCache = snap.data();
    return publicUser(profileCache);
  } catch (e) { console.warn('session', e); return goLogin(); }
}

let profileCache = null;
export async function touchUser(u) {
  if (!u) return null;
  try {
    const ref = doc(db, 'users', u.uid), today = dayKey(), now = Date.now();
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const d = snap.data(), days = Array.isArray(d.activeDays) ? d.activeDays : [];
    let changed = false;
    if (!days.includes(today)) { days.push(today); d.activeDays = days.slice(-400); changed = true; }
    if (!sessionStorage.getItem('p_seen')) { d.lastLoginAt = now; changed = true; }
    if (changed) await setDoc(ref, { activeDays: d.activeDays, lastLoginAt: d.lastLoginAt }, { merge: true });
    try { sessionStorage.setItem('p_seen', '1'); } catch (e) {}
    profileCache = d;
  } catch (e) { console.warn('profile', e); }
  return profileCache;
}

export async function trackRead(u, note) {
  if (!u || !note) return;
  try {
    const id = u.uid + '_' + note.id, ref = doc(db, 'reads', id), now = Date.now();
    const snap = await getDoc(ref);
    const old = snap.exists() ? snap.data() : {};
    await setDoc(ref, { uid: u.uid, noteId: note.id, name: note.name || '', sectionId: note.sectionId || '', sectionName: note.sectionName || '',
      homeId: note.homeId || '', homeName: note.homeName || '', count: (old.count || 0) + 1, firstAt: old.firstAt || now, lastAt: now });
    await setDoc(doc(db, 'users', u.uid), { lastRead: { id: note.id, name: note.name || '', sectionName: note.sectionName || '', at: now } }, { merge: true });
  } catch (e) { console.warn('track', e); }
}

export function logout() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem('p_seen'); } catch (e) {} location.replace('login.html'); }
export const isLoggedIn = () => { try { return !!localStorage.getItem(SESSION_KEY); } catch (e) { return false; } };

export function avatarHtml(name, photo, cls = '') {
  const ch = esc((name || '?').trim().charAt(0).toUpperCase());
  return `<span class="p-avatar ${cls}">${photo ? `<img src="${esc(photo)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<em>${ch}</em></span>`;
}
