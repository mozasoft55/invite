// ============================================================================
// TEMPLATE-02 · ROYAL HERITAGE (FINAL PRODUCTION SUITE)
// ZERO TIMEZONE SHIFT • SUPPORTS "27-Oct-2026" & "YYYY-MM-DD" • 100dvh ZERO SCROLL
// ============================================================================

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';

const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);

const THEMES = {
  maroon:  {primary:'#7a1426', primary_dark:'#3f0713', accent:'#b98a2f', paper_top:'#FFFDF8', paper_bottom:'#F2DFBF', text:'#3b1a1f'},
  emerald: {primary:'#0f4d3a', primary_dark:'#052b20', accent:'#b98a2f', paper_top:'#FBFFF9', paper_bottom:'#E4EFD9', text:'#14291f'},
  navy:    {primary:'#1b2f5e', primary_dark:'#0a1633', accent:'#b98a2f', paper_top:'#FCFDFF', paper_bottom:'#E3E8F2', text:'#16203a'},
  rose:    {primary:'#9c2f55', primary_dark:'#55132d', accent:'#b98a2f', paper_top:'#FFFBFC', paper_bottom:'#F5DDE3', text:'#3a1824'}
};

const MON_FULL = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const MON_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAYS_FULL = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

const MONTH_MAP = {
  jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
  jul:7, aug:8, sep:9, oct:10, nov:11, dec:12
};

// ============================================================================
// 100% FAIL-SAFE DATE PARSER (SUPPORTS 27-Oct-2026, YYYY-MM-DD, AND ISO-UTC)
// ============================================================================
function parseYMD(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (!str) return null;

  let y, mo, d;

  // Case 1: DD-MMM-YYYY or DD MMM YYYY (e.g. "27-Oct-2026", "24-Oct-2026")
  let m = str.match(/^(\d{1,2})[\s\-\/]+([A-Za-z]+)[\s\-\/]+(\d{4})/);
  if (m) {
    d = Number(m[1]);
    const mStr = m[2].toLowerCase().slice(0, 3);
    y = Number(m[3]);
    mo = MONTH_MAP[mStr];
    if (mo) return buildDateParts(y, mo, d);
  }

  // Case 2: Pure YYYY-MM-DD (e.g. "2026-10-27")
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    y = Number(m[1]);
    mo = Number(m[2]);
    d = Number(m[3]);
    return buildDateParts(y, mo, d);
  }

  // Case 3: DD/MM/YYYY or DD-MM-YYYY (Numeric)
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    d = Number(m[1]);
    mo = Number(m[2]);
    y = Number(m[3]);
    return buildDateParts(y, mo, d);
  }

  // Case 4: ISO timestamp (e.g. "2026-10-26T18:30:00.000Z") -> Convert to IST
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(dt);

      const map = {};
      parts.forEach(p => { if (p.type !== 'literal') map[p.type] = p.value; });
      y = Number(map.year);
      mo = Number(map.month);
      d = Number(map.day);
      return buildDateParts(y, mo, d);
    }
  }

  return null;
}

function buildDateParts(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Strict local midday (12:00 PM) prevents any midnight timezone shifts
  const midday = new Date(year, month - 1, day, 12, 0, 0);

  return {
    year,
    month,
    day,
    weekday: DAYS_FULL[midday.getDay()],
    monthLong: MON_FULL[month - 1],
    monthShort: MON_SHORT[month - 1]
  };
}

function fmtTime(t) {
  if (!t) return '';
  const s = String(t).trim();
  if (/T|1899-/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).toUpperCase();
    }
  }
  return s.toUpperCase();
}

function fmtDate(value) {
  const p = parseYMD(value);
  if (!p) return String(value || '').toUpperCase();
  return `${p.day} ${p.monthShort} ${p.year}`;
}

