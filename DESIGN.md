---
name: Miyar
description: Bilingual security architecture checklists drawn as an engineering drawing sheet with a title block.
colors:
  ink: "#1b2430"
  focus: "#1b2430"
  red: "#b3261e"
  ink-press: "#0f141b"
  frame: "#e4e8ec"
  sheet: "#ffffff"
  well: "#f4f6f8"
  active: "#eceff2"
  line: "#c9d0d6"
  rule: "#dde2e7"
  control: "#c5ccd3"
  muted: "#5b6670"
typography:
  figure:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: "36px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "30px"
    letterSpacing: "-0.01em"
  section:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  meta:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "14px"
  wordmark:
    fontFamily: "Miyar Figures, Readex Pro, Segoe UI, Tahoma, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.01em"
rounded:
  radius: "0"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "20px"
  s-6: "24px"
  s-8: "32px"
  s-10: "40px"
components:
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "24px 32px 24px"
  sidebar:
    backgroundColor: "{colors.frame}"
    textColor: "{colors.ink}"
    width: "240px"
    padding: "20px 16px 16px"
  button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "0 12px"
    height: "32px"
  button-hover:
    backgroundColor: "{colors.well}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "0 12px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.ink-press}"
  field-input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "0 8px"
    height: "32px"
  title-block-cell:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 12px 12px"
  status-mark:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.radius}"
    size: "10px"
  status-mark-compliant:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    size: "10px"
  status-mark-noncompliant:
    backgroundColor: "{colors.red}"
    rounded: "{rounded.radius}"
    size: "10px"
  picker-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "0 8px"
    height: "34px"
  picker-row-current:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  view-link:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "0 8px"
    height: "34px"
  view-link-current:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  view-link-hover:
    backgroundColor: "{colors.active}"
    textColor: "{colors.ink}"
  tab:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    padding: "0 0 8px"
  tab-selected:
    textColor: "{colors.ink}"
  ledger-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 0"
    height: "44px"
  coverage-track:
    backgroundColor: "{colors.frame}"
    rounded: "{rounded.radius}"
    height: "8px"
  coverage-fill:
    backgroundColor: "{colors.ink}"
---

# Design System: Miyar

## Overview

**Creative North Star: "The Drawing Sheet"**

Miyar is drawn as the security architect's own drawing set. The screen is a white sheet inset in a drafting grey frame. The cover page is the sheet's title block, a grid of labelled cells on 1px lines; the control ledger is the sheet's schedule; the coverage figure is stamped in the title block's last cell and repeated in the sidebar and the phone strip. The people who use it are security architects in financial institutions of the Arabian Gulf, in long desk sessions, in Arabic or English, so the sheet is dense, quiet and the same in both scripts.

Everything is ink on a sheet at one device pixel. Hierarchy comes from type size, weight and tone (ink against muted), never from colour or chrome. The palette is an ink, five greys between the frame and the sheet, and one revision red that marks what still needs an answer. Surfaces are flat: no shadow, no gradient, depth is a tint and a line. Status is read from the shape of a small square mark before its colour. Figures are tabular, end aligned and written as "x of y" so a count is never a bare number.

The world refuses the compliance dashboard arrangement: no grey ground with white cards, no coloured sidebar pill, no donut, no blue accent on chrome. Motion is restricted to the press of a button, the growth of a coverage bar and the turn of a chevron; views switch without transition and the ledger never reflows when a status changes.

**Key Characteristics:**
- A white sheet with a 1px line border inset in a drafting grey frame; the sidebar sits directly on the frame.
- One typeface for both scripts (Readex Pro) with a digits-only figures face (Miyar Figures) for every number.
- A six-step type ramp (32, 24, 16, 14, 12, 11) and an eight-step spacing scale (4 to 40).
- Ink for text, lines and fills; revision red only for what is unresolved.
- Status marks that read by shape: outline, filled ink, filled red, hatched, half, dotted.
- The title block: cells on a 1px line grid, a focus bracket on the cell, the coverage figure in the last cell.
- Flat surfaces, square corners, 1px lines, 32px controls, 44px ledger rows.
- Right to left as a native layout with logical properties; inputs follow their own text direction.

