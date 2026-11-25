# Design notes: restyling toward the reference site's look

Source studied: miraitrafficschool.com (RU locale, viewed at 1440 content width, light and dark). Layout, structure and visual style only. Do NOT reuse their name, logo, illustrations, photos, license number or copy. All art below must be our own original SVG/CSS (or generated placeholder images in `/public/placeholder/*`).

Not verified: mobile 375px (the browser window would not shrink; mobile notes are inferred from their breakpoints), login page (their `/login` is a 404 for the studied session), blog post pages. Breakpoints they use: 360, 380, 420, 480, 640, 720, 768, 900, 1024, 1100, 1280, 1400.

## 1. Design tokens

Stack on their side is shadcn-style HSL vars plus brand vars. Port to oklch/hex in `src/app/globals.css`.

### Light
| Token | Value |
| --- | --- |
| page background (`--background`) | #f9fafb (hsl 220 13% 98%) |
| surface-lowest / card | #ffffff |
| tinted section bg A (sky) | ~#e6f5ff to #eaf6ff (hero-adjacent steps, course panel) |
| tinted section bg B (mint) | ~#e9f8e5 (alternate steps) |
| peach strip (banner) | ~#fdf0e6 |
| foreground (body text) | #1d283a (hsl 217 33% 17%) |
| heading ink | #191c20 (hsl 214 12% 11%) |
| muted text / nav link | #424751 ; muted-foreground hsl 215 16% 47% (#64748b) |
| border | #e1e7ef (hsl 214 32% 91%) |
| primary action (CTA fill) | #38b6ff (sky blue), text on it #0f1217 (dark, not white) |
| primary ink / links | hsl 217 91% 38% (#0a52b8-ish); brand deep blue hsl 207 100% 25.5% (#00497f) |
| brand navy | hsl 212 72% 16% (#0b2a45) |
| green (success/selected/accent) | #7ed956 (selected border, big step numerals, "available" pills), deeper text green hsl 142 71% 35% (#1a9a4c) |
| soft blue border | #cbebff (chips, language buttons) |
| teal accent | hsl 188 77% 48% (#1ccde0) |
| warning / orange | hsl 38 92% 50%; hero gradient end #f97415 |
| destructive | hsl 0 84% 60% |
| ring | hsl 217 91% 60% |
| hero gradient (rare) | linear-gradient(135deg,#3c83f6,#21c45d 50%,#f97415) |
| soft gradient | linear-gradient(135deg,#ecf3fe,#e9fbf0 50%,#fef0e6) |

### Dark (toggle sets `data-theme="dark"` on html; ours uses `.dark`, fine)
- main bg #0b1820, header pill rgba(12,27,36,.94), text #e9f1f6, headings #f1f6fa.
- shadcn dark set they ship (neutral, rarely visible): background hsl 222 47% 5%, card same, muted/border hsl 217 33% 17%, muted-fg hsl 215 20% 65%.
- CTA stays #38b6ff in dark; hero swaps to a night version of the same scene (dark navy sky, lit lamps). Plan a dark variant of each hero art.
- Suggested ours: bg #0b1820, card #10222d, border rgba(255,255,255,.10), primary #38b6ff.

### Typography
- Font: **Inter** (free, Google Fonts) with `"Noto Sans JP"` fallback. Use `next/font/google` Inter (latin + cyrillic) in the locale layout; add Noto Sans JP for `ja`. Replace our `--font-sans` system stack.
- Body 16px/1.6 (25.6px), weight 400. Nav links 15px / 600.
- H1: 72px / 800 / line-height 1.05 (75.6px) / letter-spacing -1.8px (-0.025em). Scale down to ~40-44px under 640px (clamp(2.5rem, 6vw+1rem, 4.5rem)).
- H2: 30px / 800 / lh 1.15 (inner-page/section titles; larger on some, ~36-40px). H3: 30px/800/-0.75px on feature panels, 18-20px bold in cards.
- Eyebrow: 12-13px, 700, uppercase, letter-spacing ~0.12em, ink color ("STEP 1 . REGISTRATION" pattern).
- Big step numerals: ~120px, weight 800, fill #7ed956, tight lh.
- Buttons 18px/700 (hero) and 16px/700 (inline). Everything bold-heavy; headings read as heavy sans.

### Radius, shadow, spacing, container
- `--radius: .75rem` base; pills use 999px for buttons, chips, inputs-with-button; header pill 24px; cards 18-24px; court-building buttons 18px; nav links 12px.
- Shadows: sm `0 2px 6px #00000014`; md `0 4px 12px -2px #0000001f, 0 2px 6px -2px #00000014`; lg `0 8px 24px -4px #00000026, 0 4px 8px -4px #0000001a`. Header pill uses a big soft shadow `0 ? 40px rgba(10,48,70,.42)` plus inset white 1px top highlight. Cards often have a solid colored bottom edge (see 4).
- Spacing: card padding 1.5rem, gap 1rem, section vertical padding ~96-120px on desktop.
- Container: content max-width **1440px outer chrome (header pill)**, inner page content ~1040-1200px (hero/text starts x=175 of a 1568 frame, i.e. ~1220px wide). Use `max-w-[1440px]` for header/footer/hero and `max-w-6xl`/`max-w-[1200px]` for sections.

### Buttons (exact)
- Primary: bg #38b6ff, border 2px same color, text #0f1217, 18px/700, padding 12px 34px, height 60px, radius 999px. Inline/CTA-in-card variant ~44-48px high. Optional soft ring `--mirai-primary-action-shadow` hsl 214 95% 93% as hover/focus glow.
- Secondary/outline: transparent, 2px border #38b6ff, text ink, same size and radius.
- Chip/pill: white bg, 2px border #cbebff, 16px/700, radius 999px, height 44-46px, padding 0 14px, with flag/icon left. Selected: bg #edfae7, border #7ed956, check icon right.
- Back pill: white, inset ring 1.5px #cbebff, radius 999, 44px high.
- Option rows (court building): white, 2px border #e3e4e5, radius 18px, padding 8px 18px, 70px tall.
- Status pill ("Available"): solid #7ed956, uppercase 12-13px/800, dark text, radius 999.
- Discount badge: green #7ed956 pill, small bold uppercase text, sits right of the strike-through old price.

## 2. Global chrome

### Announcement bar (top, not sticky)
Full-width strip, ~38px high, very light green-to-white gradient (`#e8f6e4 -> #f4fbf2`). Content centered: green filled circle with white check, bold lead sentence, muted rest, then two small links on the right of the sentence (a "What's new" link with a down-caret and an underlined "Found a mistake?" link, bold, blue #0a6aa8). 14px text. Scrolls away (header is the sticky element).

### Header (sticky floating pill)
- Wrapper: `sticky top-3`, header pill is `max-w-[1440px]`-ish (their pill 1440x64 at x=202 in a 1844 viewport, i.e. centered with margins), height **64px**, radius **24px**, bg rgba(255,255,255,.94) + `backdrop-blur`, 1px border rgba(255,255,255,.85), padding `0 8px 0 16px`, shadow = inset 0 1px rgba(255,255,255,.7) + large soft navy shadow. Dark: rgba(12,27,36,.94).
- Left: logo lockup (wordmark+mark, ~75x32). Ours: keep SignpostIcon + "RoadReady" but restyle (see our files).
- Center: nav in this order: Courses, DMV Services, Courts, About, FAQ, Contact. (No Blog in their top nav; ours may keep Blog but put it after FAQ or drop to footer to match.) Link: 15px/600, color #424751, padding 8px 12px, radius 12px, hover soft blue bg. Active page: blue-green underline bar under the text (2-3px, rounded) and darker text.
- Right cluster (all in one light-blue rounded capsule, bg ~#eaf3fb, radius 18px, ~46px high): [theme pill switch] [language button with flag + code + caret] then [account button: avatar + name + caret]. Account is a separate button (white/transparent) with chevron menu.
- Theme pill switch: ~52x32 track (radius 999, light-blue track in light, navy in dark), round thumb with a sun glyph (light) or moon glyph (dark) that slides left/right. Not a plain icon button.
- Language switcher: click opens a popover titled "Language" with a **2x2 grid of license-plate-style tiles**: each tile = rounded white plate (radius ~10px, tiny bolt dots at the top corners), flag circle + native name (English, 日本語, Español, Русский) in bold, tiny English caption below (English/Japanese/Spanish/Russian). Selected tile: green (#7ed956) fill/border plus green check badge top-right. Popover radius ~16px, bg card, shadow-lg, width ~220-250px, anchored under the header right.
- CTA: no separate header CTA; the account chip is the right-most element.

### Mobile menu
(Inferred, not seen.) At <900px nav collapses; pill stays, right cluster shrinks to icons. Use our existing Sheet; style as a full-height card with the same rounded 24px top-left corners, big 18px/600 links, chip row for theme+language at the bottom.

### Floating AI/help widget (bottom-right, fixed)
Initial state: card ~250px wide, radius ~22px, white, shadow-lg, border soft blue. Top row: small green label text ("Name . how it works in 57 sec") with a "minus" collapse button. Then a 16:9 video thumbnail card with centered blue circular play button, bottom-left bold white caption and a duration chip bottom-right. Below: a pill text input (placeholder "Ask the assistant about ...") with round blue arrow submit button inside. Collapsed state (and on inner pages after scroll/dismiss): small white pill, bottom-right, avatar circle + short label ("Help & overview"). Ours: build `src/components/layout/help-widget.tsx`, client component, localStorage remembers collapsed. Do not ship their video; use a placeholder thumbnail and our own copy. Respect "AI disabled during active exam".

### Footer
Compact, not a column grid. Single floating white pill/strip (same style as header, ~100px tall, centered, rounded top corners) below a large full-bleed closing CTA image. Row 1: small logo, then inline links: Courts by county, School rules, FAQ, About, Contact, Privacy, Terms, Refunds, Accessibility (13-14px, 600). Row 2: green check + "Licensed by CA DMV . <license>", address, phone link, email link, and right-aligned copyright. Ours must add the "Demo project - not a licensed school" note and keep `siteConfig` only. Nice idea to keep: group into this 2-row bar instead of 5 columns.

## 3. Pages

### Home (order)
1. **Hero** (full-bleed scene background, text left). Eyebrow row: green check icon + "Licensed by CA DMV . E0756" (ours: DEMO-0000, 14px/600). H1 72/800 over 3 lines, left aligned, max ~800px. Price row: big `$24.99` 48px/800, struck-through old price (muted, 22px), green discount badge. Buttons row: primary "Enroll now" + outline "Choose course". Trust row under (icons + 14px/500): building icon "Accepted by CA courts", star "5-star rated", card "Secure Stripe checkout". Hero height ~ 930px at 1440, header floats over it (hero starts at top, behind the pill; announcement bar above). Background art: wide landscape illustration occupying the right 60% and fading to the page color on the left via a white-to-transparent gradient mask (`mask-image`/overlay) so text sits on a near-flat pale sky. Scene: iconic landmark bridge in distance, palm trees right foreground, winding coastal road sweeping from bottom-right to lower-left, grassy hills, soft haze. Build our own: layered SVG (sky gradient #dff1ff to #f6fbff, sea band, stylized hill silhouettes in 3 greens, a generic suspension-bridge-free landmark such as a lighthouse or mission tower, 2 palm silhouettes, curved road path with dashed white center line). Dark variant: navy sky, stars, crescent moon, warm lamp dots.
2. **Checkered divider banner**: full-width peach strip (#fdf0e6) with green/white checkerboard border top and bottom (~14px squares, CSS `repeating-conic-gradient` or SVG pattern), centered 30px/800 headline ("Got a ticket? Close it in 4 steps"). Acts as section title for the steps.
3. **4-step "road" storyboard** (the signature). Each step is a full-width 2-column band (~800px tall) with a vertical winding road + small top-down car running down the centre seam as a continuous element across all steps. Left half and right half alternate: Step 1 text left on sky-blue bg (#e6f5ff), art right; Step 2 art left, text right on mint bg (#e9f8e5); Step 3 text left (sky), art right; Step 4 (certificate/reporting) art left, text right (mint). Road: dark asphalt #3f434c, ~120px wide, white dashed center line, blue edge line on the left edge and green edge line on the right (these colors echo the two band backgrounds), edge wobbles (S-curve) between bands. Text block: giant green numeral (120px), eyebrow "STEP 1 . REGISTRATION", H2 40px/800 two lines, 18px muted paragraph, then step-specific UI: Step 1 = language chip grid (2x2); Step 2 = three icon+label mini features (device, hourglass, save icons, 14px/700, green line icons); Step 3 = three stats (25 questions, 70% to pass, 2 attempts) with icons. Art per step: person-at-car-with-ticket scene; laptop+phone on windowsill with plant looking onto the coast; laptop quiz screen with green check, keys, coffee cup; certificate. On mobile stack to single column with the road hidden or reduced to a left rail.
4. **Course panel + language list**: 2-col card on pale-blue (#eaf5ff) rounded-24 panel: left a vertical stack of 4 language cards (flag circle 40px, language native name 20px/700, subtitle muted 13px, green "AVAILABLE" pill; selected card has green border and tint), right a big card with pill label "Available in 4 languages", H3 30/800 course title, two-column check-list with green line icons (10 items, 16px), and a white inset card with a laptop+phone illustration, plus CTA row.
5. **Courts finder (map section)**: left card: eyebrow, H2, short text, pill search input ("Find your county") with a magnifier, links "All 58 courts" and "Check course eligibility". Right card: two-column county list (row: county name 14px/600, sub-label "3 traffic courts" 12px muted, chevron), thin dividers. Cards have a thick green bottom border (4px) and white bg, radius 24, shadow-md; the road continues between them.
6. **Pricing**: H2 "One price. All included." Large white rounded-28 panel. Left cream card (#fef9e8) with dashed/checker top edge: license line, `$24.99` 56px/800 + strike + badge, full-width primary CTA with price in label, tiny legal line, "90 days of access" + four language chips. Right: H3 "What's included", 2x3 grid of icon+text items (green icons), below it a light-blue refund box with 3 percent chips (100% green, 50% yellow, 0% grey, each with one-line condition). Below the panel, a second slim card (green-tinted border) for the future in-person class: icon, title + "Coming soon" tag, one line, big price on the right.
7. **Reviews**: left a card with giant "5,0" (green, 72px/800) + "average out of 5"; right title card with a green progress bar and "5 star" label. Under it a **two-lane marquee**: two rows of short review cards (white, 2px green border at ~60%, radius 14, small quote text 15px, name 13px/700 with green dot) scrolling in opposite directions along a horizontal asphalt road strip with dashed center line and tiny cars driving on it. Pause on hover/prefers-reduced-motion. Our `reviews-carousel.tsx` becomes this.
8. **Assistant promo**: 2-col: left illustration (phone with chat bubbles on a seaside terrace), right eyebrow "SUPPORT 24/7", H2 40px/800, 16px paragraph, primary pill CTA with sparkle/AI.
9. **FAQ**: 2-col or narrow center: eyebrow, H2 "FAQ", accordion cards (white, 1px #e1e7ef border, radius 14, 16px/700 question, chevron right, 5-6 items; "More questions" link). Background has an illustrated streetscape on right.
10. **Closing CTA over a full-bleed scene** (coastal highway with blue sedan). A white card overlaps the top edge: H2 (36px/800), one line + price + strike + badge, primary CTA at right. Footer pill sits directly under the art.

### Inner page hero pattern (Courses, Courts, DMV, FAQ, Contact, Blog)
Same recipe on every page: 440-560px tall band, pale gradient bg (`#eaf6ff -> #f4fbf2`), left text column ~600px, right half a scene illustration masked into the page color with a left-fade gradient. H1 64px/800 lh 1.05 (left, 2-3 lines), 18px muted subtitle (max 480px). Below the H1 per page:
- Courses: two buttons (primary "Choose language", soft "Check eligibility") then the course panel (home #4) with the selected-language card first.
- Courts: big pill search bar with built-in "Find" primary button; "Popular:" label and 4 chips (Los Angeles, Orange, San Diego, Santa Clara). Body: left a California county map (pale-blue SVG shapes, hover highlights), right "Choose your county" card with 2-col grid of county preview cards (map thumbnail on top, county name below), scrolling inside a bordered 500px column. Then "All courts: 58" alphabetical list.
- County page: tiny "back to all courts" pill, H1 "Got a ticket in X County?", subtitle, then a wizard card (pale-blue rounded-28): left blank/map area, right "Step 1 of 2" green label, question H3, list of courthouse option rows (70px, radius 18, 2px grey border; hover/selected green) and a primary pill "Next" button bottom-right.
- DMV services: H1 question style, search pill, then "What's your situation?" row of 3 big image cards (rounded-24, photo-style illustration top, title below, first selected with green border), then a guide section and an "All DMV services" grouped list with H3 per group.
- FAQ: H1 + search pill + popular chips ("refund", "exam", "certificate", "password"). Body: left sticky category list (icon thumb, label, count badge; active = green tint and border), right accordion list for the category; open item has green border.
- Contact: H1 3 lines, subtitle, two pill buttons (primary call, soft email) and "Calls 24/7 . emails within 24 hours" caption. Body: left category list with icons (access, technical, certificate...), right a form card with a green-tinted info box with a nested small button.
- Blog: H1, search pill, hero featured post (large image left, eyebrow category, H2 title right), then card grid.
Icon style everywhere: 1.5px stroke rounded line icons (lucide-compatible), tinted green (#1a9a4c) on light, 20-24px; flags as circular 28-40px images with a 2px white ring.

## 4. 404 page
Centered column on the pale gradient bg (`#eaf6ff -> #f4fbf2`) with header kept. Tiny muted line "404 | Page not found" (13px), H1 56px/800 centered one line, 16px muted paragraph, small muted "Could not find /path" line. Centerpiece: a **green highway guide sign** 620px wide: outer rounded-24 #1b7f3c-ish green with a 4px white inset border (2px darker green outer ring); four rows separated by thin white 1px dividers; each row = white direction arrow icon (up, up-right, right, down-left) + 22px/700 label on the left, and a 13px right-aligned sub-label ("Licensed course", "Your court and its DMV code", "Renewals, IDs, documents", "Eligibility, exams, certificates, refunds"); rows full width. Below the sign: two grey posts (rounded rectangles ~16x40) like a roadside sign. Bottom line of links: "Back to home . Still can't find it? Tell us what you were searching for . Call +1 ..., 24/7". Ours already has a green guide sign; restyle to rows + posts, drop the 2x2 grid and outline "Back" button.

## 5. Prioritized differences and files to change

P0 (global look, do first)
1. Tokens: replace neutral grayscale palette with the blue/green set from section 1; add `--brand-sky`, `--brand-green`, `--surface-sky`, `--surface-mint`, `--surface-peach`, set `--radius: .75rem`, add `--shadow-sm/md/lg`; dark variant #0b1820 family. File: `src/app/globals.css` (+ keep `scripts/check-conventions.ts` happy: brand strings only in config).
2. Font: Inter (+ Noto Sans JP) via next/font. Files: `src/app/[locale]/layout.tsx`, `globals.css` `--font-sans`.
3. Buttons: pill radius 999, bold 16-18px, 2px borders, primary = sky #38b6ff with dark text; new sizes (xl 60px). File: `src/components/ui/button.tsx` (add `variant: "sky"`/redefine default, `size: "xl"`). Update `input.tsx` to pill search variant.
4. Header: 64px, 24px radius, blur, larger shadow; right cluster capsule; nav order Courses, DMV Services, Courts, About, FAQ, Contact (Blog moves to footer or after FAQ); active underline. Files: `src/components/layout/site-header.tsx`, `nav-links.ts`, `header-account.tsx`, `user-menu.tsx`.
5. Theme toggle becomes sliding sun/moon pill switch. File: `theme-toggle.tsx`.
6. Language switcher: 2x2 license-plate tile popover with flag, native name, caption, green selected state. File: `language-switcher.tsx` (flags: draw simple original circular SVG flags or use emoji-free CSS flags; no copyrighted assets).
7. Announcement bar: green gradient strip with check badge, bold lead, two links on right. Files: `announcement-bar.tsx`, `dismissible-announcement.tsx` (keep dismiss, make X subtle).

P1 (home page structure) in `src/app/[locale]/page.tsx` (+ new `src/components/home/*`)
8. Hero: full-bleed scene bg with left-fade mask, 72px H1, price row with strike + badge, two pill buttons, 3-item trust row. Replace current `bg-gradient-to-b from-primary/5` hero (line ~159). New `src/components/home/hero-scene.tsx` (original SVG, light+dark).
9. Add checkered peach divider banner and the 4-step road storyboard (new `src/components/home/steps-road.tsx`, `road-divider.tsx`); current "how it works" section (~line 224) becomes this.
10. Course panel with stacked language cards + feature checklist: restyle `src/components/courses/course-panel.tsx`, `language-cards.tsx` (cards 2px borders, green selected, "Available" pill).
11. Courts finder section: card + two-column county list with thick green bottom border (section at ~line 283).
12. Pricing: cream price card + 2x3 included grid + refund percent chips + coming-soon in-person strip (section ~line 322).
13. Reviews: big score card + two-lane marquee on road strip. File: `src/components/home/reviews-carousel.tsx`.
14. Assistant promo, FAQ accordion cards, closing CTA over full-bleed scene with overlapping white card (sections ~lines 463-540).

P2 (inner pages and chrome)
15. Shared `PageHero` component (440-560px, gradient bg, left text, masked art right, search pill + popular chips). Apply to `src/app/[locale]/{courses,courts,dmv-services,faq,contact,blog,about}/page.tsx`. Put in `src/components/layout/page-hero.tsx`.
16. FAQ: left sticky category list with counts, right accordion. `src/app/[locale]/faq/page.tsx`.
17. Courts: map SVG + county card grid + 2-step wizard on county page. `src/app/[locale]/courts/**` and `src/components/courts/*`.
18. Footer: replace 5-column grid with 2-row floating pill (links row + license/address/phone/email/copyright row), keep demo notice. `site-footer.tsx`, `nav-links.ts` (`footerNav` flattened).
19. Floating help widget (video thumb + chat input, collapsible). New `src/components/layout/help-widget.tsx`, mount in `src/app/[locale]/layout.tsx`.
20. 404: sign with arrow rows + posts, pale gradient bg. `src/app/[locale]/not-found.tsx` (and `[...rest]`).

Notes for implementer
- Section backgrounds alternate sky (#e6f5ff) and mint (#e9f8e5); keep text left/art right alternating.
- Hero art, step art, DMV situation cards and 404 posts are all original illustration work; use a consistent flat-vector style (soft gradients, thin dark-navy outlines absent, 3-tone greens/blues) so assets feel like one set. Provide dark variants for hero and closing scenes.
- Respect existing rules: brand/license only from `src/config/site.ts`; copy via `messages/*.json`; i18n labels short; `prefers-reduced-motion` disables marquee and car animation.
