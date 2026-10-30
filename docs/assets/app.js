(() => {
  'use strict';
  const D = window.CHECKLISTS;
  const UI = D.ui;
  const LISTS = ['onprem', 'cloud', 'vendor'];
  const STATUSES = ['unassessed', 'compliant', 'noncompliant', 'na', 'exception', 'inherited'];
  const VIEWS = ['guide', 'cover', 'profiles', 'controls', 'score', 'export', 'sources'];
  const VIEW_TITLE = { guide: 'nav_guide', cover: 'cover_title', profiles: 'profiles_title', controls: 'controls_title', score: 'score_title', export: 'export_title', sources: 'sources_title' };
  // Title block cells: [id, label key, control, options, column span, phone span]
  const COVER_FIELDS = [
    ['name', 'cover_name', 'text', null, 'c-3'], ['desc', 'cover_desc', 'textarea', null, 'c-3 r-2'],
    ['owner', 'cover_owner', 'text', null, 'half'], ['techowner', 'cover_techowner', 'text', null, 'half'], ['assessor', 'cover_assessor', 'text', null, 'half'],
    ['date', 'cover_date', 'date', null, 'half'], ['golive', 'cover_golive', 'date', null, 'half'],
    ['criticality', 'cover_criticality', 'select', ['crit_high', 'crit_medium', 'crit_low'], 'half'],
    ['data', 'cover_data', 'select', ['data_public', 'data_internal', 'data_confidential', 'data_restricted'], 'half'],
    ['users', 'cover_users', 'select', ['users_customers', 'users_staff', 'users_both'], 'c-2 half']
  ];
  const FLAGS = ['major_change', 'significant', 'new_otp', 'foreign_branch'];
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };
  // A drafting revision triangle: outlined ink at one device pixel with the gate's number inside
  const tri = (n) => {
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 18 17'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'tri');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M9 1L17.5 16.5H0.5Z'); s.append(p);
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', '9'); t.setAttribute('y', '14'); t.textContent = String(n); s.append(t);
    return s;
  };
  const FIELD_SIZING = !!(window.CSS && CSS.supports && CSS.supports('field-sizing', 'content'));
  // Fallback for browsers without field-sizing: the cell grows to its text
  const grow = (ta) => { if (FIELD_SIZING || !ta.offsetParent) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  const growAll = () => { for (const ta of document.querySelectorAll('.cell textarea')) grow(ta); };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const state = { lang: store.get('checklists:lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : 'en'), jur: 'kw', list: 'onprem', baseline: 'all', search: '', showInherited: false, onlyGaps: false, view: 'cover' };
  if (!['ar', 'en'].includes(state.lang)) state.lang = 'en';
  const T = (k) => (UI[k] ? UI[k][state.lang] : k);
  const other = () => (state.lang === 'ar' ? 'en' : 'ar');
  const T2 = (k) => (UI[k] ? UI[k][other()] : k);
  // A cell label: the current language on screen, both languages on the printed sheet
  const lbl = (k, forId) => el('div', { class: 'lbl-row' },
    forId ? el('label', { class: 'lbl', for: forId, text: T(k) }) : el('span', { class: 'lbl', text: T(k) }),
    el('span', { class: 'lbl alt', lang: other(), dir: 'auto', text: T2(k) }));
  const N = (o) => (state.lang === 'ar' ? (o.title_ar || o.ar || o.title_en || o.en) : (o.title_en || o.en));
  const J = () => D.data[state.jur];
  const jurMeta = () => D.jurisdictions.jurisdictions.find((j) => j.id === state.jur);
  const key = () => `checklists:v1:${state.jur}:${state.list}`;
  const pctText = (n) => `${n}%`;
  const ofText = (a, b) => `${a} ${T('of_total')} ${b}`;
  let A = null;

  function blank() {
    return { schema: 'checklists/assessment/1', project: D.project.name_en || '', jurisdiction: state.jur, list: state.list, cover: {}, flags: {}, profiles: [], includeEntity: false, controls: {}, extensions: {}, updated: '' };
  }
  function load() {
    const raw = store.get(key());
    if (raw) { try { const a = JSON.parse(raw); if (a && a.schema === 'checklists/assessment/1') return a; } catch (e) {} }
    return blank();
  }
  let saveTimer = null;
  function savedStamp() { return A.updated ? `${T('saved_local')} \u2068${A.updated.slice(0, 16).replace('T', ' ')}\u2069` : ''; }
  function save(now) {
    A.updated = new Date().toISOString();
    clearTimeout(saveTimer);
    const doSave = () => { if (store.set(key(), JSON.stringify(A))) $('#saved').textContent = savedStamp(); };
    if (now) doSave(); else saveTimer = setTimeout(doSave, 300);
  }

  // Applicability and scoring
  const perList = (r) => r.lists[state.list];
  const inList = () => J().controls.filter((r) => perList(r));
  const applicable = (r) => { const p = perList(r); return !!p && (!p.profiles.length || p.profiles.some((x) => A.profiles.includes(x))); };
  const statusOf = (r) => (A.controls[r.id] && A.controls[r.id].status) || (perList(r).level === 'entity' ? 'inherited' : 'unassessed');
  const counted = (r) => A.includeEntity || perList(r).level !== 'entity';
  function tally(rows) {
    const t = { total: rows.length, counted: 0, compliant: 0, noncompliant: 0, na: 0, exception: 0, inherited: 0, unassessed: 0, pct: 0 };
    for (const r of rows) { if (!counted(r)) continue; t.counted++; t[statusOf(r)]++; }
    const denom = t.counted - t.na - t.inherited;
    t.pct = denom ? Math.round((100 * t.compliant) / denom) : 0;
    t.denom = denom;
    return t;
  }
  const extApplicable = () => J().extensions.checks.filter((c) => c.lists.includes(state.list) && (!c.profiles.length || c.profiles.some((x) => A.profiles.includes(x))));
  function extTally() {
    const rows = extApplicable();
    let c = 0, na = 0;
    for (const r of rows) { const s = (A.extensions[r.id] || {}).status; if (s === 'compliant') c++; else if (s === 'na') na++; }
    const denom = rows.length - na;
    return { total: rows.length, compliant: c, pct: denom ? Math.round((100 * c) / denom) : 0 };
  }
  function gateActive(g) {
    const w = g.when;
    if (w.lists && !w.lists.includes(state.list)) return false;
    if (w.profiles && !w.profiles.some((p) => A.profiles.includes(p))) return false;
    if (w.cover && !A.flags[w.cover]) return false;
    if (w.status && !Object.values(A.controls).some((c) => c.status === w.status)) return false;
    return true;
  }
  const isGap = (r) => { const s = statusOf(r); return s === 'noncompliant' || (s === 'unassessed' && counted(r)); };

  // Views
  function showView(id, push) {
    if (!VIEWS.includes(id)) id = 'cover';
    state.view = id;
    for (const v of VIEWS) $('#' + v).hidden = v !== id;
    for (const a of document.querySelectorAll('#views a')) { if (a.dataset.view === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
    $('#view-title').textContent = T(VIEW_TITLE[id]);
    const jm = jurMeta();
    $('#view-sub').textContent = `${N(jm)}: ${state.lang === 'ar' ? jm.frameworks[0].ar : jm.frameworks[0].en}`;
    if (push && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    document.body.classList.remove('menu-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    if (push) window.scrollTo({ top: 0, behavior: 'auto' });
    if (id === 'cover') growAll();
  }

  // Static text
  function renderStatic() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    const first = state.lang === 'ar' ? D.project.name_ar : D.project.name_en;
    const second = state.lang === 'ar' ? D.project.name_en : D.project.name_ar;
    $('#wm-first').textContent = first || T('title_default');
    $('#wm-second').textContent = second || '';
    $('#wm-first-top').textContent = first || T('title_default');
    $('#wm-tag').textContent = T('wordmark_tagline');
    document.title = first ? `${first}: ${T('title_default')}` : T('title_default');
    $('#lang-switch').textContent = T('lang_switch');
    $('#lang-switch-top').textContent = T('lang_switch');
    for (const n of document.querySelectorAll('[data-t]')) n.textContent = T(n.dataset.t);
    for (const n of document.querySelectorAll('[data-p]')) n.placeholder = T(n.dataset.p);
    for (const n of document.querySelectorAll('[data-a]')) n.setAttribute('aria-label', T(n.dataset.a));
    $('#guide-steps').replaceChildren(...UI.guide_steps.map((s) => el('li', { text: s[state.lang] })));
    $('#guide-levels').replaceChildren(...['app', 'hosting', 'entity'].flatMap((l) => [el('dt', { text: T('level_' + l) }), el('dd', { text: T('level_' + l + '_desc') })]));
    $('#guide-statuses').replaceChildren(...STATUSES.flatMap((s) => {
      const desc = T('status_' + s + '_desc');
      return [el('dt', {}, el('span', { class: 'mark m-' + s, 'aria-hidden': 'true' }), T('status_' + s)), el('dd', { text: desc === 'status_' + s + '_desc' ? '' : desc })];
    }));
    const js = $('#jur-select');
    js.replaceChildren(...D.jurisdictions.jurisdictions.map((j) => {
      const o = el('option', { value: j.id, text: `${N(j)}, ${T('phase')} ${j.order}${j.status === 'active' ? '' : ' (' + T('planned') + ')'}` });
      if (j.status !== 'active') o.disabled = true;
      if (j.id === state.jur) o.selected = true;
      return o;
    }));
    const lp = $('#list-picker');
    lp.replaceChildren(...LISTS.map((l) => el('label', {}, el('input', { type: 'radio', name: 'list', value: l, ...(l === state.list ? { checked: '' } : {}), onchange: () => switchList(l) }), T('list_' + l))));
    $('#sources-list').replaceChildren(...J().sources.sources.map((s) => el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener', text: N(s) }), `: ${state.lang === 'ar' ? s.use_ar : s.use_en}`)));
    $('#counts-note').textContent = state.lang === 'ar' ? J().sources.counts_note_ar : J().sources.counts_note_en;
    $('#version').textContent = T('version_line').replace('{V}', D.project.version).replace('{N}', String(J().controls_total)).replace('{C}', String(J().checks_written));
  }

  // The title block
  function renderCover() {
    const f = $('#cover-form');
    const cells = COVER_FIELDS.map(([id, label, type, opts, span]) => {
      let input;
      if (type === 'textarea') input = el('textarea', { id: 'c-' + id, rows: '3', dir: 'auto' });
      else if (type === 'select') input = el('select', { id: 'c-' + id }, el('option', { value: '', text: '' }), ...opts.map((o) => el('option', { value: o, text: T(o) })));
      else if (type === 'text') {
        // A drawn cell never truncates its entry: single line entries wrap and the cell grows
        input = el('textarea', { id: 'c-' + id, class: 'one', rows: '1', dir: 'auto', onkeydown: (e) => { if (e.key === 'Enter') e.preventDefault(); } });
      } else input = el('input', { id: 'c-' + id, type });
      input.value = A.cover[id] || '';
      const syncDate = () => { if (type === 'date') input.classList.toggle('empty', !input.value); };
      syncDate();
      input.addEventListener('input', () => {
        if (type === 'text' && /\n/.test(input.value)) input.value = input.value.replace(/\n+/g, ' ');
        A.cover[id] = input.value; save(); syncDate(); grow(input);
      });
      const cell = el('div', { class: 'cell ' + span }, lbl(label, 'c-' + id), input);
      if (id === 'desc') cell.append(el('span', { class: 'hint', text: T('cover_desc_hint') }));
      return cell;
    });
    const flags = el('div', { class: 'cell c-6' }, lbl('cover_flags'),
      el('div', { class: 'checks' }, ...FLAGS.map((fl) => el('label', {}, el('input', { type: 'checkbox', ...(A.flags[fl] ? { checked: '' } : {}), onchange: (e) => { A.flags[fl] = e.target.checked; save(true); renderScore(); } }), el('span', { text: T('flag_' + fl) })))));
    const coverage = el('div', { class: 'cell c-2 coverage-cell' }, lbl('cover_coverage'), el('div', { id: 'cover-score' }));
    const gates = el('div', { class: 'cell c-4' }, lbl('cover_gates'), el('ul', { class: 'gates', id: 'cover-gates' }));
    f.replaceChildren(...cells, flags, coverage, gates);
    $('#signoff').replaceChildren(...['signoff_business', 'signoff_security', 'signoff_risk'].map((k) => el('div', { class: 'cell' }, lbl('cover_signoff'), el('div', { text: T(k) }),
      ...['signoff_name', 'signoff_date', 'signoff_sign'].map((x) => el('div', { class: 'line' }, el('span', { text: T(x) }), el('span', { class: 'lbl alt', lang: other(), dir: 'auto', text: T2(x) }))))));
    renderScore();
    growAll();
  }

  function renderProfiles() {
    const used = new Set();
    for (const r of inList()) for (const p of perList(r).profiles) used.add(p);
    for (const c of J().extensions.checks) if (c.lists.includes(state.list)) for (const p of c.profiles) used.add(p);
    const box = $('#profile-groups');
    box.replaceChildren(...D.profiles.groups.map((g) => {
      const items = D.profiles.profiles.filter((p) => p.group === g.id && used.has(p.id));
      if (!items.length) return null;
      return el('div', { class: 'profile-group' }, el('h2', { text: N(g) }), el('div', { class: 'profile-grid' }, ...items.map((p) => el('label', { class: 'profile' },
        el('input', { type: 'checkbox', value: p.id, ...(A.profiles.includes(p.id) ? { checked: '' } : {}), onchange: (e) => { A.profiles = e.target.checked ? [...new Set([...A.profiles, p.id])] : A.profiles.filter((x) => x !== p.id); save(true); renderLedger(); renderScore(); } }),
        el('span', {}, N(p), el('small', { text: state.lang === 'ar' ? p.desc_ar : p.desc_en }))))));
    }).filter(Boolean));
  }

  function statusSelect(current, label, onChange) {
    return el('select', { 'aria-label': label, onchange: (e) => onChange(e.target.value) }, ...STATUSES.map((st) => el('option', { value: st, text: T('status_' + st), ...(st === current ? { selected: '' } : {}) })));
  }
  function evidenceBlock(rec, fields) {
    const box = el('div', { class: 'evidence' });
    for (const [k, label] of fields) {
      const ta = el('textarea', { dir: 'auto', oninput: (e) => { rec[k] = e.target.value; save(); } });
      ta.value = rec[k] || '';
      box.append(el('label', {}, T(label), ta));
    }
    return box;
  }
  function rowClass(r) { return 'row' + (isGap(r) ? ' gap' : ''); }
  // The schedule's column head: mark, reference, check, status
  const head = () => el('div', { class: 'row head', 'aria-hidden': 'true' }, el('span'), el('span', { text: T('ref') }), el('span', { text: T('check_col') }), el('span', { class: 'st', text: T('status') }));
  function profileNames(ids) {
    const map = Object.fromEntries(D.profiles.profiles.map((p) => [p.id, p]));
    return ids.map((x) => (map[x] ? N(map[x]) : x)).join(state.lang === 'ar' ? ' و' : ', ');
  }

  function renderLedger() {
    const j = J();
    const tabs = $('#baseline-tabs');
    tabs.replaceChildren(el('button', { type: 'button', role: 'tab', 'aria-selected': String(state.baseline === 'all'), text: T('all'), onclick: () => { state.baseline = 'all'; renderLedger(); } }),
      ...j.baselines.map((b) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(state.baseline === b.id), text: N(b), onclick: () => { state.baseline = b.id; renderLedger(); } })));
    const areas = Object.fromEntries(j.areas.map((a) => [a.id, a]));
    const subs = Object.fromEntries(j.subdomains.map((s) => [s.id, s]));
    const doms = Object.fromEntries(j.domains.map((d) => [d.id, d]));
    const q = state.search.trim().toLowerCase();
    const rows = inList().filter((r) => {
      if (state.baseline !== 'all' && r.baseline !== state.baseline) return false;
      if (!applicable(r)) return false;
      const s = statusOf(r);
      if (s === 'inherited' && !state.showInherited && !A.includeEntity) return false;
      if (state.onlyGaps && !isGap(r)) return false;
      if (q) {
        const a = areas[r.area];
        const hay = [r.ref, r.check ? r.check.en + ' ' + r.check.ar : '', a.title_en, a.title_ar, a.summary_en, a.summary_ar].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const out = [];
    let lastD = '', lastS = '', lastA = '';
    for (const r of rows) {
      if (r.domain !== lastD) { out.push(el('div', { class: 'domain', text: `${doms[r.domain].ref}. ${N(doms[r.domain])}` })); lastD = r.domain; lastS = lastA = ''; }
      if (r.subdomain !== lastS) { out.push(el('div', { class: 'subdomain', text: `${subs[r.subdomain].ref} ${N(subs[r.subdomain])}` })); lastS = r.subdomain; lastA = ''; }
      if (r.area !== lastA) { const a = areas[r.area]; out.push(el('div', { class: 'area' }, el('div', { class: 'area-title', text: `${a.ref} ${N(a)}` }), el('p', { class: 'summary', text: state.lang === 'ar' ? a.summary_ar : a.summary_en }))); lastA = r.area; }
      out.push(controlRow(r, j));
    }
    $('#ledger').replaceChildren(head(), ...(out.length ? out : [el('p', { class: 'empty', text: T('no_rows') })]));
    const ext = extApplicable();
    const eo = [head()];
    let lastG = '';
    for (const c of ext) {
      if (c.group !== lastG) { eo.push(el('div', { class: 'subdomain', text: N(j.extensions.groups.find((g) => g.id === c.group)) })); lastG = c.group; }
      const rec = A.extensions[c.id] || (A.extensions[c.id] = {});
      const st = rec.status || 'unassessed';
      const mark = el('span', { class: 'mark m-' + st, 'aria-hidden': 'true' });
      const row = el('div', { class: 'row' + (st === 'noncompliant' || st === 'unassessed' ? ' gap' : '') });
      const det = el('details', {}, el('summary', { text: T('note') }));
      det.addEventListener('toggle', () => { if (det.open && det.childElementCount === 1) det.append(evidenceBlock(rec, [['note', 'note']])); });
      row.append(mark, el('div', { class: 'ref', text: c.id }),
        el('div', { class: 'txt' }, el('p', { class: 'check', text: state.lang === 'ar' ? c.ar : c.en }), el('div', { class: 'meta' }, el('span', { text: `${T('relates')} ${c.relates.join(state.lang === 'ar' ? ' و' : ', ')}${c.profiles.length ? ' · ' + profileNames(c.profiles) : ''}` }), det)),
        statusSelect(st, `${T('status')} ${c.id}`, (v) => { rec.status = v; mark.className = 'mark m-' + v; row.className = 'row' + (v === 'noncompliant' || v === 'unassessed' ? ' gap' : ''); save(true); renderScore(); }));
      eo.push(row);
    }
    $('#ext-ledger').replaceChildren(...eo);
  }

  function controlRow(r, j) {
    const p = perList(r);
    const rec = A.controls[r.id] || (A.controls[r.id] = {});
    const st = statusOf(r);
    const mark = el('span', { class: 'mark m-' + st, 'aria-hidden': 'true' });
    const row = el('div', { class: rowClass(r), 'data-id': r.id });
    const check = r.check ? el('p', { class: 'check', text: state.lang === 'ar' ? r.check.ar : r.check.en }) : el('p', { class: 'check muted', text: T('see_official') });
    const meta = `${T('level_' + p.level)} · ${p.profiles.length ? profileNames(p.profiles) : T('base')}`;
    const det = el('details', {}, el('summary', { text: `${T('evidence_design')} / ${T('evidence_effect')}` }));
    det.addEventListener('toggle', () => { if (det.open && det.childElementCount === 1) det.append(evidenceBlock(rec, [['design', 'evidence_design'], ['effect', 'evidence_effect'], ['justification', 'justification'], ['note', 'note']])); });
    row.append(
      mark,
      el('div', { class: 'ref' }, el('a', { href: `${j.pdf}#page=${r.page}`, target: '_blank', rel: 'noopener', text: r.ref }), el('small', { text: `${T('page')} ${r.page}` })),
      el('div', { class: 'txt' }, check, el('div', { class: 'meta' }, el('span', { text: meta }), det)),
      statusSelect(st, `${T('status')} ${r.ref}`, (v) => { rec.status = v; mark.className = 'mark m-' + v; row.className = rowClass(r); save(true); renderScore(); })
    );
    return row;
  }

  function bar(label, t) {
    return el('div', { class: 'bar' }, el('span', { text: label }), el('div', { class: 'track' }, el('div', { class: 'fill', style: `width:${t.pct}%` })), el('span', { class: 'num', text: t.denom ? `${ofText(t.compliant, t.denom)} · ${pctText(t.pct)}` : ofText(0, 0) }));
  }
  function renderScore() {
    const j = J();
    const rows = inList().filter(applicable);
    const t = tally(rows);
    const e = extTally();
    const of = ofText(t.compliant, t.denom);
    $('#side-fig').textContent = pctText(t.pct);
    $('#side-fill').style.width = t.pct + '%';
    $('#side-of').textContent = `${of} ${T('compliant_short')}`;
    $('#strip-fig').textContent = pctText(t.pct);
    $('#strip-fill').style.width = t.pct + '%';
    $('#strip-of').textContent = of;
    if ($('#file-block').childElementCount) renderFile();
    const byB = j.baselines.map((b) => [N(b), tally(rows.filter((r) => r.baseline === b.id))]).filter(([, x]) => x.counted);
    const cs = $('#cover-score');
    if (cs) cs.replaceChildren(
      el('div', { class: 'fig', text: pctText(t.pct) }),
      el('div', { class: 'of', text: `${of} ${T('coverage_of')}` }),
      el('div', { class: 'track' }, el('div', { class: 'fill', style: `width:${t.pct}%` })),
      el('div', { class: 'ends' }, el('span', { text: '0' }), el('span', { text: String(t.denom) })),
      el('table', { class: 'by-baseline' }, el('tbody', {}, ...byB.map(([n, x]) => el('tr', {}, el('td', { text: n }), el('td', { class: 'n', text: `${ofText(x.compliant, x.denom)} · ${pctText(x.pct)}` }))),
        el('tr', {}, el('td', { text: T('extensions_title') }), el('td', { class: 'n', text: ofText(e.compliant, e.total) }))))
    );
    const gates = j.gates.filter(gateActive);
    const gl = $('#cover-gates');
    if (gl) gl.replaceChildren(...(gates.length ? gates.map((g, i) => el('li', {}, tri(i + 1), el('div', {}, el('span', { class: 'ref', text: g.ref }), state.lang === 'ar' ? g.ar : g.en))) : [el('li', { class: 'none', text: T('gates_none') })]));
    const domBlocks = j.baselines.map((b) => {
      const ds = j.domains.filter((d) => d.baseline === b.id).map((d) => [d, tally(rows.filter((r) => r.domain === d.id))]).filter(([, x]) => x.denom > 0);
      return ds.length ? el('div', { class: 'bars' }, el('p', { class: 'bar-group', text: N(b) }), ...ds.map(([d, x]) => bar(`${d.ref}. ${N(d)}`, x))) : null;
    }).filter(Boolean);
    const count = (k, n) => el('div', { class: 'cell' }, lbl(k), el('b', { text: String(n) }));
    $('#score-body').replaceChildren(
      el('div', { class: 'block counts' },
        count('score_applicable', t.denom), count('status_compliant', t.compliant), count('score_gaps', t.noncompliant + t.unassessed),
        count('status_na', t.na), count('status_exception', t.exception), count('status_inherited', t.inherited)),
      el('div', { class: 'score-grid' },
        el('div', {}, el('h2', { class: 'h2', text: T('score_by_baseline') }), el('div', { class: 'bars' }, ...byB.map(([n, x]) => bar(n, x))),
          el('h2', { class: 'h2', text: T('score_extensions') }), el('div', { class: 'bars' }, bar(T('extensions_title'), { pct: e.pct, denom: e.total, compliant: e.compliant }))),
        el('div', {}, el('h2', { class: 'h2', text: T('score_by_domain') }), ...domBlocks))
    );
  }

  // Export
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#export-status').textContent = T('exported');
  }
  const stem = () => `${state.jur}-${state.list}-${(A.cover.name || 'assessment').replace(/[^\w؀-ۿ-]+/g, '_')}`;
  const csvCell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  function exportCsv() {
    const j = J();
    const areas = Object.fromEntries(j.areas.map((a) => [a.id, a]));
    const head = ['id', 'ref', 'page', 'baseline', 'area', 'level', 'profiles', 'applicable', 'status', 'design_evidence', 'effectiveness_evidence', 'justification', 'note'];
    const lines = [head.join(',')];
    for (const r of inList()) {
      const p = perList(r), rec = A.controls[r.id] || {};
      lines.push([r.id, r.ref, r.page, r.baseline, `${areas[r.area].ref} ${areas[r.area].title_en}`, p.level, p.profiles.join(' '), applicable(r) ? 'yes' : 'no', statusOf(r), rec.design, rec.effect, rec.justification, rec.note].map(csvCell).join(','));
    }
    for (const c of J().extensions.checks.filter((c) => c.lists.includes(state.list))) { const rec = A.extensions[c.id] || {}; lines.push([c.id, c.id, '', 'extension', c.group, c.level, c.profiles.join(' '), extApplicable().includes(c) ? 'yes' : 'no', rec.status || 'unassessed', '', '', '', rec.note].map(csvCell).join(',')); }
    download(`${stem()}.csv`, '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
  }
  function exportMd() {
    const j = J(), ar = state.lang === 'ar';
    const areas = Object.fromEntries(j.areas.map((a) => [a.id, a]));
    const rows = inList().filter(applicable);
    const t = tally(rows);
    const o = [];
    if (ar) o.push('<div dir="rtl" lang="ar">', '');
    o.push(`# ${T('list_' + state.list)}: ${N(jurMeta())}`, '', `## ${T('cover_title')}`, '', '| | |', '| --- | --- |');
    for (const [id, label] of COVER_FIELDS) o.push(`| ${T(label)} | ${(A.cover[id] || '').replace(/\n/g, ' ')} |`);
    o.push(`| ${T('cover_flags')} | ${FLAGS.filter((f) => A.flags[f]).map((f) => T('flag_' + f)).join('; ')} |`);
    o.push(`| ${T('profiles_title')} | ${A.profiles.join(', ')} |`);
    o.push(`| ${T('cover_coverage')} | ${t.pct}% (${t.compliant} / ${t.denom}) |`, '');
    o.push(`## ${T('cover_gates')}`, '');
    const gates = j.gates.filter(gateActive);
    o.push(...(gates.length ? gates.map((g) => `- ${g.ref}: ${ar ? g.ar : g.en}`) : [`- ${T('gates_none')}`]), '');
    o.push(`## ${T('controls_title')}`, '', `| ${T('ref')} | ${T('page')} | ${T('level')} | ${T('status')} | ${T('evidence_design')} | ${T('evidence_effect')} | ${T('note')} |`, '| --- | --- | --- | --- | --- | --- | --- |');
    let last = '';
    for (const r of rows) {
      if (r.area !== last) { o.push(`| **${areas[r.area].ref} ${N(areas[r.area])}** | | | | | | |`); last = r.area; }
      const rec = A.controls[r.id] || {}; const p = perList(r);
      const cell = (v) => String(v || '').replace(/\|/g, '/').replace(/\n/g, ' ');
      o.push(`| ${r.ref} | ${r.page} | ${p.level} | ${T('status_' + statusOf(r))} | ${cell(rec.design)} | ${cell(rec.effect)} | ${cell(rec.justification ? rec.justification + ' ' : '')}${cell(rec.note)} |`);
    }
    o.push('', `## ${T('extensions_title')}`, '');
    for (const c of extApplicable()) { const rec = A.extensions[c.id] || {}; o.push(`- ${c.id}: ${T('status_' + (rec.status || 'unassessed'))}. ${ar ? c.ar : c.en}${rec.note ? ' ' + rec.note : ''}`); }
    if (ar) o.push('', '</div>');
    download(`${stem()}.md`, o.join('\n') + '\n', 'text/markdown;charset=utf-8');
  }
  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const a = JSON.parse(reader.result);
        if (!a || a.schema !== 'checklists/assessment/1' || !D.data[a.jurisdiction] || !LISTS.includes(a.list)) throw new Error('schema');
        state.jur = a.jurisdiction; state.list = a.list;
        A = a; save(true); renderAll(); $('#export-status').textContent = T('loaded');
        showView('cover', true);
      } catch (e) { $('#export-status').textContent = T('load_error'); }
    };
    reader.readAsText(file);
  }

  function switchList(l) {
    state.list = l; state.baseline = 'all'; state.onlyGaps = false; $('#only-gaps').checked = false;
    A = load(); renderAll();
  }
  function renderFile() {
    const rows = inList().filter(applicable);
    const t = tally(rows), e = extTally();
    const assessed = t.compliant + t.noncompliant + t.na + t.exception;
    const ext = extApplicable().filter((c) => (A.extensions[c.id] || {}).status && A.extensions[c.id].status !== 'unassessed').length;
    const cell = (label, value) => el('div', { class: 'cell' }, el('span', { class: 'lbl', text: T(label) }), el('span', { class: 'val', text: value }));
    $('#file-block').replaceChildren(
      el('h2', { text: T('file_title') }),
      el('div', { class: 'block' },
        cell('file_name', `${stem()}.json`),
        cell('file_lists', `${T('list_' + state.list)}, ${N(jurMeta())}`),
        cell('file_assessed', assessed + ext ? `${assessed + ext} ${T('of_total')} ${t.counted + e.total}` : T('file_none')),
        cell('file_profiles', A.profiles.length ? profileNames(A.profiles) : T('base')),
        cell('file_updated', A.updated ? '\u2068' + A.updated.slice(0, 16).replace('T', ' ') + '\u2069' : T('file_none')),
        cell('cover_coverage', pctText(t.pct))
      )
    );
  }
  function renderAll() {
    renderStatic();
    $('#include-entity').checked = !!A.includeEntity;
    renderCover(); renderProfiles(); renderLedger(); renderScore(); renderFile();
    $('#saved').textContent = savedStamp();
    showView(state.view, false);
  }

  // Wiring
  const toggleLang = () => { state.lang = state.lang === 'ar' ? 'en' : 'ar'; store.set('checklists:lang', state.lang); renderAll(); };
  $('#lang-switch').addEventListener('click', toggleLang);
  $('#lang-switch-top').addEventListener('click', toggleLang);
  $('#menu-toggle').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); if (open) $('#menu-close').focus(); });
  $('#menu-close').addEventListener('click', () => { document.body.classList.remove('menu-open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#menu-toggle').focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); } });
  $('#jur-select').addEventListener('change', (e) => { state.jur = e.target.value; switchList(state.list); });
  for (const a of document.querySelectorAll('#views a')) a.addEventListener('click', (e) => { e.preventDefault(); showView(a.dataset.view, true); });
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (VIEWS.includes(id) && id !== state.view) showView(id, false); });
  $('#search').addEventListener('input', (e) => { state.search = e.target.value; renderLedger(); });
  $('#show-inherited').addEventListener('change', (e) => { state.showInherited = e.target.checked; renderLedger(); });
  $('#only-gaps').addEventListener('change', (e) => { state.onlyGaps = e.target.checked; renderLedger(); });
  $('#include-entity').addEventListener('change', (e) => { A.includeEntity = e.target.checked; save(true); renderLedger(); renderScore(); });
  $('#btn-save').addEventListener('click', () => download(`${stem()}.json`, JSON.stringify(A, null, 1), 'application/json'));
  $('#file-load').addEventListener('change', (e) => { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; });
  $('#btn-csv').addEventListener('click', exportCsv);
  $('#btn-md').addEventListener('click', exportMd);
  $('#btn-print').addEventListener('click', () => window.print());
  let growTimer = null;
  window.addEventListener('resize', () => { clearTimeout(growTimer); growTimer = setTimeout(growAll, 120); });
  $('#btn-clear').addEventListener('click', () => { if (window.confirm(T('clear_confirm'))) { store.del(key()); A = blank(); renderAll(); $('#export-status').textContent = T('cleared'); } });

  A = load();
  const hash = location.hash.slice(1);
  if (VIEWS.includes(hash)) state.view = hash;
  else if (!store.get('checklists:visited')) { state.view = 'guide'; store.set('checklists:visited', '1'); }
  renderAll();
})();
