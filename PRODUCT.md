# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Security architects and the people who review an application or a vendor engagement with them (information security, risk, the business owner) in financial institutions of the Arabian Gulf, Kuwait first. The job: assess one application or one vendor engagement against the regulator's controls, record the design evidence and the effectiveness evidence per control, and come out with a coverage figure that the regulator's own assessment logic would accept. A second audience reads the printed cover page: the sign-off roles and, later, the regulator's assessor.

They work in long sessions at a desk, on a laptop or a wide monitor, usually in the browser beside the PDF of the regulation and the evidence folder; the same assessment is reopened across days. Arabic and English readers in equal measure; Arabic readers work in right to left.

## Product Purpose

Miyar (معيار, the standard or criterion) turns a regulator's control catalogue into three working checklists per jurisdiction: an on-premises application, a cloud application, and a vendor or third party. Profile overlays switch controls on and off (payments, customer digital channel, personal data, AI, cloud deployment model, vendor engagement type), so one checklist fits any application without copies. The cover page carries the application name, the business description, owners, criticality, data classification, regulator triggers, the coverage score by baseline, the regulator's approval gates that the answers trigger, and sign-off. Success is an assessment the assessor can defend: every applicable control answered with evidence, every gate known before go-live, and the score reproducible from the data.

Build order, stated by the owner: Kuwait (CBK CORF) first, then Saudi Arabia, then the rest of the Arabian Gulf states, then the United States, then Iraq, then Egypt, then GDPR, then one unified checklist. Kuwait is live; the others are planned phases shown in the product.

## Positioning

Every control of the regulator's catalogue, assigned to the checklists it belongs to and tagged with the level it is evidenced at (application, hosting, entity), with a control-level check written in both languages and a link to the control's page in the official PDF. Entity-level controls are shown as inherited and left out of the score unless included, which is what makes the score honest for one application rather than for the whole institution. Post quantum cryptography is base in every checklist, and a separate set of architecture extension checks (crypto agility, design artefacts, AI application safety) is scored apart from the regulator's figure and never presented as the regulator's wording.

## Operating Context

- One checklist is one application or one vendor engagement; the work is saved in the browser and can be saved as a JSON file, reopened, exported as CSV or Markdown, or printed (the cover page prints; the controls print on request).
- The regulator assesses each control as compliant or non-compliant with no partial credit; not applicable needs a written justification and regulator approval; an exception needs a formal request with compensating controls. The product mirrors this: six statuses (not assessed, compliant, non-compliant, not applicable, exception requested, inherited), two evidence fields per control (design, effectiveness), a justification and a note.
- The control ledger is long: 653 to 674 rows for an application, 533 for a vendor, grouped domain, sub-domain, area, with the area's own summary; filters by baseline, search, gaps only, show inherited.
- The page is static (GitHub Pages, no build step at runtime): one HTML page, one stylesheet, one script, one data bundle, self hosted fonts, no external resource. Tests forbid external scripts and stylesheets.

## Capabilities and Constraints

- Bilingual Arabic and English, switchable at any time; Arabic is right to left. Every string in the interface has both languages and the build fails otherwise. Arabic sentences end with one period and join clauses with connectives; no Arabic commas.
- Writing rules the owner enforces across all his work: no Unicode dashes anywhere; "Arabian Gulf" / «الخليج العربي» only; no attribution to any AI tool anywhere; no reference to his employer and no named bank as a sample or example.
- Data: `data/` is the source of truth (structure, text, rules, checks, extensions, gates, sources); `docs/data/bundle.js` is generated and tests compare it byte for byte with a fresh build.
- Numbers in the checks are regulatory parameters and must survive translation (tested).
- Pending product decisions: phases 2 to 8 are planned, not built; a KSA phase will reuse the owner's Rawshan (NCA ECC) data. [Stated by the owner.]
- No account, no server, no analytics; the browser's storage holds the work and may be unavailable, so every storage call is guarded.

## Brand Commitments

- Name: Miyar / معيار, used as the wordmark in both scripts. Domain miyar.3li.info. Repository SiteQ8/Miyar. Author Ali AlEnezi, MIT licence.
- Typeface already in the product: Readex Pro (OFL), self hosted, covering Arabic and Latin; it is the one face that carries both scripts at the same colour, so any replacement face must cover Arabic with equal quality.
- The owner's wider family of tools shares a ruled, register-like audit aesthetic (Sadu, the CORF register this product reuses data from). This is context, not a pin: the owner asked for the design to be developed. [Inferred from the owner's other projects; treat as context.]
- Footer line: "An open source project by Ali AlEnezi" and the disclaimer that the product is not affiliated with or endorsed by any regulator.

## Evidence on Hand

- All 875 CORF controls with bilingual check wording, area summaries, the assignment rules, 17 extension checks, 10 approval gates: `data/kw/`.
- The official PDF of the framework (linked per page, not bundled).
- Printable Markdown checklists under `checklists/kw/`.
- No screenshots, logos or imagery exist beyond `docs/favicon.svg`. No customer, testimonial or benchmark exists and none may be invented.

## Product Principles

1. The score must be defensible: binary per control, entity level excluded by default, not applicable only with justification.
2. The official text stays with the regulator: the product shows its own wording and links to the page; it never presents its analysis as the regulator's.
3. Arabic is a first language of the product, not a translation layer: equal typographic quality, right to left as a native layout.
4. Everything the user records is theirs and local: save, open, export, print, clear, with nothing sent anywhere.
5. The tool disappears into the task: long ledgers must stay scannable in hour-long sessions.

## Accessibility & Inclusion

Keyboard operable controls with visible focus, labels on every field, right to left correctness for Arabic, print styles for the cover page. No formal standard has been stated by the owner.