function parseWhen(dateStr, timeStr) {
  const FALLBACK = new Date('2026-10-27T21:30:00+05:30').getTime();
  const p = parseYMD(dateStr);
  if (!p) return FALLBACK;

  let hh = 21, mi = 30;
  const time = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (time) {
    hh = Number(time[1]);
    mi = Number(time[2]);
    const ap = String(time[3] || '').toUpperCase();
    if (ap === 'PM' && hh !== 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
  }

  const iso = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}:00+05:30`;
  const timestamp = new Date(iso).getTime();
  return Number.isNaN(timestamp) ? FALLBACK : timestamp;
}

function saveTheDate(dateStr) {
  const p = parseYMD(dateStr);
  if (!p) return { wd: 'TUESDAY', day: 27, sf: 'th', mon: 'OCTOBER', yr: '2026' };

  const j = p.day % 10;
  const k = p.day % 100;
  let sf = 'th';
  if (j === 1 && k !== 11) sf = 'st';
  else if (j === 2 && k !== 12) sf = 'nd';
  else if (j === 3 && k !== 13) sf = 'rd';

  return {
    wd: p.weekday,
    day: p.day,
    sf,
    mon: p.monthLong,
    yr: String(p.year)
  };
}

// Laurel medallion crest
function crest(ini, h = 6.4) {
  const leaf = (th, mir) => {
    const a = mir ? 180 - th : th, r = 37, x = 100 + r * Math.cos(a * Math.PI / 180), y = 48 - r * Math.sin(a * Math.PI / 180);
    const rot = -(a + 90) + (mir ? -28 : 28);
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="2.8" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  };
  const L = [112, 138, 164, 190, 216, 242].map(t => leaf(t, 0)).join('');
  const R = [112, 138, 164, 190, 216, 242].map(t => leaf(t, 1)).join('');
  return `<svg viewBox="0 0 200 98" style="height:${h}em;width:auto;display:block;margin:0 auto" aria-hidden="true">
   <g fill="var(--ox)" opacity=".88">${L}${R}</g>
   <path d="M100 8l4 5-4 5-4-5z" fill="var(--gold)"/><path d="M100 80l3 4-3 4-3-4z" fill="var(--gold)"/>
   <circle cx="100" cy="48" r="27" fill="#fffaf0" stroke="var(--ox)" stroke-width="1.8"/><circle cx="100" cy="48" r="23.5" fill="none" stroke="var(--gold)" stroke-width="1"/>
   <text x="100" y="57" text-anchor="middle" font-family="'Playfair Display',serif" font-size="25" font-weight="700" fill="var(--ox)">${esc(ini)}</text></svg>`;
}

const fl = (w = 12) => `<svg viewBox="0 0 160 16" style="width:${w}em;height:${w / 10}em;display:block;margin:0 auto" aria-hidden="true"><use href="#fl"/></svg>`;

// ============================================================================
// MAIN RENDER TEMPLATE
// ============================================================================
export default function render({ guest, wedding: w, events = [] }) {
  const rawB = String(w.bride_name || 'Bride').trim();
  const rawG = String(w.groom_name || 'Groom').trim();
  const bride = esc(rawB), groom = esc(rawG);
  const ini = (rawB[0] + rawG[0]).toUpperCase();
  const brideFull = esc(w.bride_full || rawB), groomFull = esc(w.groom_full || rawG);
  const gName = esc(guest?.name || 'Respected Guest');

  // Mutual Exclusive Guest Rules:
  // f=1 -> Person='—', Family='✓'
  // f=0 -> Person=Count, Family='✕'
  const isFam = Boolean(guest?.with_family);
  const fam = isFam ? '✓' : '✕';
  const persons = isFam ? '—' : esc(guest?.persons || 1);

  const th = (w.theme_colors && typeof w.theme_colors === 'object')
    ? { ...THEMES.maroon, ...w.theme_colors }
    : (THEMES[String(w.theme || '').toLowerCase()] || THEMES.maroon);

  const sd = saveTheDate(w.date);
  const contacts = lines(w.rsvp_contacts);
  const map = safeUrl(w.map_url);

  const names = `<span class="sc" style="font-size:1.9em;white-space:nowrap">${bride}<span class="amp"> &amp; </span>${groom}</span>`;
  const msg = (w.message && String(w.message).trim())
    ? esc(w.message)
    : `With immense joy, we invite you to celebrate the wedding union of ${names}`;

  const dots = i => `<div class="dots">${[0, 1, 2, 3, 4].map(k => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>`;
  const next = (to, label) => `<button class="btn" type="button" data-next="${to}"><span>${label}</span><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>`;
  const P = (i, inner, btn, cls = '') => `<section class="sp${i ? '' : ' on'}" data-index="${i}">${dots(i)}<div class="bd ${cls}">${inner}</div>${btn}</section>`;

  const evs = (events.length ? events : []).map(e => `
    <div class="ev">
      <div>
        <b>${esc(e.event_name)}</b>
        <small>${esc(fmtDate(e.event_date))}${e.note ? ' · ' + esc(e.note) : ''}</small>
      </div>
      <span>${esc(fmtTime(e.event_time))}</span>
    </div>
  `).join('');

  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Great+Vibes&family=Lora:ital,wght@0,500;0,600;1,500&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--ox:${esc(th.primary)};--ox2:${esc(th.primary_dark)};--gold:${esc(th.accent)};--gl:#f4d896;--pt:${esc(th.paper_top)};--pb:${esc(th.paper_bottom)};--ink:${esc(th.text)}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.ru{position:absolute;inset:0;overflow:hidden;display:flex;justify-content:center;background:radial-gradient(circle at 50% 15%,var(--ox2),#120104 72%);font-family:'Lora',Georgia,serif;color:var(--ink)}
.vp{position:relative;width:100%;max-width:430px;height:100%}
.sp{position:absolute;inset:max(6px,env(safe-area-inset-top)) 6px max(8px,env(safe-area-inset-bottom));font-size:clamp(11px,min(2.2dvh,4.6vw),19px);line-height:1.4;
 border-radius:min(44vw,190px) min(44vw,190px) 24px 24px;background:linear-gradient(180deg,var(--pt) 45%,var(--pb));border:3px solid #dfc384;
 box-shadow:0 20px 60px rgba(0,0,0,.75),0 0 30px rgba(185,138,47,.2),inset 0 0 30px rgba(212,175,55,.12);display:flex;flex-direction:column;align-items:center;text-align:center;
 padding:1.1em 1.5em 1.1em;visibility:hidden;opacity:0;transform:scale(.97) translateY(10px);transition:opacity .45s,transform .45s,visibility .45s}
.sp.on{visibility:visible;opacity:1;transform:none;z-index:5}.sp.out{opacity:0;transform:scale(1.02) translateY(-8px)}
.sp:before{content:"";position:absolute;inset:6px;border:2px solid #b78a2f;border-radius:inherit;box-shadow:inset 0 0 0 4px #faf0dc,inset 0 0 0 6px #cfab55;pointer-events:none}
.sp:after{content:"";position:absolute;inset:16px;border:1px dashed rgba(183,138,47,.45);border-radius:inherit;pointer-events:none}
.bd{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;overflow-y:auto;scrollbar-width:none;padding-top:.4em}.bd::-webkit-scrollbar{display:none}
.bd.t{padding-top:2.2em}
.dots{display:flex;gap:.4em;margin:.2em 0 .3em;flex-shrink:0}.dots i{width:.45em;height:.45em;border-radius:50%;background:rgba(183,138,47,.3);transition:.3s}.dots i.on{width:1.6em;border-radius:.3em;background:var(--gold)}
.cap{font-family:'Cinzel',serif;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ox)}
.sc{font-family:'Great Vibes',cursive;color:var(--ox);line-height:1.1;font-weight:400}.amp{font-family:'Lora',serif;font-size:.5em;font-style:italic;vertical-align:middle}
.nm{font-family:'Playfair Display',serif;font-weight:700;color:var(--ox);line-height:1.2}
.tx{font-weight:500;line-height:1.5}.it{font-style:italic}small{display:block;font-size:.86em;opacity:.85}
.btn{flex-shrink:0;margin-top:.5em;width:100%;max-width:19em;min-height:3em;border:1.5px solid var(--gold);border-radius:99px;background:linear-gradient(135deg,var(--ox),var(--ox2));color:var(--gl);font:700 .78em 'Cinzel',serif;letter-spacing:.16em;text-transform:uppercase;display:inline-flex;align-items:center;justify-content:center;gap:.7em;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.btn:active{transform:scale(.97)}.btn svg{width:1.1em;height:1.1em;fill:none;stroke:currentColor;stroke-width:2}
.deck{display:flex;align-items:center;justify-content:center;gap:.8em}.deck .l{font:700 .78em/1.35 'Cinzel',serif;letter-spacing:.08em;color:var(--ink)}.deck .v{width:1.5px;height:2.6em;background:var(--gold)}
.deck .n{font:italic 700 3em/1 'Playfair Display',serif;color:var(--ox)}
.cp{display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:0 .3em}.cp .sc{font-size:2.9em}.cp .w{font:italic 600 1.3em 'Lora',serif;color:var(--ox)}
.to{width:92%;display:flex;align-items:baseline;gap:.4em;border-bottom:1.5px solid var(--ox);box-shadow:0 .25em 0 -.2em rgba(122,20,38,.35)}.to .sc{font-size:1.7em}.to .g{flex:1;font-size:2em}
.mf{display:flex;align-items:center;justify-content:center;gap:.9em}.mf .sc{font-size:1.5em}.box{border:1.5px solid var(--ox);background:rgba(255,255,255,.8);width:5.4em;height:2em;display:flex;align-items:center;justify-content:center;font:700 1.2em 'Playfair Display',serif;color:var(--ox)}
.mf .d{width:1px;height:3em;background:rgba(122,20,38,.35)}.spark{width:1.8em;height:1.8em;fill:var(--ox)}
.ev{display:flex;justify-content:space-between;align-items:center;gap:.6em;text-align:left;width:100%;background:rgba(255,255,255,.85);border:1px solid rgba(185,138,47,.4);border-left:3px solid var(--gold);border-radius:.5em;padding:.45em .8em}
.ev b{color:var(--ox);font-size:1.05em}.ev span{font:700 .78em 'Cinzel',serif;color:#8b6818;white-space:nowrap}.evs{width:100%;display:flex;flex-direction:column;gap:.4em}
.cd{display:flex;gap:.6em;width:100%;max-width:22em}.cd div{flex:1;background:rgba(255,255,255,.88);border:1px solid var(--gold);border-radius:.6em;padding:.5em 0}.cd b{display:block;font:800 1.6em/1 'Cinzel',serif;color:var(--ox)}.cd small{font:700 .6em 'Cinzel',serif;letter-spacing:.1em;color:#8b6818;margin-top:.2em}
.pills{width:100%;max-width:22em;display:flex;flex-direction:column;gap:.45em}.pill{padding:.75em 1em;border-radius:99px;font:700 .72em 'Cinzel',serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;text-align:center;border:1px solid var(--gold);cursor:pointer;display:block}
.p1{background:var(--ox);color:#fff}.p2{background:linear-gradient(135deg,#ECC880,#C59B27);color:#32030B}.p3{background:#fff;color:var(--ox);border-style:dashed}
.aud{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:50;width:42px;height:42px;border-radius:50%;background:rgba(43,3,11,.9);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer}
.aud svg{width:18px;height:18px;fill:var(--gl)}.aud.spin svg{animation:sp 5s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.sm{position:absolute;inset:0;z-index:60;background:rgba(20,2,5,.88);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}.sm.on{opacity:1;pointer-events:auto}
.pod{width:min(88vw,320px);background:linear-gradient(#FFFDF8,#F5E9D0);border:2px solid var(--gold);border-radius:18px;padding:20px 16px;text-align:center}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><g id="fl"><path d="M8 8h60M92 8h60" stroke="var(--ox)" stroke-width="1.2"/><path d="M80 2l4 6-4 6-4-6z" fill="var(--ox)"/><circle cx="71" cy="8" r="1.6" fill="var(--ox)"/><circle cx="89" cy="8" r="1.6" fill="var(--ox)"/></g>
<g id="sp"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></g></defs></svg>
<div class="ru">
 <button class="aud" id="aud" type="button" aria-label="Music"><svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg><audio id="au" preload="auto"><source src="${esc(w.music_url || 'invitation.mp3')}" type="audio/mpeg"></audio></button>
 <div class="vp">
${P(0, `${crest(ini, 7.4)}<div class="cap" style="font-size:.8em">Walima &amp; Nikah Invitation</div>
  <div><div class="sc" style="font-size:clamp(3.6em,22vw,4.8em)">Welcome</div>${fl(13)}</div>
  <div class="nm it" style="font-size:1.7em;font-weight:600">Dear ${gName}${guest?.with_family ? ' &amp; Family' : ''}</div>
  <p class="tx" style="font-size:1.12em;max-width:92%;margin:0">${msg}</p>`, next(1, 'Open Invitation'))}
${P(1, `<div>${crest(ini, 4.6)}<div class="cap" style="font-size:1.1em;margin-top:.3em">Wedding Invitation</div>${fl(11)}</div>
  <div class="deck"><div class="l" style="text-align:right">SAVE THE DATE<br>${sd.wd}</div><i class="v"></i><div class="n">${sd.day}${sd.sf}</div><i class="v"></i><div class="l" style="text-align:left">${sd.mon}<br>${sd.yr}</div></div>
  <div class="cp"><span class="sc">${bride}</span><span class="w">weds</span><span class="sc">${groom}</span></div>
  <div class="to"><span class="sc">To</span><span class="sc g">${gName}</span></div>
  <div class="mf"><svg class="spark" viewBox="0 0 24 24"><use href="#sp"/></svg><div><div class="sc">Person</div><div class="box">${persons}</div></div><i class="d"></i><div><div class="sc">Family</div><div class="box">${fam}</div></div><svg class="spark" viewBox="0 0 24 24"><use href="#sp"/></svg></div>
  <div><div class="it" style="font-size:1.05em">A Cordial Invitation</div><div class="nm" style="font-size:1.55em">${esc(w.host_name || '')}</div>
   <div class="tx" style="font-size:1.02em">${esc(w.host_address \vert{}\vert{} w.address \vert{}\vert{} '')}</div>${contacts.map(c => `<div class="tx" style="font-weight:600;font-size:1.02em">${esc(c)}</div>`).join('')}</div>`, next(2, 'The Ceremony'))}
${P(2, `<div><div class="it tx" style="font-size:1.02em;max-width:85%;margin:0 auto">${esc(w.invocation \vert{}\vert{} 'In the name of Allah the most beneficent & merciful')}</div>${fl(10)}<div class="cap" style="font-size:1.25em">${esc(w.ceremony_title || 'Marriage Ceremony')}</div></div>
  <div><div class="it tx" style="font-size:1.05em">has great pleasure to invite you to attend the wedding of their daughter</div>
   <div class="nm" style="font-size:1.95em;margin-top:.2em">${brideFull}</div><small>${esc(w.bride_parents || '')}</small>
   <div class="sc" style="font-size:2.6em">Weds</div>
   <div class="nm" style="font-size:1.95em">${groomFull}</div><small>${esc(w.groom_parents || '')}</small></div>
  <div style="border-top:1px solid rgba(183,138,47,.45);width:92%;padding-top:.6em"><div class="cap" style="font-size:.72em">With Best Compliments From</div>
   <div class="nm" style="font-size:1.3em">${esc(w.compliments || '')}</div><div class="cap" style="font-size:.72em;margin-top:.5em">R.S.V.P.</div>${contacts.map(c => `<div class="tx" style="font-weight:600">${esc(c)}</div>`).join('')}</div>`, next(3, 'View Programme'), 't')}
${P(3, `<div><div class="it tx">Insha Allah, to be solemnised as per the programme</div><div class="cap" style="font-size:1.2em;margin-top:.2em">Wedding Programme</div></div>
  <div class="evs">${evs}</div>
  <div><div class="cap" style="font-size:.78em">${esc(w.venue_title || 'Banquet Venue')}</div><div class="nm" style="font-size:1.4em">${esc(w.venue || '')}</div><div class="tx" style="font-size:.95em">${esc(w.address || '')}</div></div>`, next(4, 'Closing Heirloom'), 't')}
${P(4, `<div>${crest(ini, 4.4)}<div class="sc" style="font-size:2.7em;margin-top:.1em">With Love &amp; Warmest Regards</div><div class="nm" style="font-size:1.35em">${esc(w.footer_text || '')}</div></div>
  <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:.4em"><div class="cap" style="font-size:.72em;color:#8b6818">✦ The Auspicious Moment Arrives In ✦</div>
   <div class="cd" id="cd"><div><b id="d">00</b><small>Days</small></div><div><b id="h">00</b><small>Hours</small></div><div><b id="m">00</b><small>Mins</small></div><div><b id="s">00</b><small>Secs</small></div></div></div>
  <div class="pills">${map ? `<a class="pill p2" href="${map}" target="_blank" rel="noopener noreferrer">📍 View Venue Location</a>` : ''}
   <a class="pill p1" id="cal" href="#" target="_blank" rel="noopener noreferrer">📅 Save Date To Calendar</a>
   <a class="pill p2" id="wa" href="#" target="_blank" rel="noopener noreferrer">💬 Confirm RSVP on WhatsApp</a>
   <button class="pill p3" id="sc" type="button">✨ One Little Surprise</button></div>`, next(0, 'Return To Opening'), 't')}
 </div>
 <div class="sm" id="sm"><div class="pod"><div class="cap" style="font-size:.7rem">Royal Token</div><div class="nm" style="font-size:1.1rem">A Warm Sentiment</div>
  <div style="position:relative;width:260px;height:120px;margin:12px auto;border-radius:10px;overflow:hidden;border:1.5px solid var(--gold)"><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FFFDF8;padding:8px"><span style="font-size:22px">🕊️</span><div class="nm" style="font-size:.95rem;margin-top:4px">"Your Presence Is Our Greatest Blessing"</div></div>
  <canvas id="cv" width="260" height="120" style="position:absolute;inset:0;touch-action:none"></canvas></div>
  <button id="cs" type="button" style="background:none;border:0;font:700 .7rem 'Cinzel',serif;letter-spacing:.15em;text-transform:uppercase;color:var(--ox);text-decoration:underline;cursor:pointer">Close</button></div></div>
</div>`;
}

// ============================================================================
// MOUNT FUNCTION (LIFECYCLE, COUNTDOWN & INTERACTIVE FOIL)
// ============================================================================
export function mount(root, { guest, wedding: w }) {
  const $ = s => root.querySelector(s), S = [...root.querySelectorAll('.sp')], au = $('#au'), ab = $('#aud');
  let cur = 0, played = false;
  const go = n => {
    if (n === cur || !S[n]) return;
    const a = S[cur], b = S[n];
    a.classList.add('out'); a.classList.remove('on');
    cur = n;
    setTimeout(() => { a.classList.remove('out'); b.classList.add('on'); }, 350);
  };

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-next]');
    if (!b) return;
    go(+b.dataset.next);
    if (au && !played) {
      played = true;
      au.play().then(() => ab.classList.add('spin')).catch(() => {});
    }
  });

  if (au) {
    au.addEventListener('ended', () => ab.classList.remove('spin'));
    ab.onclick = () => au.paused ? au.play().then(() => ab.classList.add('spin')).catch(() => {}) : (au.pause(), ab.classList.remove('spin'));
  }

  const t = parseWhen(w.date, w.time);
  const E = ['d', 'h', 'm', 's'].map(i => $('#' + i));
  const pad = n => String(n).padStart(2, '0');

  const tick = () => {
    let ms = Math.max(0, t - Date.now());
    const v = [
      Math.floor(ms / 864e5),
      Math.floor(ms % 864e5 / 36e5),
      Math.floor(ms % 36e5 / 6e4),
      Math.floor(ms % 6e4 / 1e3)
    ];
    E.forEach((el, i) => { if (el) el.textContent = pad(v[i]); });
  };

  tick();
  const iv = setInterval(() => { root.isConnected ? tick() : clearInterval(iv); }, 1000);

  const cal = $('#cal');
  if (cal) {
    const loc = `${w.venue || ''}, ${w.address || ''}`;
    const st = ms => new Date(ms).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding: ${w.bride_name} &${w.groom_name}`)}&dates=${st(t)}/${st(t + 9e6)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent('You are cordially invited to the wedding of ' + w.bride_name + ' & ' + w.groom_name)}`;
  }

  const wa = $('#wa');
  if (wa) {
    wa.href = `https://wa.me/${String(w.rsvp_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Aadab / Namaste, I will be attending the wedding of ${w.bride_name} & ${w.groom_name}. Guest: ${guest?.name || ''}`)}`;
  }

  const sm = $('#sm'), cv = $('#cv');
  $('#sc').onclick = () => { sm.classList.add('on'); scratch(cv); };
  $('#cs').onclick = () => sm.classList.remove('on');
}

function scratch(c) {
  if (c._i) return; c._i = 1;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, c.width, c.height);
  [[0, '#ECC880'], [.35, '#C59B27'], [.7, '#8E6E1D'], [1, '#ECC880']].forEach(([o, k]) => g.addColorStop(o, k));
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#42050e'; x.font = 'bold 12px Cinzel,serif'; x.textAlign = 'center';
  x.fillText('⚜ SCRATCH TO REVEAL ⚜', c.width / 2, c.height / 2 + 4);

  let d = 0;
  const mv = e => {
    if (!d) return;
    const r = c.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
    x.globalCompositeOperation = 'destination-out';
    x.beginPath();
    x.arc(p.clientX - r.left, p.clientY - r.top, 16, 0, 7);
    x.fill();
  };

  c.onmousedown = c.ontouchstart = () => d = 1;
  addEventListener('mouseup', () => d = 0);
  addEventListener('touchend', () => d = 0);
  c.onmousemove = mv;
  c.addEventListener('touchmove', mv, { passive: true });
}
