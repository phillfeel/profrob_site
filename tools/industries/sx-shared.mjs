// Renderers shared by the solution pages (tools/industries/pages/solution-*.mjs): the blocks that every solution page has,
// in the same markup, with the content in the page data. A page picks them by section key in `renderers`.
// Page data they read (all strings are keyed from their place in the data, see build.mjs):
//   paths:      [{ title, text, tag, href }]                              «с чего начать»: three ways in
//   problems:   [{ figure, cap, title, text, src: [SRC…] }]               figure first, source under it
//   directions: [{ anchor, title, text, facts: [{ k, v, src? }], link? }] classes of robots; also the options of the form
//   econ:       { how: { title, items: [{ k, v }], src }, market: { title, rows: [{ who, what, value, src }] }, note, link }
// The page's own signature block and hero live in the page module.

const srcLabel = (h, s) => `<span${h.T(s, 'label')}>${h.esc(s.label)}</span>`;
export const srcLine = (h, src) => (src ? `<p class="sx-src mono">${[].concat(src).map((s) => srcLabel(h, s)).join(' · ')}</p>` : '');

// «С чего начать»: three ways into the project. The point of the solution pages: our software goes onto any robot.
const paths = (ind, n, h) => `<section class="sol-sec wrap" id="paths" data-sec="${n}"${h.dn(ind, 'paths')} aria-labelledby="paths-h">
      ${h.secHead(n, h.secName(ind, 'paths'), h.dt(ind.heads, 'paths'), h.dt(ind.heads, 'pathsLead'), 'paths-h')}
      <ol class="sx-paths">
        ${ind.paths.map((p, i) => `<li class="sx-path reveal" style="--i:${i}">
          <span class="sx-path__no mono tnum">${h.pad(i + 1)}</span>
          <h3${h.T(p, 'title')}>${h.esc(p.title)}</h3>
          <p${h.T(p, 'text')}>${h.esc(p.text)}</p>
          <a class="sx-path__go" href="${p.href}"><span${h.T(p, 'tag')}>${h.esc(p.tag)}</span> ${h.ARROW_UR}</a>
        </li>`).join('\n        ')}
      </ol>
    </section>`;

// Market figures as a ledger: the figure on the left, what it means and its source on the right.
const problems = (ind, n, h) => `<section class="sol-sec wrap" id="problems" data-sec="${n}"${h.dn(ind, 'problems')} aria-labelledby="problems-h">
      ${h.secHead(n, h.secName(ind, 'problems'), h.head(ind, 'problems'), null, 'problems-h')}
      <ol class="sx-figs">
        ${ind.problems.map((p, i) => `<li class="sx-fig reveal" style="--i:${i}">
          <div class="sx-fig__n"><b${h.TN(h.dk(p, 'figure'), p.figure)}>${h.esc(p.figure)}</b><span${h.T(p, 'cap')}>${h.esc(p.cap)}</span></div>
          <div class="sx-fig__t"><h3${h.T(p, 'title')}>${h.esc(p.title)}</h3><p${h.T(p, 'text')}>${h.esc(p.text)}</p>${srcLine(h, p.src)}</div>
        </li>`).join('\n        ')}
      </ol>
    </section>`;

// Classes of robots: what it is for, and facts with their sources. Same rows as the industry directions.
const directions = (ind, n, h) => `<section class="sol-sec wrap" id="directions" data-sec="${n}"${h.dn(ind, 'directions')} aria-labelledby="directions-h">
      ${h.secHead(n, h.secName(ind, 'directions'), h.dt(ind.heads, 'directions'), h.dt(ind.heads, 'directionsLead'), 'directions-h')}
      <div class="drows">
        ${ind.directions.map((d, i) => `<article class="drow sx-class reveal" id="${d.anchor}" style="--i:${i}">
          <div class="drow__l">
            <span class="drow__no mono">${h.pad(i + 1)}</span>
            <h3${h.T(d, 'title')}>${h.esc(d.title)}</h3>
            <p${h.T(d, 'text')}>${h.esc(d.text)}</p>
          </div>
          <div class="drow__r">
            ${d.facts.length ? `<dl class="sx-facts">
              ${d.facts.map((f) => `<div><dt${h.T(f, 'k')}>${h.esc(f.k)}</dt><dd><b${h.T(f, 'v')}>${h.esc(f.v)}</b>${srcLine(h, f.src)}</dd></div>`).join('\n              ')}
            </dl>` : ''}
            ${d.link ? `<a class="drow__sol" href="${d.link.href}"><span${h.T(d.link, 'label')}>${h.esc(d.link.label)}</span> ${h.ARROW_UR}</a>` : ''}
          </div>
        </article>`).join('\n        ')}
      </div>
      ${ind.directionsNote ? `<p class="sx-note reveal"${h.T(ind, 'directionsNote')}>${h.esc(ind.directionsNote)}</p>` : ''}
    </section>`;

// Economics: how we count (our assumptions) next to what the market says (other people's claims, signed).
const economy = (ind, n, h) => {
  const e = ind.econ;
  return `<section class="sol-sec wrap" id="economy" data-sec="${n}"${h.dn(ind, 'economy')} aria-labelledby="economy-h">
      ${h.secHead(n, h.secName(ind, 'economy'), h.dt(ind.heads, 'economy'), h.dt(ind.heads, 'economyLead'), 'economy-h')}
      <div class="sx-econ">
        <div class="sx-how reveal">
          <h3${h.T(e.how, 'title')}>${h.esc(e.how.title)}</h3>
          <dl>
            ${e.how.items.map((it) => `<div><dt${h.T(it, 'k')}>${h.esc(it.k)}</dt><dd${h.T(it, 'v')}>${h.esc(it.v)}</dd></div>`).join('\n            ')}
          </dl>
          ${srcLine(h, e.how.src)}
        </div>
        <div class="sx-market">
          <h3 class="reveal"${h.T(e.market, 'title')}>${h.esc(e.market.title)}</h3>
          <ul>
            ${e.market.rows.map((r, i) => `<li class="sx-mrow reveal" style="--i:${i}">
              <b class="sx-mrow__v tnum"${h.TN(h.dk(r, 'value'), r.value)}>${h.esc(r.value)}</b>
              <div><h4${h.T(r, 'who')}>${h.esc(r.who)}</h4><p${h.T(r, 'what')}>${h.esc(r.what)}</p>${srcLine(h, r.src)}</div>
            </li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      <div class="sx-econ__foot reveal">
        <p${h.T(e, 'note')}>${h.esc(e.note)}</p>
        <a class="btn btn-sec" href="${e.link.href}"><span${h.T(e.link, 'label')}>${h.esc(e.link.label)}</span> ${h.ARROW_R}</a>
      </div>
    </section>`;
};

export const shared = { paths, problems, directions, economy };