## Colors

A near-monochrome palette held as custom properties on :root, light only (color-scheme: light): one ink, one revision red, and greys that step from the frame to the sheet.

### Primary
- **Ink** (#1b2430): all text, the sheet's own strokes (mark borders, chevrons, the revision triangles, the calendar mark), and every fill: the compliant mark, the coverage bar, the primary button, the selection highlight, the selected tab's underline. **Ink press** (#0f141b) is the primary button's hover, one step darker. The current sidebar row and the selected tab are ink text at weight 500; ink is the only colour that carries emphasis.
- **Focus bracket** (#1b2430, token focus): the 2px focus outline, offset 2px outside a control and 2px inside a title block cell. It holds the same value as ink but is its own token so focus can be retuned alone.

### Secondary
- **Revision red** (#b3261e): the non-compliant mark (fill and border) and the reference link of a gap row, nothing else. It never fills a surface, a bar, a heading or a button; the destructive clear button is a default button whose confirm step carries the danger.

### Neutral
- **Frame** (#e4e8ec): the drafting grey ground behind the sheet. The sidebar, the phone top bar, the coverage strip and the phone menu sheet sit directly on it; it is also the track of the coverage bar inside the sheet.
- **Sheet** (#ffffff): the page, every title block cell, every control, and the current row of the sidebar, which is white on the frame.
- **Well** (#f4f6f8): button hover.
- **Active** (#eceff2): hover of sidebar rows (checklist picker rows and view links).
- **Line** (#c9d0d6): the sheet's border, the title block grid (1px gaps on line), the sign-off lines, the sidebar track's border and the resting underline of a link.
- **Rule** (#dde2e7): whisper rules inside the sheet: the top of each ledger row, profile rows, the tabs baseline, the by-baseline table and the footer rule.
- **Control** (#c5ccd3): the 1px border of buttons, selects, inputs and textareas.
- **Muted** (#5b6670): secondary text: labels, hints, meta lines, the second script of the wordmark, view links and tabs at rest, disabled buttons, placeholder text; also the hover border of a button.

### Named Rules
**The Revision Red Rule.** Red marks a gap and nothing else: the non-compliant mark and the reference of a gap row. Red never tints a surface, a bar, a row, a button, a gate triangle or chrome.

**The One Hue Rule.** The stylesheet carries one chromatic hue, revision red. Everything else is the ink or a grey between the frame and the sheet. There is no blue, no green, no amber, and no second accent.

**The Shape Before Colour Rule.** Every status is told apart by the shape of its mark (outline, fill, hatch, half, dotted) before its colour. Colour confirms; it is never the message.

## Typography

**Display Font:** Readex Pro (self hosted, OFL, variable 160 to 700, Arabic and Latin), with Segoe UI, Tahoma, system-ui and sans-serif as fallbacks.
**Body Font:** Readex Pro, the same face.
**Figures Font:** Miyar Figures, a digits-only subset of IBM Plex Sans (OFL) carrying 0 to 9 and the percent sign at weights 400, 500 and 600. It sits first in the font stack so every digit falls to it and every letter falls through to Readex Pro.

**Character:** one humanist sans carrying both scripts at the same size, weight and colour, with numbers in a tabular face so columns of counts align on one margin. Headings tighten slightly (-0.01em), the coverage figure a little more (-0.02em). Weights used: 400, 500 for emphasis, 600 for headings.

### Hierarchy
- **Figure** (500, 32px, 36px line, -0.02em): the coverage percentage in the sidebar cell and in the title block's coverage cell.
- **Title** (600, 24px, 30px line, -0.01em): the view title, one per sheet, with the jurisdiction and framework as a 12px muted subtitle on the same baseline.
- **Section** (600, 16px, 22px line, -0.01em): headings inside a view and the domain headings of the ledger.
- **Body** (400, 14px, 20px line): checks, cell values, controls, the reference of a ledger row, prose. Measures: 70ch for prose and intros, 80ch for the check column and area summaries, 60ch for definitions.
- **Label** (400, 12px, 16px line): cell labels, the schedule head, sidebar labels, meta lines, "x of y" lines, bar numbers, tab-adjacent notes, always sentence case.
- **Meta** (400, 11px, 14px line): hints under a field, the saved stamp, the page number under a reference, the 0 and the denominator at the ends of the cover bar.
- **Wordmark** (600, 20px, 24px line, -0.01em): the product name in the sidebar, with the other script beside it at body size, weight 400, muted, on the same baseline; section size (16px) in the phone top bar.

Emphasis is weight 500, not colour: the current sidebar row, the selected tab, an area title, a sub-domain heading, and the figures of the score counts cells (section size on a 24px line at 500). One size sits off the ramp in the build: the wordmark at 20px. The digit inside a revision triangle is an 8px SVG glyph, part of the mark rather than text. New surfaces pick from the ramp.

### Named Rules
**The Figures Rule.** Every number is set in the figures face, tabular, on one hard end margin, written as "x of y" with the denominator visible; a percentage follows its count and the percent sign stays attached to the figure.

**The Sentence Case Rule.** A label is 12px muted sentence case above its value. There is no uppercase, no letter-spaced eyebrow, no kicker anywhere on the sheet.

**The One Face Rule.** Readex Pro sets both scripts. Arabic gets the same size, weight and colour as English, and the layout mirrors rather than translates.

## Layout

Desktop is a two-column grid: a 240px sidebar and a fluid sheet column, at least the viewport tall. The sidebar is sticky, the full viewport height, scrolls on its own, and is padded 20px 16px 16px with 20px gaps between its blocks, in this order: wordmark and tagline, jurisdiction select, checklist picker, view links, a flexible spacer, the coverage cell, then the language button and the saved stamp. The sheet is white with a 1px line border and square corners, 8px from the frame on three sides and flush with the sidebar, padded 24px 32px, at least calc(100vh - 16px) tall, and laid out as a column whose footer is pushed to the bottom edge with margin-top auto. The title row puts the 24px title and the 12px subtitle on one baseline, 20px above the view. Inside a view, a section heading sits 32px above and 12px below its content.

The spacing scale is 4, 8, 12, 16, 20, 24, 32, 40. As used: 4 inside cells and between a label and its value; 8 between controls, as row padding and list gaps; 12 as control padding and under headings; 16 as sidebar side padding and under the toolbar; 20 between sidebar blocks and under the title row; 24 as sheet padding and between sections; 32 as the sheet's side padding and above headings; 40 as the column gap of two-column views.

Grids observed: the title block is six columns with 1px gaps on the line colour (name spans 3, description spans 3 and 2 rows, owner, technology owner and assessor one each, dates, criticality and data one each, users 2, regulator triggers the full width, coverage 2 beside gates 4) and a three-column sign-off strip joined underneath; the guide is 1.15fr and 1fr with 24px 40px gaps; the score is a six-cell counts block (the title block grammar, label over figure) over a 1fr and 1.4fr grid with 24px 40px gaps; profiles fill columns of at least 300px with a 32px column gap; a ledger row is 10px mark, 64px reference, fluid check held to 80ch, 188px status select with 4px 12px gaps, 8px vertical padding, 44px minimum height and a 1px rule on top, under a head row (reference, check, status) at 12px muted with a 1px line beneath; a score bar is a label column (150px to 240px), the track, and a 128px end-aligned count.

Phone and narrow screens (900px and under): the frame becomes a block. A 48px sticky top bar on the frame carries the menu button, the wordmark at section size and the language button; a coverage strip under it shows the figure at 14px weight 500, a 6px track and "x of y" at 12px. The sidebar hides and opens from the menu button as a full-screen menu sheet (fixed, frame background, 16px padding, body scroll locked, a close button row, the brand hidden). The sheet drops its margin and border and is padded 20px 16px 24px at a minimum of calc(100vh - 48px). The title block collapses to two columns (3, 4 and 2 spans become 2, half cells stay 1, row spans release); regulator triggers and sign-off go to one column; the counts block goes to two columns like every block; the tabs wrap onto further rows rather than scrolling; the ledger row becomes mark, 56px reference and check, with the status select dropping to its own line from the reference column and the head row losing its status cell; bars become a 90px label, a double-width track and a 96px count; the score grid stacks; the title row stacks; the search field runs full width.

Print: 14mm page margins, white body at 11pt. Chrome, toolbar, tabs, actions, status lines, the skip link and evidence details are hidden; only the cover page and the score print, the score on a new page with 12mm above it. The title row stacks (title, then the framework line). Every cell label prints in both scripts, the current language at the start edge and the other at the end edge of the same line, wrapping under it when the cell is tight; the sign-off lines do the same. Cells, the sign-off strip, the counts block and bars do not break across pages; the title block returns to six columns; the footer sits 10mm below; cells print white with transparent inputs and no select chevron; an empty date cell prints blank and the browser's own date controls are hidden; textareas print without a resize grip; links print as plain ink.

### Named Rules
**The Full Sheet Rule.** The sheet always runs the full height of the viewport with its footer pinned to the bottom edge, so a short view still shows a complete sheet, never a card floating in the frame.

**The Grid Never Moves Rule.** A status change restyles its row in place (the mark, the reference colour, the select value) and re-renders only the score. The ledger does not reflow. Opening a row's evidence is the one thing that grows a row.

## Elevation & Depth

The system is flat. There is no box-shadow anywhere in the stylesheet and no gradient. Depth is tone and line: the white sheet lifts off the frame by its tone and a 1px line border; the current sidebar row is white on the frame, the same lift at row scale; hover is one tint darker (well on buttons, active on sidebar rows); the title block's cells are white tiles separated by 1px of line. Focus is a 2px ink bracket, not a glow. The two patterns in the system are drawn, not painted: the hatch of the exception mark is a 4px SVG data URI of 1px diagonal lines in ink, and the half of the not-applicable mark is a pseudo-element covering the inline-start half.

### Named Rules
**The Flat Sheet Rule.** No shadow at rest or on any state, no gradient. A surface that must read as above another is white on the frame with a 1px line, or one tint darker on hover.

## Shapes

Rectangles with square corners everywhere: the radius token is 0 on the sheet, controls, sidebar rows, tracks, the title block, the counts block and the status marks. Every line is 1px: borders, rules, the title block's grid gaps (1px of line between white cells), the sign-off lines, link underlines. The only 2px strokes are the focus bracket and the selected tab's underline. Squares are 10px for marks, 12px for the calendar mark of a date cell (a box with a head line) and 14px for checkboxes and radios. The only non-rectangular shapes are the revision triangle (18 by 17, a 1px ink outline carrying the gate's number) beside an open gate and two chevrons: the select's 12px ink stroke chevron with square caps and the evidence summary's 6px rotated box. The hatch is a 45-degree 1px line on a 4px repeat.

### Named Rules
**The Device Pixel Rule.** Every line is 1px. A heavier stroke appears only to say "here": the 2px focus bracket and the 2px underline of the selected tab.

## Components

Controls are drafting instruments: 32px tall, 1px bordered, square, white, and quiet until pressed.

### Buttons
- **Shape:** square corners, 32px tall, padded 0 12px, inline-flex with an 8px gap, no wrapping.
- **Default:** white, ink text, 1px control border. Hover (only when the device has hover and a fine pointer): well background, muted border. Press: scale(0.98) over 160ms on the ease-out curve; background and border change over 160ms. Disabled: muted text, default cursor. Under prefers-reduced-motion every transition collapses to 0ms.
- **Primary** (the save assessment file button, one per view at most): ink background, white text, ink border; hover darkens to ink press.
- **Destructive** (the clear button): the default button; the confirm dialog carries the danger, not the colour.
- The file-load label is styled as a button. In the sidebar footer the language button runs full width with centred text. In the phone top bar buttons tighten to 0 8px padding around a 16px inline SVG icon.

### Inputs / Fields
- **Style:** 32px tall, padded 0 8px, 1px control border, square corners, white, ink text, muted placeholder. The search field grows to 360px and runs full width on the phone.
- **Select:** native appearance removed; a 12px ink chevron (1.5px stroke, square caps) as an SVG data URI 8px from the end edge (right in LTR, left in RTL) with 28px end padding.
- **Textarea** (evidence): 56px minimum height, padded 4px 8px, vertical resize, body size.
- **Date:** the native date input with its picker indicator redrawn as the 12px calendar mark in ink; an empty date carries the class empty so it prints blank.
- **Checkbox and radio:** native, 14px, accent ink.
- **Focus:** the 2px ink outline offset 2px (the global focus-visible rule).
- **Inside a title block cell:** no border, transparent background colour (the select keeps its chevron), 24px line height, no outline of its own; the cell is bracketed instead. Text entries are single-line textareas that wrap and grow with their content (field-sizing: content, with a script fallback), so a drawn cell never truncates what is written in it; the description textarea grows the same way from 72px.
- **Error / Disabled:** no error state exists; a disabled option in the jurisdiction select is native.

### Status marks
A 10px square with a 1px ink border, square, white, read by shape before colour: not assessed is the outline; compliant is filled ink; non-compliant is filled red with a red border; exception requested is hatched (the 4px SVG diagonal in ink); not applicable is half filled, ink on the inline-start half; inherited has a dotted border. In a ledger row the mark sits 5px down to rest on the first line; in the guide it sits beside each status name. The mark is aria-hidden and the status select carries the accessible name.

### Title block
- **Grid:** six columns with 1px gaps on the line colour, a 1px line border, square, clipped. Cells are white, padded 8px 12px 12px, at least 64px tall, a column with 4px gaps: a label row (the 12px muted label, and on the printed sheet the other script's label at the opposite edge) over the value (a borderless input on a 24px line) and an optional 11px hint.
- **Focus:** a 2px ink outline inset 2px on focus-within, so the cell, not the input, is bracketed.
- **Spans:** 3, 2, 4, the full width, and 2 rows. The regulator triggers cell holds a two-column list of checkboxes with 8px 16px gaps.
- **Coverage cell:** label, the 32px figure, "x of y of applicable controls compliant" at 12px muted, an 8px track on the frame tint with the ink fill, the ends 0 and the denominator at 11px, then a by-baseline table at 12px with 1px rule rows and end-aligned counts.
- **Gates cell:** a list of rows 8px apart, each an 18 by 17 revision triangle (1px ink outline, the gate's number inside at 8px) beside a 12px muted reference over the body text; the "no gate" row is muted with no triangle.
- **Sign-off:** a three-column strip joined under the block with no top border; each cell carries the label, the role name and three ruled lines (name, date, signature) on a 28px line at 12px muted with a 1px line under each; printed, each line carries both scripts at its two ends.
- **File block** (export view): the same cell grammar at three columns, 56px minimum height, values at body size.

### Navigation
- **Sidebar rows** (checklist picker and view links): 34px minimum height, padded 0 8px and bled 8px into the sidebar gutter, square. A picker row is a radio and its label; the checked row is white on the frame at weight 500. A view link is muted text with no underline; the current link (aria-current=page) is white, ink, weight 500; hover is the active tint with ink text.
- **Sidebar labels:** 12px muted, 4px above a full-width 32px select.
- **Tabs** (the baseline filter): a row with 20px gaps on a 1px rule; each tab is text only, muted, padded 0 0 8px, pulled 1px down over the rule with a 2px transparent underline; the selected tab is ink text, ink underline, weight 500; hover turns the text ink. The row wraps onto further rows when tight, so no tab is ever clipped.
- **Phone:** the sidebar becomes the full-screen menu sheet opened from the top bar's menu button (aria-expanded, Escape closes, focus moves to the close button and back).
- **Skip link:** offscreen until focused, then 8px from the edge in a white box with a 1px ink border and 8px 12px padding.

### Ledger row
The schedule of the sheet. A head row (reference, check, status) at 12px muted with a 1px line beneath, then rows on a grid of 10px mark, 64px reference, fluid check held to 80ch and 188px status select on the end margin, with 4px 12px gaps, 8px vertical padding, 44px minimum height and a 1px rule on top. The reference is a body-size link without underline (underlined on hover) with the page number under it at 11px muted; in a gap row (non-compliant, or not assessed and counted) the reference turns red. The check is body text; under it a 12px muted meta line carries the level and the profiles, then the evidence details: a summary with a 6px chevron that turns from pointing along the reading direction to pointing down over 160ms ease-out (mirrored in RTL) and opens a grid of textareas in columns of at least 220px. Ledger headings: the domain at section size 24px above, the sub-domain at weight 500 16px above, the area title at weight 500 with its summary at 12px muted within 80ch.

### Coverage figure
One variable drawn the same way everywhere: the figure, an ink bar on a track, and "x of y". The sidebar cell stacks label, 32px figure, a 10px white track with a 1px line border, and "x of y compliant" at 12px muted, with 4px gaps. The phone strip puts the figure at 14px weight 500 beside a 6px track and the count. The title block cell adds the 0 and denominator ends and the by-baseline table. The fill's width animates over 240ms ease-out. The score view adds a six-cell counts block in the title block grammar (a 12px muted label over a section-size figure at weight 500, white cells on a 1px line grid) and bar rows (label, track, end-aligned 12px count and percent) grouped per baseline and per domain.

### Wordmark
The product name at 20px weight 600 with the other script beside it at body size, weight 400, muted, baseline aligned with an 8px gap, and a 12px muted tagline 4px below. The phone top bar shows one script at section size.

## Do's and Don'ts

### Do:
- **Do** set every number in the figures face, tabular and end aligned, written as "x of y"; keep the percent sign attached to its figure.
- **Do** draw a new surface as white cells on a 1px line grid (1px gaps on the line colour) rather than as cards on a tinted ground.
- **Do** give every control the 32px height, the 1px control border and square corners; gate hover behind hover and a fine pointer; press at scale(0.98) over 160ms ease-out; honour prefers-reduced-motion.
- **Do** add a new status as a new mark shape first (outline, fill, hatch, half, dotted) and a colour second.
- **Do** mirror with dir=rtl and logical properties; give text inputs and textareas dir=auto so each follows its own content; flip chevrons and anchor bar fills to the inline end.
- **Do** bracket focus with the 2px ink outline, 2px outside a control and 2px inside a title block cell.
- **Do** keep labels at 12px muted sentence case above their value, and prose within 70ch.

### Don't:
- **Don't** build the compliance dashboard: no grey ground with white cards, no coloured sidebar pill, no donut, no blue accent on chrome.
- **Don't** add a shadow or a gradient at rest or on any state; the hatch (a 4px SVG) is the only pattern.
- **Don't** use uppercase labels, letter-spaced eyebrows or kickers.
- **Don't** tint a row, a bar, a button or a surface red; red is for the non-compliant mark and a gap row's reference only.
- **Don't** bring in an icon font or glyph icons; the only icons are 1px SVG strokes in ink (the menu lines, the select chevron, the summary chevron, the calendar mark) and the numbered revision triangle.
- **Don't** rely on colour alone for a status; the mark's shape carries it.
- **Don't** let a status change reflow the ledger; restyle the row in place and re-render the score only.
- **Don't** let a cell truncate its entry; a value that outgrows its cell wraps and the cell grows.
