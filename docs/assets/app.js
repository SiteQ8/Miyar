(() => {
  'use strict';
  const D = window.CHECKLISTS;
  const UI = D.ui;
  const LISTS = ['onprem', 'cloud', 'vendor'];
  const STATUSES = ['unassessed', 'compliant', 'noncompliant', 'na', 'exception', 'inherited'];
  const COVER_FIELDS = [
    ['name', 'cover_name', 'text'], ['desc', 'cover_desc', 'textarea'], ['owner', 'cover_owner', 'text'], ['techowner', 'cover_techowner', 'text'],
    ['assessor', 'cover_assessor', 'text'], ['date', 'cover_date', 'date'], ['golive', 'cover_golive', 'date'],
    ['criticality', 'cover_criticality', 'select', ['crit_high', 'crit_medium', 'crit_low']],
    ['data', 'cover_data', 'select', ['data_public', 'data_internal', 'data_confidential', 'data_restricted']],
    ['users', 'cover_users', 'select', ['users_customers', 'users_staff', 'users_both']]
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
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const state = { lang: store.get('checklists:lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : 'en'), jur: 'kw', list: 'onprem', baseline: 'all', search: '', showInherited: false, onlyGaps: false };
  if (!['ar', 'en'].includes(state.lang)) state.lang = 'en';
  const T = (k) => (UI[k] ? UI[k][state.lang] : k);
  const N = (o) => (state.lang === 'ar' ? (o.title_ar || o.ar || o.title_en || o.en) : (o.title_en || o.en));
  const J = () => D.data[state.jur];
  const jurMeta = () => D.jurisdictions.jurisdictions.find((j) => j.id === state.jur);
  const key = () => `checklists:v1:${state.jur}:${state.list}`;
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
  function save(now) {
    A.updated = new Date().toISOString();
    clearTimeout(saveTimer);
    const doSave = () => { if (store.set(key(), JSON.stringify(A))) $('#saved').textContent = `${T('saved_local')} ${A.updated.slice(0, 16).replace('T', ' ')}`; };
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

  // Static text
  function renderStatic() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    const name = state.lang === 'ar' ? D.project.name_ar : D.project.name_en;
    $('#site-title').textContent = name || T('title_default');
    document.title = name ? `${name}: ${T('title_default')}` : T('title_default');
    $('#site-tagline').textContent = state.lang === 'ar' ? D.project.tagline_ar : D.project.tagline_en;
    $('#lang-switch').textContent = T('lang_switch');
    for (const n of document.querySelectorAll('[data-t]')) n.textContent = T(n.dataset.t);
    for (const n of document.querySelectorAll('[data-p]')) n.placeholder = T(n.dataset.p);
    const steps = $('#guide-steps'); steps.replaceChildren(...UI.guide_steps.map((s) => el('li', { text: s[state.lang] })));
    $('#guide-levels').replaceChildren(...['app', 'hosting', 'entity'].flatMap((l) => [el('dt', { text: T('level_' + l) }), el('dd', { text: T('level_' + l + '_desc') })]));
    $('#guide-statuses').replaceChildren(...STATUSES.flatMap((s) => [el('dt', { text: T('status_' + s) }), el('dd', { text: T('status_' + s + '_desc') === 'status_' + s + '_desc' ? '' : T('status_' + s + '_desc') })]));
    const phases = $('#phases');
    phases.replaceChildren(...D.jurisdictions.jurisdictions.map((j) => {
      const b = el('button', { class: 'phase' + (j.id === state.jur ? ' active' : ''), type: 'button' }, N(j), el('small', { text: `${T('phase')} ${j.order}${j.status === 'active' ? '' : ': ' + T('planned')}` }));
      if (j.status !== 'active') b.disabled = true; else b.addEventListener('click', () => { state.jur = j.id; switchList(state.list); });
      return b;
    }));
    const lp = $('#list-picker');
    lp.replaceChildren(...LISTS.map((l) => el('label', {}, el('input', { type: 'radio', name: 'list', value: l, ...(l === state.list ? { checked: '' } : {}), onchange: () => switchList(l) }), T('list_' + l))));
    $('#sources-list').replaceChildren(...J().sources.sources.map((s) => el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener', text: N(s) }), `: ${state.lang === 'ar' ? s.use_ar : s.use_en}`)));
    $('#counts-note').textContent = state.lang === 'ar' ? J().sources.counts_note_ar : J().sources.counts_note_en;
    $('#version').textContent = `v${D.project.version}. ${J().controls_total} ${T('controls_count')}. ${J().checks_written} ${T('with_checks')}.`;
    $('#signoff').replaceChildren(el('tbody', {}, ...['signoff_business', 'signoff_security', 'signoff_risk'].map((k) => el('tr', {}, el('td', { text: T(k) }), el('td'), el('td'), el('td')))));
  }

  function renderCover() {
    const f = $('#cover-form');
    f.replaceChildren(...COVER_FIELDS.map(([id, label, type, opts]) => {
      let input;
      if (type === 'textarea') input = el('textarea', { id: 'c-' + id });
      else if (type === 'select') input = el('select', { id: 'c-' + id }, el('option', { value: '', text: '' }), ...opts.map((o) => el('option', { value: o, text: T(o) })));
      else input = el('input', { id: 'c-' + id, type });
      input.value = A.cover[id] || '';
      input.addEventListener('input', () => { A.cover[id] = input.value; save(); });
      const w = el('label', { class: 'field' + (type === 'textarea' ? ' wide' : '') }, el('span', { text: T(label) }), input);
      if (id === 'desc') w.append(el('small', { class: 'muted', text: T('cover_desc_hint') }));
      return w;
    }), el('div', { class: 'flags' }, el('span', { class: 'muted', text: T('cover_flags') }), ...FLAGS.map((fl) => el('label', {}, el('input', { type: 'checkbox', ...(A.flags[fl] ? { checked: '' } : {}), onchange: (e) => { A.flags[fl] = e.target.checked; save(true); renderScore(); } }), T('flag_' + fl)))));
    renderScore();
  }

  function renderProfiles() {
    const used = new Set();
    for (const r of inList()) for (const p of perList(r).profiles) used.add(p);
    for (const c of J().extensions.checks) if (c.lists.includes(state.list)) for (const p of c.profiles) used.add(p);
    const box = $('#profile-groups');
    box.replaceChildren(...D.profiles.groups.map((g) => {
      const items = D.profiles.profiles.filter((p) => p.group === g.id && used.has(p.id));
      if (!items.length) return null;
      return el('div', { class: 'profile-group' }, el('h3', { text: N(g) }), el('div', { class: 'profile-grid' }, ...items.map((p) => el('label', { class: 'profile' },
        el('input', { type: 'checkbox', value: p.id, ...(A.profiles.includes(p.id) ? { checked: '' } : {}), onchange: (e) => { A.profiles = e.target.checked ? [...new Set([...A.profiles, p.id])] : A.profiles.filter((x) => x !== p.id); save(true); renderLedger(); renderScore(); } }),
        el('span', {}, N(p), el('small', { text: state.lang === 'ar' ? p.desc_ar : p.desc_en }))))));
    }).filter(Boolean));
  }

  function statusSelect(current, onChange) {
    const s = el('select', { class: 's-' + current, onchange: (e) => { s.className = 's-' + e.target.value; onChange(e.target.value); } }, ...STATUSES.map((st) => el('option', { value: st, text: T('status_' + st), ...(st === current ? { selected: '' } : {}) })));
    return s;
  }
  function evidenceBlock(rec, fields) {
    const box = el('div', { class: 'evidence' });
    for (const [k, label] of fields) {
      const ta = el('textarea', { oninput: (e) => { rec[k] = e.target.value; save(); } });
      ta.value = rec[k] || '';
      box.append(el('label', {}, T(label), ta));
    }
    return box;
  }
  function rowClass(r) {
    const s = statusOf(r);
    if (s === 'inherited') return 'row inherited';
    if (s === 'compliant') return 'row done';
    if (s === 'noncompliant' || (s === 'unassessed' && counted(r))) return 'row gap';
    return 'row';
  }

  function renderLedger() {
    const j = J();
    const tabs = $('#baseline-tabs');
    tabs.replaceChildren(el('button', { type: 'button', role: 'tab', 'aria-selected': String(state.baseline === 'all'), text: state.lang === 'ar' ? 'الكل' : 'All', onclick: () => { state.baseline = 'all'; renderLedger(); } }),
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
      if (state.onlyGaps && !(s === 'noncompliant' || (s === 'unassessed' && counted(r)))) return false;
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
    $('#ledger').replaceChildren(...(out.length ? out : [el('p', { class: 'empty', text: T('no_rows') })]));
    // extensions
    const ext = extApplicable();
    const eo = [];
    let lastG = '';
    for (const c of ext) {
      if (c.group !== lastG) { eo.push(el('div', { class: 'subdomain', text: N(j.extensions.groups.find((g) => g.id === c.group)) })); lastG = c.group; }
      const rec = A.extensions[c.id] || (A.extensions[c.id] = {});
      const row = el('div', { class: rec.status === 'compliant' ? 'row done' : rec.status === 'noncompliant' ? 'row gap' : 'row' });
      row.append(el('div', { class: 'ref', text: c.id }),
        el('div', {}, el('p', { class: 'check', text: state.lang === 'ar' ? c.ar : c.en }), el('div', { class: 'chips' }, el('span', { class: 'chip', text: `${T('relates')} ${c.relates.join(' ')}` }), ...c.profiles.map((p) => el('span', { class: 'chip', text: p })))),
        statusSelect(rec.status || 'unassessed', (v) => { rec.status = v; row.className = v === 'compliant' ? 'row done' : v === 'noncompliant' ? 'row gap' : 'row'; save(true); renderScore(); }));
      const det = el('details', {}, el('summary', { text: T('note') }));
      det.addEventListener('toggle', () => { if (det.open && det.childElementCount === 1) det.append(evidenceBlock(rec, [['note', 'note']])); }, { once: false });
      row.append(det);
      eo.push(row);
    }
    $('#ext-ledger').replaceChildren(...eo);
  }

  function controlRow(r, j) {
    const p = perList(r);
    const rec = A.controls[r.id] || (A.controls[r.id] = {});
    const row = el('div', { class: rowClass(r), 'data-id': r.id });
    const check = r.check ? el('p', { class: 'check', text: state.lang === 'ar' ? r.check.ar : r.check.en }) : el('p', { class: 'check pending', text: T('see_official') });
    row.append(
      el('div', { class: 'ref' }, el('a', { href: `${j.pdf}#page=${r.page}`, target: '_blank', rel: 'noopener', text: r.ref }), el('small', { text: `${T('page')} ${r.page}` })),
      el('div', {}, check, el('div', { class: 'chips' }, el('span', { class: 'chip level-' + p.level, text: T('level_' + p.level) }), ...(p.profiles.length ? p.profiles.map((x) => el('span', { class: 'chip', text: x })) : [el('span', { class: 'chip', text: T('base') })]))),
      statusSelect(statusOf(r), (v) => { rec.status = v; row.className = rowClass(r); save(true); renderScore(); })
    );
    const det = el('details', {}, el('summary', { text: `${T('evidence_design')} / ${T('evidence_effect')}` }));
    det.addEventListener('toggle', () => { if (det.open && det.childElementCount === 1) det.append(evidenceBlock(rec, [['design', 'evidence_design'], ['effect', 'evidence_effect'], ['justification', 'justification'], ['note', 'note']])); });
    row.append(det);
    return row;
  }

  function bar(label, t) {
    return el('div', { class: 'bar' }, el('span', { text: label }), el('div', { class: 'track' }, el('div', { class: 'fill', style: `width:${t.pct}%` })), el('span', { class: 'num', text: t.denom ? `${t.pct}%` : '' }));
  }
  function renderScore() {
    const j = J();
    const rows = inList().filter(applicable);
    const t = tally(rows);
    const e = extTally();
    $('#seal-fill').style.strokeDashoffset = String(326.7 * (1 - t.pct / 100));
    $('#seal-number').textContent = `${t.pct}%`;
    $('#seal-caption').textContent = `${t.compliant} / ${t.denom} ${T('coverage_of')}`;
    // cover score
    const byB = j.baselines.map((b) => [N(b), tally(rows.filter((r) => r.baseline === b.id))]).filter(([, x]) => x.counted);
    $('#cover-score').replaceChildren(
      el('div', { class: 'big', text: `${t.pct}%` }),
      el('span', { class: 'muted', text: `${t.compliant} / ${t.denom} ${T('coverage_of')}` }),
      el('table', {}, el('tbody', {}, ...byB.map(([n, x]) => el('tr', {}, el('td', { text: n }), el('td', { text: `${x.compliant} / ${x.denom}` }), el('td', { text: x.denom ? `${x.pct}%` : '' }))))),
      el('span', { class: 'muted', text: `${T('extensions_title')}: ${e.compliant} / ${e.total}` })
    );
    const gates = j.gates.filter(gateActive);
    $('#cover-gates').replaceChildren(...(gates.length ? gates.map((g) => el('li', {}, el('small', { text: g.ref + ' ' }), state.lang === 'ar' ? g.ar : g.en)) : [el('li', { text: T('gates_none') })]));
    // score section
    const doms = j.domains.filter((d) => rows.some((r) => r.domain === d.id));
    $('#score-body').replaceChildren(
      el('div', { class: 'counts' },
        el('div', {}, el('b', { text: String(t.denom) }), el('span', { text: T('score_applicable') })),
        el('div', {}, el('b', { text: String(t.compliant) }), el('span', { text: T('status_compliant') })),
        el('div', {}, el('b', { text: String(t.noncompliant + t.unassessed) }), el('span', { text: T('score_gaps') })),
        el('div', {}, el('b', { text: String(t.na) }), el('span', { text: T('status_na') })),
        el('div', {}, el('b', { text: String(t.exception) }), el('span', { text: T('status_exception') })),
        el('div', {}, el('b', { text: String(t.inherited) }), el('span', { text: T('status_inherited') }))),
      el('h3', { text: T('score_by_baseline') }), el('div', { class: 'bars' }, ...byB.map(([n, x]) => bar(n, x))),
      el('h3', { text: T('score_by_domain') }), el('div', { class: 'bars' }, ...doms.map((d) => bar(`${d.ref}. ${N(d)}`, tally(rows.filter((r) => r.domain === d.id))))),
      el('h3', { text: T('score_extensions') }), el('div', { class: 'bars' }, bar(T('extensions_title'), { pct: e.pct, denom: e.total }))
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
  const stem = () => `${state.jur}-${state.list}-${(A.cover.name || 'assessment').replace(/[^\w\u0600-\u06FF-]+/g, '_')}`;
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
    download(`${stem()}.csv`, '\ufeff' + lines.join('\n'), 'text/csv;charset=utf-8');
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
    o.push(`## ${T('controls_title')}`, '', `| ${ar ? 'المرجع' : 'Ref'} | ${T('page')} | ${ar ? 'المستوى' : 'Level'} | ${ar ? 'الحالة' : 'Status'} | ${T('evidence_design')} | ${T('evidence_effect')} | ${T('note')} |`, '| --- | --- | --- | --- | --- | --- | --- |');
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
      } catch (e) { $('#export-status').textContent = T('load_error'); }
    };
    reader.readAsText(file);
  }

  function switchList(l) {
    state.list = l; state.baseline = 'all'; state.onlyGaps = false; $('#only-gaps').checked = false;
    A = load(); renderAll();
  }
  function renderAll() {
    renderStatic();
    $('#include-entity').checked = !!A.includeEntity;
    renderCover(); renderProfiles(); renderLedger(); renderScore();
    $('#saved').textContent = A.updated ? `${T('saved_local')} ${A.updated.slice(0, 16).replace('T', ' ')}` : '';
  }

  // Wiring
  $('#lang-switch').addEventListener('click', () => { state.lang = state.lang === 'ar' ? 'en' : 'ar'; store.set('checklists:lang', state.lang); renderAll(); });
  $('#search').addEventListener('input', (e) => { state.search = e.target.value; renderLedger(); });
  $('#show-inherited').addEventListener('change', (e) => { state.showInherited = e.target.checked; renderLedger(); });
  $('#only-gaps').addEventListener('change', (e) => { state.onlyGaps = e.target.checked; renderLedger(); });
  $('#include-entity').addEventListener('change', (e) => { A.includeEntity = e.target.checked; save(true); renderLedger(); renderScore(); });
  $('#btn-save').addEventListener('click', () => download(`${stem()}.json`, JSON.stringify(A, null, 1), 'application/json'));
  $('#file-load').addEventListener('change', (e) => { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; });
  $('#btn-csv').addEventListener('click', exportCsv);
  $('#btn-md').addEventListener('click', exportMd);
  $('#btn-print').addEventListener('click', () => window.print());
  $('#btn-clear').addEventListener('click', () => { if (window.confirm(T('clear_confirm'))) { store.del(key()); A = blank(); renderAll(); $('#export-status').textContent = T('cleared'); } });

  A = load();
  renderAll();
})();
