// Build: expand the assignment rules for every active jurisdiction, validate, then write
// docs/data/bundle.js for the site and checklists/<jurisdiction>/<list>.<lang>.md for GitHub.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

export const LISTS = ['onprem', 'cloud', 'vendor'];
export const LEVELS = ['app', 'hosting', 'entity'];

export function loadJurisdiction(id) {
  const dir = `data/${id}`;
  const structure = read(`${dir}/structure.json`);
  const text = read(`${dir}/text.json`);
  const rules = read(`${dir}/rules.json`);
  const checks = existsSync(join(root, `${dir}/checks.json`)) ? read(`${dir}/checks.json`) : {};
  const extensions = read(`${dir}/extensions.json`);
  const gates = read(`${dir}/gates.json`);
  const sources = read(`${dir}/sources.json`);
  return { id, structure, text, rules, checks, extensions, gates, sources };
}

// One expanded row per control with per-list level and profiles.
export function expand(j, profileIds) {
  const { structure, rules, checks } = j;
  const sub = Object.fromEntries(structure.subdomains.map((s) => [s.id, s]));
  const rows = [];
  const problems = [];
  for (const area of structure.areas) {
    const rule = rules.areas[area.id];
    if (!rule) { problems.push(`no rule for area ${area.id}`); continue; }
    for (const c of area.controls) {
      const id = `${area.baseline}:${c.id}`;
      const o = rules.controls[id] || {};
      const lists = (o.lists || rule.lists).map((x) => ({ o: 'onprem', c: 'cloud', v: 'vendor' })[x] || x);
      const per = {};
      for (const l of lists) {
        const vendor = l === 'vendor';
        const level = o.level || (vendor && rule.level_v) || rule.level;
        const profiles = o.profiles !== undefined ? o.profiles : (vendor && rule.profiles_v !== undefined ? rule.profiles_v : rule.profiles);
        if (!LEVELS.includes(level)) problems.push(`${id}: bad level ${level}`);
        for (const p of profiles) if (!profileIds.has(p)) problems.push(`${id}: unknown profile ${p}`);
        per[l] = { level, profiles };
      }
      if (!lists.length) problems.push(`${id}: assigned to no checklist`);
      const check = checks[id];
      if (check && !(check.en && check.ar)) problems.push(`${id}: check must carry en and ar`);
      rows.push({ id, ref: c.id, page: c.page, baseline: area.baseline, area: area.id, subdomain: area.subdomain, domain: sub[area.subdomain].domain, lists: per, check: check || null });
    }
  }
  return { rows, problems };
}

export function build({ write = true } = {}) {
  const project = read('data/project.json');
  const ui = read('data/ui.json');
  const profiles = read('data/profiles.json');
  const jurisdictions = read('data/jurisdictions.json');
  const profileIds = new Set(profiles.profiles.map((p) => p.id));
  const bundle = { schema: project.schema, built: 'static', project, ui, profiles, jurisdictions, data: {} };
  const problems = [];
  const outputs = {};
  for (const jur of jurisdictions.jurisdictions.filter((x) => x.status === 'active')) {
    const j = loadJurisdiction(jur.id);
    const { rows, problems: p } = expand(j, profileIds);
    problems.push(...p);
    for (const e of j.extensions.checks) {
      for (const l of e.lists) if (!LISTS.includes(l)) problems.push(`${e.id}: bad list ${l}`);
      for (const pr of e.profiles) if (!profileIds.has(pr)) problems.push(`${e.id}: unknown profile ${pr}`);
    }
    const withCheck = rows.filter((r) => r.check).length;
    bundle.data[jur.id] = {
      baselines: j.structure.baselines.map((b) => ({ ...b, title_ar: j.text.baselines?.[b.id]?.title_ar || '' })),
      domains: j.structure.domains.map((d) => ({ ...d, title_ar: j.text.domains[d.id]?.title_ar || '' })),
      subdomains: j.structure.subdomains.map((s) => ({ ...s, title_ar: j.text.subdomains[s.id]?.title_ar || '' })),
      areas: j.structure.areas.map((a) => ({ id: a.id, baseline: a.baseline, subdomain: a.subdomain, ref: a.ref, title_en: a.title_en, page: a.page, ...(j.text.areas[a.id] || {}) })),
      controls: rows,
      extensions: j.extensions,
      gates: j.gates.gates,
      sources: j.sources,
      pdf: jur.frameworks[0].url,
      checks_written: withCheck,
      controls_total: rows.length
    };
    outputs[jur.id] = { jur, j, rows };
  }
  if (problems.length) throw new Error(problems.join('\n'));
  const files = {};
  files['docs/data/bundle.js'] = `window.CHECKLISTS = ${JSON.stringify(bundle)};\n`;
  for (const [id, { jur, j, rows }] of Object.entries(outputs)) {
    for (const list of LISTS) for (const lang of ['en', 'ar']) {
      files[`checklists/${id}/${list}.${lang}.md`] = markdown({ jur, j, rows, list, lang, ui, profiles, bundle: bundle.data[id] });
    }
  }
  if (write) for (const [p, content] of Object.entries(files)) {
    mkdirSync(join(root, p, '..'), { recursive: true });
    writeFileSync(join(root, p), content);
  }
  return { bundle, files };
}

const t = (ui, key, lang) => ui[key][lang];
const listKey = { onprem: 'list_onprem', cloud: 'list_cloud', vendor: 'list_vendor' };

function markdown({ jur, j, rows, list, lang, ui, profiles, bundle }) {
  const L = (k) => t(ui, k, lang);
  const ar = lang === 'ar';
  const name = (o) => (ar ? o.title_ar || o.ar : o.title_en || o.en);
  const pmap = Object.fromEntries(profiles.profiles.map((p) => [p.id, p]));
  const inList = rows.filter((r) => r.lists[list]);
  const used = new Set();
  for (const r of inList) for (const p of r.lists[list].profiles) used.add(p);
  const out = [];
  if (ar) out.push('<div dir="rtl" lang="ar">', '');
  out.push(`# ${L(listKey[list])}: ${ar ? jur.ar : jur.en}`, '');
  out.push(ar ? jur.frameworks.map((f) => f.ar).join(' و') : jur.frameworks.map((f) => f.en).join(', '), '');
  out.push(`## ${L('cover_title')}`, '');
  out.push(`| ${ar ? 'الحقل' : 'Field'} | ${ar ? 'القيمة' : 'Value'} |`, '| --- | --- |');
  for (const k of ['cover_name', 'cover_desc', 'cover_owner', 'cover_techowner', 'cover_assessor', 'cover_date', 'cover_golive', 'cover_criticality', 'cover_data', 'cover_users']) out.push(`| ${L(k)} | |`);
  out.push('', `### ${L('cover_flags')}`, '');
  for (const k of ['flag_major_change', 'flag_significant', 'flag_new_otp', 'flag_foreign_branch']) out.push(`- [ ] ${L(k)}`);
  out.push('', `### ${L('cover_coverage')}`, '', L('md_cover_score_note'), '');
  out.push(`| ${ar ? 'الضوابط الأساسية' : 'Baseline'} | ${L('score_applicable')} | ${L('status_compliant')} | ${L('status_noncompliant')} | ${L('status_na')} | ${L('status_exception')} | % |`, '| --- | --- | --- | --- | --- | --- | --- |');
  for (const b of j.structure.baselines) {
    const n = inList.filter((r) => r.baseline === b.id && r.lists[list].level !== 'entity').length;
    if (n) out.push(`| ${ar ? bundle.baselines.find((x) => x.id === b.id).title_ar : b.title_en} | ${n} | | | | | |`);
  }
  out.push(`| ${L('score_overall')} | ${inList.filter((r) => r.lists[list].level !== 'entity').length} | | | | | |`);
  out.push('', `### ${L('cover_gates')}`, '');
  for (const g of j.gates.gates.filter((g) => !g.when.lists || g.when.lists.includes(list))) out.push(`- [ ] ${g.ref}: ${ar ? g.ar : g.en}`);
  out.push('', `### ${L('cover_signoff')}`, '');
  out.push(`| ${ar ? 'الدور' : 'Role'} | ${ar ? 'الاسم' : 'Name'} | ${ar ? 'التاريخ' : 'Date'} | ${ar ? 'التوقيع' : 'Signature'} |`, '| --- | --- | --- | --- |');
  for (const k of ['signoff_business', 'signoff_security', 'signoff_risk']) out.push(`| ${L(k)} | | | |`);
  out.push('', `## ${L('md_profiles_legend')}`, '');
  for (const id of [...used].sort()) out.push(`- **${id}**: ${name(pmap[id])}. ${ar ? pmap[id].desc_ar : pmap[id].desc_en}`);
  out.push('', `## ${L('guide_levels_title')}`, '');
  for (const lv of LEVELS) out.push(`- **${lv}**: ${L('level_' + lv)}. ${L('level_' + lv + '_desc')}`);
  out.push('', L('md_how'), '');
  const areas = Object.fromEntries(bundle.areas.map((a) => [a.id, a]));
  const subs = Object.fromEntries(bundle.subdomains.map((s) => [s.id, s]));
  const doms = Object.fromEntries(bundle.domains.map((d) => [d.id, d]));
  let lastB = '', lastD = '', lastS = '', lastA = '';
  for (const r of inList) {
    const a = areas[r.area], s = subs[r.subdomain], d = doms[r.domain];
    if (r.baseline !== lastB) { const b = bundle.baselines.find((x) => x.id === r.baseline); out.push('', `## ${ar ? b.title_ar : b.title_en}`); lastB = r.baseline; lastD = lastS = lastA = ''; }
    if (r.domain !== lastD) { out.push('', `### ${d.ref}. ${name(d)}`); lastD = r.domain; lastS = lastA = ''; }
    if (r.subdomain !== lastS) { out.push('', `#### ${s.ref} ${name(s)}`); lastS = r.subdomain; lastA = ''; }
    if (r.area !== lastA) {
      out.push('', `**${a.ref} ${name(a)}** (${L('page')} ${a.page})`, '', ar ? a.summary_ar : a.summary_en, '');
      out.push(`| ${ar ? 'المرجع' : 'Ref'} | ${L('page')} | ${ar ? 'المستوى' : 'Level'} | ${ar ? 'الأنماط' : 'Profiles'} | ${L('check')} | ${ar ? 'الحالة' : 'Status'} | ${ar ? 'الدليل' : 'Evidence'} |`, '| --- | --- | --- | --- | --- | --- | --- |');
      lastA = r.area;
    }
    const pl = r.lists[list];
    out.push(`| ${r.ref} | [${r.page}](${bundle.pdf}#page=${r.page}) | ${pl.level} | ${pl.profiles.length ? pl.profiles.join(' ') : L('base')} | ${r.check ? (ar ? r.check.ar : r.check.en) : ''} | [ ] | |`);
  }
  out.push('', `## ${L('extensions_title')}`, '', L('extensions_note'), '');
  for (const g of j.extensions.groups) {
    const items = j.extensions.checks.filter((c) => c.group === g.id && c.lists.includes(list));
    if (!items.length) continue;
    out.push(`### ${ar ? g.ar : g.en}`, '');
    for (const c of items) out.push(`- [ ] **${c.id}** (${c.profiles.length ? c.profiles.join(' ') : L('base')})${ar ? ' ' : ': '}${ar ? c.ar : c.en} ${L('relates')} ${c.relates.join(ar ? ' و' : ', ')}.`);
    out.push('');
  }
  out.push(`## ${L('sources_title')}`, '');
  for (const s of j.sources.sources) out.push(`- [${ar ? s.ar : s.en}](${s.url}): ${ar ? s.use_ar : s.use_en}`);
  out.push('', ar ? j.sources.counts_note_ar : j.sources.counts_note_en, '');
  out.push(L('footer_disclaimer'), '');
  if (ar) out.push('</div>', '');
  return out.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { bundle } = build();
  for (const [id, d] of Object.entries(bundle.data)) console.log(`${id}: ${d.controls_total} controls, ${d.checks_written} with control level checks, ${d.extensions.checks.length} extension checks`);
}
