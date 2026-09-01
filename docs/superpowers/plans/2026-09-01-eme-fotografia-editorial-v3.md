# EME Fotografía Sevilla — Editorial/Cinematic Redesign (v3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the site's remaining "template rhythm" — the shared `.section { padding; max-width; margin-inline: auto; text-align: center }` idiom that nearly every section reuses, which is what actually makes the site read as generic despite several individually strong components — and replace it with a bespoke, editorial, cinematic composition per section, using the studio's real photo/video inventory (including 4 real couples' photo sets — 28 photos — currently unused) as the primary design material. No new color palette, no new component library, no WebGL: this is a composition and rhythm rebuild on the existing engineering foundation.

**Architecture:** Same stack throughout — Next.js App Router, CSS Modules + `styles/tokens.css` custom properties, GSAP + ScrollTrigger + Lenis for motion, `next/image`/`next/font`. No WebGL, no new UI framework, no Tailwind, no new npm dependencies without explicit justification recorded in this plan.

**Tech Stack:** Next.js 16, React, CSS Modules, GSAP/ScrollTrigger, Lenis, `focus-trap` (Lightbox, MobileMenu).

**Spec:** The client's own verbatim 19-section brief (delivered 2026-09-01, in-session, titled "transformación radical") plus this plan's own pre-execution audit (a controller-run fork that read every section's component/CSS files and screenshotted the live site — findings folded into the per-task rationale below). Where the new brief's suggestions conflict with an established, evidence-based ruling from this project's prior plans (no WebGL; curate-don't-accumulate motion; Spanish-only copy; never fabricate business facts), the established ruling wins — restated per-task below where relevant. This plan supersedes nothing already built — it evolves the real, working mechanisms from `2026-09-01-eme-fotografia-art-direction-v2.md` (Hero video+parallax, Manifiesto's masked-photo reveal, the numbered-list services interaction, the custom cursor) rather than discarding them.

## Why this plan exists

After the prior 11-task art-direction plan shipped (real Lighthouse 0.99/1.00/1.00/1.00, clean final review), the client reviewed the live result and rejected it as still reading like "una plantilla de WordPress / theme de fotografía genérico" — despite individual components being sound. A controller-dispatched audit (read every section's code + live screenshots) confirmed the specific mechanism: **the problem is not that any one component is bad, it's that nearly every section (Manifiesto, CtaContacto, Testimonios, Confianza, ServiciosPreview, SobreEmePreview, SelectedWork) wraps its content in the same generic centered-block container math**, producing the exact repeating "About / Services / Portfolio / Contact" rhythm the client's brief explicitly names as the thing to avoid — even though each section's *content* is already decent. Three further concrete offenders were found: `/servicios` renders services as raw `<ul><li>•</li></ul>` bullet lists; `CtaContacto` is a textbook centered-heading-paragraph-button block (the exact "hero genérico con CTA" pattern relocated to the page bottom); `/trabajos` and `/servicios` share a pixel-identical page-header partial (functionally a CMS page-template). The audit also found 4 of the studio's 7 real couples (28 real photos: Andrea y Enrique, Marta y Álvaro, María y Francisco Manuel, Rocío y Juanje) are not yet integrated anywhere on the site — real, paid-for creative material sitting unused while the portfolio repeats a uniform card grid for the 3 couples it does show.

The client's own words: *"No me entregues simplemente un análisis... Haz el trabajo directamente sobre el proyecto... Toma tú las decisiones de diseño."* — full creative authority delegated, explicit instruction to execute without a further approval checkpoint.

## The new art direction (locked decisions — do not re-litigate per-task)

- **Kill the shared section wrapper.** No task in this plan may use the `.section { padding: var(--space-N) var(--space-N); max-width: Nrem; margin-inline: auto; text-align: center }` idiom as a default. Every rebuilt section defines its own bespoke layout math — asymmetric columns, full-bleed breakouts, offset grids. Where full-bleed is used, break out of any parent max-width (`width: 100vw` techniques or a dedicated breakout utility — see Task 1).
- **Chapter numbering as a site-wide structural motif.** `ServiciosPreview`'s existing `01/02/03` numbered-list idea is the strongest structural device already on the site — extend it site-wide as oversized "chapter" numerals (roman or arabic, large ghost-weight serif type, low-opacity or ink-colored depending on background) marking major scroll transitions, giving the whole page a magazine-spread logic and a structural reason for generous negative space. Reuse `--type-h1` scale or larger for these; they are graphic elements, not body content, so they may need a new token (add to `styles/tokens.css`, don't hardcode).
- **Navigation: no persistent nav-link row.** Replace the current "logo left / TRABAJOS · SERVICIOS · SOBRE NOSOTROS · CONTACTO right" desktop bar — which is structurally identical to a stock WordPress nav — with logo + a single menu toggle, on both desktop and mobile, opening one unified fullscreen menu (evolve the existing `MobileMenu.tsx` rather than building a second component). A minimal current-section indicator may accompany the toggle. This is the single most literal fix for the brief's explicit "no quiero LOGO | HOME | ABOUT..." instruction.
- **Portfolio: a flexible editorial-spread system, not a card grid.** Replace `SelectedWork`/`TrabajosFilter`'s uniform `aspect-ratio: 3/2` grid with a small set (3–4) of hand-designed *composition variants* — full-bleed vertical, overlapping offset pair, wide panoramic with floating title, offset diptych — assigned per project based on each project's real photos' actual aspect ratios (never force-cropped to a uniform shape). This gives real visual variety without hand-authoring 7 fully bespoke one-off layouts (unmaintainable) or reverting to one repeated card shape (the exact problem being fixed).
- **Real-asset-first.** Every new composition uses real studio photos/video already in the repo (`fotos eme/`, `video eme/`, already-edited outputs in `public/`) or already-approved copy (`content/site.ts`, `content/services.ts`, existing Manifiesto/About copy). No fabricated business facts, no new stock imagery anywhere. Onboarding the 4 unused real couples (Task 6) is part of this plan specifically so the new portfolio system has enough real material to show genuine variety.
- **No filled rectangular CTA buttons.** Replace every "button-shaped" affordance (`CtaContacto`'s current solid maroon rectangle is the worst offender) with understated text-links using the project's existing animated-underline idiom (already used correctly elsewhere — check `Header.module.css`'s `aria-current` underline and `CtaContacto`'s own link pattern from the prior plan for the base technique) — never a filled, bordered, or shadowed box.
- **Color and type tokens stay.** The audit confirmed `styles/tokens.css`'s existing palette (`--color-ink #1F262E`, `--color-accent #992927`, `--color-paper #F7F5F2`, `--color-muted #6B7178`) and type scale (Fraunces serif + sans, `clamp()`-based `--type-label` through `--type-h1`) are sound and on-brand — this plan spends its effort on composition and rhythm, not a palette swap. New tokens may be *added* (e.g. a chapter-numeral size step) but no existing token value changes without a documented reason.
- **Confianza (the follower-count stat bar) is retired as a standalone section.** Weak content for a luxury-photography brand (Facebook/Instagram counts aren't a premium trust signal) and its "two centered numbers" shape is a generic SaaS stat-bar pattern. Fold the two numbers into the Footer as a minimal detail line (Task 11) rather than deleting the real, honest data entirely.
- **Motion stays curated, not stacked.** Continue this project's own established discipline: one clear technique per moment, always gated behind `useReducedMotion()` (client components) or `@media (prefers-reduced-motion: reduce)` (pure CSS), animating only `transform`/`opacity` (the project's two existing narrowly-scoped static, non-animated `filter` exceptions may be extended to new static uses if genuinely justified, but no new *animated* filter/blur/backdrop-filter effects — GPU cost and jank risk on scroll-linked work). No WebGL anywhere (restated, evidence-based ruling from the prior plan's own reference-site research).

## Global Constraints

- No Tailwind; CSS Modules + `styles/tokens.css` custom properties only.
- Animate only `transform`/`opacity`. Every animation gated behind `useReducedMotion()` or `@media (prefers-reduced-motion: reduce)`. No new dependencies without explicit justification written into the relevant task.
- No WebGL.
- All user-facing copy in Spanish. No fabricated business facts — reuse or lightly rephrase already-approved copy; where a task needs new copy (chapter labels, new project descriptions for the 4 newly-onboarded couples), keep it in the same honest, understated register as existing copy (`Manifiesto.tsx`, `content/services.ts`) — no invented statistics, dates, or policies.
- Curate, don't accumulate: one clear technique per task/moment, never layered.
- Mobile is not "shrink desktop" — every task's implementer sanity-checks their own change at a narrow viewport as part of that task's own verification; Task 13 is a dedicated final pass, not the only checkpoint.
- TDD where the change is behavioral (JS logic, motion triggers, interaction state, focus management). Pure CSS/visual changes verify via the full test suite (regression safety) + a real browser check, documented per task — unit tests can't meaningfully assert on visual composition.
- Every task ends with `npm test && npm run build` passing clean before commit.

---

### Task 1: Layout primitives — kill the shared section wrapper, add the breakout + chapter-numeral system

Foundational task every later section-rebuild task depends on. Currently `styles/globals.css`/`reset.css`/`tokens.css` have no shared "full-bleed breakout" utility and no chapter-numeral type step — each later task would otherwise reinvent this ad hoc.

**Files:**
- Modify: `styles/tokens.css` (add a chapter-numeral type step, e.g. `--type-chapter: clamp(6rem, 4rem + 10vw, 14rem)` — tune the exact clamp values by checking they don't overflow at 360px width)
- Create: `styles/layout.css` (new: a `.breakout` utility class using the `100vw` negative-margin technique — `width: 100vw; margin-inline: calc(50% - 50vw);` — for full-bleed elements inside otherwise-constrained parents; plus a `.chapterNumber` utility class for the oversized numeral treatment: large `--type-chapter` serif numeral, `line-height: 0.85`, deliberately low visual weight via `opacity` or `color: var(--color-muted)` depending on where it's used)
- Modify: `app/globals.css` or wherever `styles/reset.css`/`tokens.css` are imported, to also import `styles/layout.css`

**Step-by-step:**

- [ ] **Step 1:** Read `styles/tokens.css`, `styles/reset.css`, and grep every `.module.css` file in `components/sections/` for the string `max-width` and `text-align: center` to confirm the audit's finding (the shared wrapper idiom) — list which files match, this list becomes the "must not still use the old idiom" checklist for Tasks 8–11's review.
- [ ] **Step 2:** Add `--type-chapter` to `styles/tokens.css`. Verify visually it doesn't force horizontal scroll at 360px width (a 4-digit chapter number like "04" at 14rem should still fit — 2 digits at 14rem ≈ 2 × ~0.6em advance width, well under 360px, but verify in a real browser, not just arithmetic).
- [ ] **Step 3:** Create `styles/layout.css` with `.breakout` and `.chapterNumber` per above. Document both with a one-line comment explaining the technique (the `100vw` breakout trick relies on no horizontal scrollbar existing on the page when it's applied — note this as a known constraint for callers).
- [ ] **Step 4:** Wire the import so `.breakout`/`.chapterNumber` are globally available to every component's CSS Module (CSS Modules can compose global classes via `:global(.breakout)` — confirm this project's existing CSS Modules setup supports that syntax, check how `reset.css`'s classes are currently consumed if at all, or use PostCSS `composes` if that's the established pattern here — read `next.config.mjs`/`postcss.config.*` to confirm before choosing).
- [ ] **Step 5: Verify** `npm test && npm run build`. Real browser check: confirm no regression on any existing page (this task adds new CSS, doesn't remove anything from existing components yet).
- [ ] **Step 6: Commit**

```bash
git add styles/tokens.css styles/layout.css [wherever the import lives]
git commit -m "feat: add breakout and chapter-numeral layout primitives for the editorial redesign"
```

---

### Task 2: Navigation rebuild — kill the persistent nav-link row, unify desktop+mobile into one fullscreen menu

**Files:**
- Modify: `components/layout/Header.tsx`, `components/layout/Header.module.css`, `components/layout/Header.test.tsx`
- Modify: `components/layout/MobileMenu.tsx`, `components/layout/MobileMenu.module.css`, `components/layout/MobileMenu.test.tsx` (rename conceptually to "the" menu, not "the mobile" menu — keep the filename to minimize churn, but it now serves both breakpoints)

**Decisions:**
- Remove `.desktopNav` (the `@media (min-width: 768px) { .desktopNav { display: flex } }` link row) entirely. At every breakpoint, the Header shows only: the real logo (left, unchanged) and a single toggle button (right) that opens the existing fullscreen overlay menu.
- The toggle button's existing `mix-blend-mode: difference` + z-index-101-above-overlay treatment (already correct, from the prior plan's Task 11 fix) carries over unchanged.
- Add a minimal current-section indicator: a single small tracked-uppercase label near the toggle showing the current page name (`Trabajos`, `Servicios`, etc. — derive from the route, e.g. via `usePathname()`), NOT a list of all pages. This preserves "you are here" orientation without reintroducing a nav-link list.
- `MobileMenu`'s existing focus-trap (fixed in the prior plan's Task 11) and its 5-link list stay structurally the same — this task's job is making the SAME component the only navigation entry point at all viewport widths, not rebuilding its internals.

**Step-by-step:**

- [ ] **Step 1:** Read the current `Header.tsx`/`Header.module.css` and `MobileMenu.tsx`/`.module.css` in full — you are modifying working, already-reviewed, focus-trapped code, not starting from scratch.
- [ ] **Step 2:** Remove the `@media (min-width: 768px)` block that shows `.desktopNav`/hides `.menuButton` — the toggle button now renders at every width. Delete the now-dead `.desktopNav` CSS and its child link styles once nothing references them (grep to confirm before deleting).
- [ ] **Step 3:** Add the current-section-label span next to the toggle, deriving the label from `usePathname()` (map route segments to the existing Spanish labels already used in the old nav: `/trabajos` → "Trabajos", `/servicios` → "Servicios", `/sobre-nosotros` → "Sobre nosotros", `/contacto` → "Contacto", `/` → nothing/omit). Style it as a small `--type-label` element, not competing visually with the logo.
- [ ] **Step 4:** Update `Header.test.tsx`: remove assertions about desktop nav links being visible at wide viewports (they no longer exist); add an assertion that the toggle button is present and the section-label reflects the current route.
- [ ] **Step 5: Verify** `npm test && npm run build`. Real browser + keyboard-only check at both a desktop and narrow viewport: toggle opens the fullscreen menu from any page, Tab-trap still works (should be untouched, but confirm no regression), Escape closes and returns focus to the toggle (existing behavior), the current-section label updates when navigating.
- [ ] **Step 6: Commit**

```bash
git add components/layout/Header.tsx components/layout/Header.module.css components/layout/Header.test.tsx
git commit -m "feat: replace persistent nav-link row with a unified fullscreen-menu toggle at every breakpoint"
```

---

### Task 3: Hero refinement — progressive text reveal, contained cursor-reactive depth

The prior plan's Hero (real video background, GSAP `yPercent` parallax, asymmetric wordmark) is the strongest thing on the site per the audit — this task evolves it, does not replace the mechanism.

**Files:**
- Modify: `components/sections/Hero.tsx`, `components/sections/Hero.module.css`, `components/sections/Hero.test.tsx`

**Decisions:**
- **Progressive reveal:** on mount (respecting the existing `showIntro`/session-gated logic — don't fight it, extend it), the wordmark's two lines (`EME` / `Fotografía {legalCity}`) reveal via a masked clip-path wipe or a staggered per-line `translateY` + `opacity` entrance (GSAP timeline, `transform`/`opacity` only) rather than appearing all at once. Keep it fast (~0.6–1s total, matching `--duration-slow`) — this is a refinement, not a new multi-second intro sequence layered on top of the existing 1.4s session-gated intro.
- **Cursor-reactive depth (desktop only, very contained):** on pointer move within the Hero, apply a very small (a few pixels max — the brief's own "parallax muy contenido" instruction from the prior round applies equally here) `translate` offset to the video layer opposite the cursor position, via `gsap.quickTo` (cheap, interpolated, no per-frame React re-render) — NOT on touch devices (no pointer to react to) and NOT under reduced motion. This is additive to the existing scroll-driven `yPercent` parallax, not a replacement — both can coexist since they drive the same `transform` via GSAP's own composition.
- Do not change the video source, poster, or the existing `fetchPriority="high"` LCP fix — those stay as-is.

**Step-by-step:**

- [ ] **Step 1:** Read the current `Hero.tsx` in full (the scroll-parallax `useEffect`, the intro-timer `useEffect`, the video-autoplay `useEffect` all stay — you're adding two more gated effects/timeline steps alongside them, not restructuring what's there).
- [ ] **Step 2:** Extend `Hero.test.tsx`: assert the wordmark lines have the reveal-entrance treatment applied only when `!reducedMotion` (mirror however the existing intro-sequence test distinguishes reduced vs. normal motion) and that no cursor-tracking GSAP call happens under reduced motion or (if testable in jsdom) on a simulated touch-only environment.
- [ ] **Step 3:** Implement the staggered wordmark reveal as a GSAP timeline gated behind `!reducedMotion`, running once on mount (or once `showIntro` resolves to `false`, whichever ordering reads better live — your call, verify live before locking it in).
- [ ] **Step 4:** Implement the cursor-reactive depth: a `pointermove` listener on the Hero section (not `mousemove` — `pointermove` naturally excludes touch-only interaction patterns more reliably, verify this holds on a real mobile device emulation), using `gsap.quickTo(imageRef.current, 'x', {...})`/`'y'` for cheap interpolated movement, magnitude capped small (e.g. ≤ 12px total travel), gated behind `!reducedMotion` and a `matchMedia('(hover: hover) and (pointer: fine)')` check (the standard way to detect "has a real mouse", avoiding any touch-device cost).
- [ ] **Step 5: Verify** `npm test && npm run build`. Real browser check at desktop: wordmark reveals progressively on load, moving the cursor around the Hero produces a subtle, non-distracting depth shift, scroll-parallax still works independently. Real check with reduced-motion emulated: no reveal animation (wordmark just present), no cursor-tracking. Mobile viewport check: no cursor-tracking code path runs (touch has no `hover:hover`), reveal-on-load still works (respecting reduced motion), no jank.
- [ ] **Step 6: Commit**

```bash
git add components/sections/Hero.tsx components/sections/Hero.module.css components/sections/Hero.test.tsx
git commit -m "feat: add progressive wordmark reveal and contained cursor-reactive depth to Hero"
```

---

### Task 4: Editorial-spread portfolio component system

The core rebuild. Replace `SelectedWork.tsx`'s and `TrabajosFilter.tsx`'s uniform `aspect-ratio: 3/2` card grid with a shared, flexible spread system.

**Files:**
- Create: `components/sections/EditorialSpread.tsx`, `components/sections/EditorialSpread.module.css`, `components/sections/EditorialSpread.test.tsx`
- (Wiring `EditorialSpread` into `SelectedWork`/`TrabajosFilter`/the project detail page is Task 5/6 — this task builds and unit-tests the component in isolation first.)

**Decisions:**
- 4 composition variants, selected as a prop (`variant: 'full-bleed' | 'overlap-pair' | 'panoramic' | 'diptych'`):
  - `full-bleed`: one image, `.breakout`, near-full-viewport-height, project title as large serif type floating in the negative space beside/below the image (not on top of it, not centered on it) — best for a strong vertical portrait real photo.
  - `overlap-pair`: two images from the same project, offset and partially overlapping (one shifted via `transform: translate()`, `z-index` layering, no border/shadow) — best where a project has a clear "wide establishing shot + intimate detail shot" pairing.
  - `panoramic`: one wide/landscape real photo, `.breakout` full-bleed width but constrained height (a letterbox feel), title set small and to one side.
  - `diptych`: two images side by side at an intentionally uneven split (e.g. 60/40, not 50/50), no gap-filling uniformity.
- Each variant receives real image(s) + `alt` text + project title + project number (rendered via Task 1's `.chapterNumber` utility, e.g. "01", "02" as ghost-weight numerals) + `href` (links to the project detail page) as props — no hardcoded content in this component.
- Image aspect ratios come from the actual source images (`next/image` with real `width`/`height`, no forced `aspect-ratio` CSS crop) — pass real dimensions as props, don't guess.
- Hover/focus: extend the existing zoom-on-hover-or-focus pattern (`SelectedWork.module.css`'s current `:hover .imageWrap img { transform: scale(1.04) }` + this session's already-added `:focus-within` parity) — reuse, don't reinvent.
- Cursor integration: reuse the existing custom-cursor `data-cursor="ver"` pattern already used elsewhere (`SelectedWork.tsx`, `TrabajosFilter.tsx`) rather than adding a visible "Ver proyecto" text link on every spread.

**Step-by-step:**

- [ ] **Step 1:** Read `components/sections/SelectedWork.tsx`/`.module.css`, `app/trabajos/TrabajosFilter.tsx`/`.module.css`, and `components/motion/Cursor.tsx` in full — this new component must interoperate with the existing cursor's `data-cursor` attribute pattern and the existing `ScrollReveal` entrance-animation wrapper (each spread's entrance should use `ScrollReveal`, not a new bespoke reveal — reuse, per this project's own established discipline).
- [ ] **Step 2:** Write `EditorialSpread.test.tsx` first (TDD): for each of the 4 variants, assert the correct number of `<Image>` elements render with the passed `src`/`alt`/dimensions, the title and chapter-number render, the whole spread is a single focusable link (`<Link href>`) wrapping the imagery (mirroring `SelectedWork.tsx`'s current pattern of one enclosing `<Link>` per project), and `data-cursor="ver"` is present.
- [ ] **Step 3:** Implement `EditorialSpread.tsx`/`.module.css` per the decisions above. Use CSS Grid or absolute positioning (your call per variant, whichever produces genuinely non-uniform, intentional-looking offsets — avoid anything that degrades to a symmetric grid by accident) for `overlap-pair`/`diptych`'s offset math.
- [ ] **Step 4: Verify** `npm test && npm run build`. This component isn't wired into any page yet — verify via a throwaway local render (e.g. temporarily drop one instance into a page to eyeball it in a real browser, then remove the throwaway before commit) that each variant looks genuinely distinct, not like 4 slightly-different card templates.
- [ ] **Step 5: Commit**

```bash
git add components/sections/EditorialSpread.tsx components/sections/EditorialSpread.module.css components/sections/EditorialSpread.test.tsx
git commit -m "feat: add EditorialSpread — a 4-variant flexible portfolio composition system"
```

---

### Task 5: Wire EditorialSpread into Home's "Trabajos" section and the `/trabajos` listing page

**Files:**
- Modify: `components/sections/SelectedWork.tsx` (Home), `app/trabajos/TrabajosFilter.tsx` (listing page), and their `.module.css`/`.test.tsx` files — or replace them outright with thin wrappers around `EditorialSpread` if that reads cleaner (your call; if replacing, keep the existing filter-tab logic in `TrabajosFilter.tsx` untouched, only the per-project rendering changes)

**Decisions:**
- Variant assignment per project: write a small, honest heuristic based on each project's real image dimensions (e.g. a project whose cover image is portrait-oriented and tall → `full-bleed`; a project with 2+ images of similar strong composition → `overlap-pair`; a project with a wide landscape hero shot → `panoramic`; otherwise → `diptych`) — document the heuristic in a code comment, don't hardcode per-project-by-name (that breaks the moment a new project is added). Cycle/alternate variants down the page so consecutive projects never repeat the same variant back-to-back, even if the heuristic would naturally pick the same one twice.
- Remove the old uniform-grid CSS (`grid-template-columns: repeat(auto-fit, minmax(280px,1fr))`, the single `.wide`/`:nth-child` span exceptions) entirely — this task's job is exactly to retire that pattern.
- The existing category filter tabs on `/trabajos` (role="tab"/aria-selected pattern — do not touch this ARIA pattern, it's correct and was explicitly protected in the prior plan) keep working; only what renders *below* the tabs changes.

**Step-by-step:**

- [ ] **Step 1:** Read the current `SelectedWork.tsx` and `TrabajosFilter.tsx` in full, including their tests, to understand exactly what existing behavior (video-card special-casing on Home, filter-driven re-render with the GSAP fade+scale re-flow animation on `/trabajos`) must keep working through this change.
- [ ] **Step 2:** Write/extend tests first: `SelectedWork.test.tsx` and `TrabajosFilter.test.tsx` should assert real projects render via `EditorialSpread` with a variant assigned (don't assert a specific variant value if the heuristic is legitimately data-dependent — assert *a* valid variant is chosen, and that consecutive same-variant assignment doesn't happen given the current real project set).
- [ ] **Step 3:** Implement the variant-assignment heuristic and wire both components to render `EditorialSpread` instances instead of the old card markup. Preserve `TrabajosFilter.tsx`'s existing GSAP re-flow animation on filter change (retarget it at the new spread elements if the DOM structure changed enough to matter — verify the animation still completes cleanly, this project has a known failure class here from the prior plan's Task 7/9 nested-ScrollReveal bug, don't reintroduce a similar structural conflict).
- [ ] **Step 4: Verify** `npm test && npm run build`. Real browser check on both `/` and `/trabajos`: confirm genuine visual variety (no two adjacent projects look like the same template), filter tabs still work with the re-flow animation intact, no horizontal overflow from `.breakout` elements, mobile viewport doesn't collapse the offset compositions into something broken (Task 13 does the dedicated mobile pass, but sanity-check now).
- [ ] **Step 5: Commit**

```bash
git add components/sections/SelectedWork.tsx components/sections/SelectedWork.module.css app/trabajos/TrabajosFilter.tsx app/trabajos/TrabajosFilter.module.css [+ test files]
git commit -m "feat: wire EditorialSpread into Home and /trabajos, retiring the uniform card grid"
```

---

### Task 6: Onboard the 4 unused real couples (28 photos) as new portfolio projects

Real content work — needed so Task 5's variety heuristic has enough real material, and because 28 real, paid-for photos sitting unused while the site launches is a genuine gap.

**Files:**
- Modify: `content/projects.ts` (add up to 4 new project entries)
- Copy/process: source images from `fotos eme/andrea y enrique/`, `fotos eme/marta y alvaro/`, `fotos eme/maria y francisco manuel/`, `fotos eme/rocío y juanje/` into `public/images/trabajos/<new-slug>/` (convert to `.webp`, matching the existing convention for `raquel-y-fran`/`andrea-y-jesus`)

**Decisions:**
- Per couple, select 3–5 of the strongest real photos (your own editorial judgment — this project's controller has done this exact selection task before for Raquel y Fran / Andrea y Jesús; apply the same bar: sharp focus, genuine emotional/compositional interest, real variety of shot type — not just "the first N files alphabetically").
- New slugs: `andrea-y-enrique`, `marta-y-alvaro`, `maria-y-francisco-manuel`, `rocio-y-juanje` (ASCII-safe, matching the existing slug convention — strip accents).
- `year`: verify via `sips -g creation <file>` (this project's established EXIF-verification practice) where reliable; if EXIF is unreliable/absent for a given set, omit the specific date and use year-only or omit entirely rather than presenting an unverified date as fact — same honesty discipline as `andrea-y-jesus`'s existing entry.
- `description`: short, honest, same register as existing entries (`raquel-y-fran`'s "Una boda con un pie de foto y otro en la carretera..." is the bar) — describe what's actually visible in the selected photos, don't invent narrative details you can't see.
- `category: 'boda'` for all 4 (verify this is accurate per each couple's actual photos — if any set is clearly a different event type, categorize honestly).
- `isPlaceholderMedia: false` for all newly-added real images (they are real).
- Do not touch the existing 3 already-integrated projects or the Fotomatón placeholder project in this task.

**Step-by-step:**

- [ ] **Step 1:** For each of the 4 couples' folders, view the real photos (Read tool handles images) and select 3–5 each. Note your selection rationale briefly (not committed anywhere permanent — just to keep your own reasoning consistent across all 4 sets).
- [ ] **Step 2:** Run `sips -g creation <file>` on at least one selected file per couple to check EXIF reliability, matching the project's established practice.
- [ ] **Step 3:** Convert selected originals to `.webp` (check what tool/settings the existing `raquel-y-fran`/`andrea-y-jesus` images were produced with — likely `cwebp`, matching quality/size — and use the same settings for consistency) into `public/images/trabajos/<slug>/`.
- [ ] **Step 4:** Add the 4 new entries to `content/projects.ts`, following the existing `Project` type shape exactly (check `content/types.ts`).
- [ ] **Step 5:** Update `content/projects.test.ts`'s `realSlugs` array (or equivalent placeholder-flagging logic — check its current shape, established in the prior plan's real-asset-integration work) to include the 4 new slugs.
- [ ] **Step 6: Verify** `npm test && npm run build`. Real browser check: all 4 new projects render correctly wherever `Task 5`'s wiring surfaces them (Home + `/trabajos` + their own detail pages via Task 7's routing, which already works generically for any `content/projects.ts` entry).
- [ ] **Step 7: Commit**

```bash
git add content/projects.ts content/projects.test.ts public/images/trabajos/andrea-y-enrique public/images/trabajos/marta-y-alvaro public/images/trabajos/maria-y-francisco-manuel public/images/trabajos/rocio-y-juanje
git commit -m "feat: onboard 4 real couples (Andrea y Enrique, Marta y Álvaro, María y Francisco Manuel, Rocío y Juanje) as portfolio projects"
```

---

### Task 7: Project detail page (`/trabajos/[slug]`) — editorial rebuild

**Files:**
- Modify: `app/trabajos/[slug]/page.tsx`, its `.module.css`, `components/sections/ProjectGallery.tsx`/`.module.css`, associated test files

**Decisions:**
- Replace the current cover-media-block-then-uniform-gallery-grid structure with a continuous, full-bleed editorial sequence: cover media full-viewport, then each gallery image presented at its own real aspect ratio in a single-column full-bleed or near-full-bleed flow (not a grid) — think long-form photo-essay scroll, not a thumbnail wall. The existing `Lightbox` component (already accessible, focus-trapped, keyboard-operable) stays as the way to view any image at full size — this task changes the *in-page* presentation, not the Lightbox itself. (Correction: `docs/PATRONES-AWWWARDS.md`'s A3 pattern, which this task now folds in, suggested dropping the lightbox entirely — explicitly not adopted here; it's working, accessible, already-reviewed infrastructure with no real reason to discard, and removing it would lose video-in-lightbox playback for gallery video items.)
- Per A3's real, verified technique (not its "no lightbox" or "headline that doesn't name the couple" suggestions — the latter is new creative copy needing real client/creative input, out of scope here): each gallery item carries a `span: 'full' | 'wide' | 'half'` field driving `grid-column` in a single-column-equivalent flow (alternating full-bleed verticals and half/wide horizontals, not one rigid width), `priority` only on the first two images (the rest lazy), and a light per-image scroll parallax (`y: -8%` to `+8%`, `scrub: true`, transform-only, reduced-motion gated like every other scroll effect in this project). The initial reveal state must be set via `gsap.set` in JS, never a CSS default-hidden state — if the JS fails to run for any reason, the gallery must still be fully visible, not stuck invisible (this is the same "graceful default" principle already applied elsewhere in this codebase, e.g. `ScrollReveal`'s reduced-motion path).
- Project title/metadata (`CATEGORY_LABELS[project.category]`, year, location — already correctly using display labels, not raw slugs, per this session's own earlier audit) gets a more considered typographic treatment matching the new Hero/portfolio type scale, rather than the current single `<p className={styles.meta}>` line. Keep real couple names as the identifying title (not a poetic non-naming headline) — matches this project's established identity/honesty conventions.
- Keep the "next project" navigation link (`NextProjectLink.tsx`, if that's the current mechanism — verify) but restyle to match the new understated text-link idiom (no button chrome), consistent with this plan's global CTA decision.

**Step-by-step:**

- [ ] **Step 1:** Read `app/trabajos/[slug]/page.tsx`, `ProjectGallery.tsx`/`.module.css`, `Lightbox.tsx`, and `NextProjectLink.tsx` in full.
- [ ] **Step 2:** Extend/write tests confirming the full-bleed sequential layout renders every gallery image (no images silently dropped in the restructure) and the Lightbox still opens correctly from any image, cover included (this exact cover+gallery-shared-Lightbox mechanism was carefully built in the prior plan's Task 5 — don't regress it; re-read that task's ledger entry for context on the `openMedia: ProjectMedia | null` pattern before touching `ProjectGallery.tsx`).
- [ ] **Step 3:** Implement the restructured layout.
- [ ] **Step 4: Verify** `npm test && npm run build`. Real browser + keyboard check: every gallery image reachable and Lightbox-openable via mouse and keyboard, `Reproducir` still works for video covers/items, next-project link works, mobile doesn't break the full-bleed sequence into overflow.
- [ ] **Step 5: Commit**

```bash
git add app/trabajos/[slug]/page.tsx app/trabajos/[slug]/page.module.css components/sections/ProjectGallery.tsx components/sections/ProjectGallery.module.css [+ tests]
git commit -m "feat: rebuild project detail page as a continuous full-bleed editorial sequence"
```

---

### Task 8: Services rebuild — kill the bullet lists, scroll-driven one-service-per-viewport

The audit's single worst offender: `/servicios` currently renders each service's inclusions as a raw `<ul><li>• ...</li></ul>`.

**Files:**
- Modify: `app/servicios/page.tsx`, `app/servicios/page.module.css`, `components/sections/ServiciosPreview.tsx`/`.module.css` (Home), associated tests

**Decisions:**
- `/servicios` page: each service (`content/services.ts` — Fotografía de Boda, Vídeo, Fotomatón) gets its own near-full-viewport "moment" as the user scrolls — large service name (chapter-numbered per this plan's global motif), the service's existing description/process copy set in a considered editorial column (not a bullet list — if the underlying data is inherently list-shaped, e.g. `process` steps, render them as a numbered sequence using the same typographic numeral treatment as chapter numbers, scaled down, NOT `<li>•</li>` bullets), and the service's real associated image full-bleed or large.
- Home's `ServiciosPreview`: keep its existing numbered-list + hover-swap-image interaction (already the best-reviewed interaction on the site per the audit) — this task's job here is only to make sure its container no longer uses the shared generic-section wrapper (Task 1), not to change its core mechanic.
- No new dependency for scroll-driven viewport-snapping — achieve the "one service per near-full-viewport moment" via generous `min-height`/vertical padding and `ScrollReveal`-driven entrance per service, not a hard scroll-snap (scroll-snap can fight Lenis's smooth-scroll and this project has no precedent for combining them — don't introduce that risk for this task).

**Step-by-step:**

- [ ] **Step 1:** Read `app/servicios/page.tsx`/`.module.css`, `content/services.ts`, `content/types.ts` (for the `Service` shape, including any `process` field), and `ServiciosPreview.tsx`/`.module.css` in full.
- [ ] **Step 2:** Extend/write tests: assert no `<ul>`/`<li>` bullet rendering remains for service inclusions (query for it explicitly and assert absence, or assert the new numbered/typographic structure is present instead).
- [ ] **Step 3:** Implement the `/servicios` page rebuild and the `ServiciosPreview` container-only change.
- [ ] **Step 4: Verify** `npm test && npm run build`. Real browser check: no bullet-point lists visible anywhere on `/servicios`, each service reads as a distinct editorial moment, Home's hover-swap preview still works exactly as before.
- [ ] **Step 5: Commit**

```bash
git add app/servicios/page.tsx app/servicios/page.module.css components/sections/ServiciosPreview.tsx components/sections/ServiciosPreview.module.css [+ tests]
git commit -m "feat: rebuild /servicios as scroll-driven editorial moments, killing the bullet-list rendering"
```

---

### Task 9: About (`SobreEmePreview`) and Manifiesto — typographic refinement, chapter-numeral integration

Smaller, more surgical than Tasks 4–8: both sections already have reasonable bones (2-col editorial layout; the masked-photo scroll-reveal mechanic) per the audit — this task pushes typography/whitespace further and folds in the chapter-numeral motif, without restructuring either section's core mechanic.

**Files:**
- Modify: `components/sections/SobreEmePreview.tsx`/`.module.css`, `components/sections/Manifiesto.tsx`/`.module.css`, associated tests

**Decisions:**
- `SobreEmePreview`: replace its container's use of the generic wrapper idiom (Task 1's finding) with bespoke asymmetric column proportions (e.g. an intentionally uneven split, not a clean 50/50), add a chapter numeral, and push the type scale — allow the heading to break onto the page at a genuinely large size rather than the current, more conservative `--type-h2` if it still reads well (verify live, this is a judgment call).
- `Manifiesto`: keep the masked-photo `background-clip: text` mechanic entirely untouched (it works, it's distinctive, don't risk regressing the Task 7/9 nested-ScrollReveal bug class this project has twice fixed) — only change its outer container to drop the shared-wrapper idiom and add a small chapter numeral near the heading.

**Step-by-step:**

- [ ] **Step 1:** Read both components/CSS files in full. For Manifiesto specifically, re-read this plan's own "no filter/backdrop-filter additions" constraint and the prior plan's ledger notes on the nested-ScrollReveal failure class before touching anything near the masked heading's DOM structure.
- [ ] **Step 2:** Implement the container/typography changes for both. No new tests needed for pure visual/CSS changes (per Global Constraints) — extend a test only if you add or change any conditional rendering logic.
- [ ] **Step 3: Verify** `npm test && npm run build`. Real browser check, specifically re-verifying (per the established regression risk) that Manifiesto's scroll-scrubbed opacity crossfade still animates smoothly from 0→1 and back, not stuck at a partial value (use `getComputedStyle` on the masked span mid-scroll, matching this project's own established verification method for this exact component).
- [ ] **Step 4: Commit**

```bash
git add components/sections/SobreEmePreview.tsx components/sections/SobreEmePreview.module.css components/sections/Manifiesto.tsx components/sections/Manifiesto.module.css
git commit -m "feat: refine About/Manifiesto typography and container rhythm, add chapter numerals"
```

---

### Task 10: Testimonials rebuild as an editorial pull-quote + Confianza retirement

**Files:**
- Modify: `components/sections/Testimonios.tsx`/`.module.css`, associated tests
- Modify: `components/sections/Confianza.tsx`/`.module.css` → remove as a standalone rendered section; its two real numbers move into `Footer.tsx` (Task 11)
- Modify: wherever `<Confianza />` and `<Testimonios />` are composed into `app/page.tsx` — update accordingly

**Decisions:**
- `Testimonios`: drop the bordered-row-with-avatar-circle list shape. Present the 4 real, verified Bodas.net reviews as oversized editorial pull-quotes — large serif opening/closing quote glyphs as graphic elements (not `"` character-quotes inline, actual large typographic quote marks positioned as composition elements), one quote's text set large (near `--type-h3` scale) with the attribution small beneath, cycling between the 4 reviews (a simple, reduced-motion-respecting auto-advance or a minimal manual next/prev control — your call, keep it simple, no carousel-library dependency).
- `Confianza`: this task removes it from `app/page.tsx`'s render tree. Do NOT delete `Confianza.tsx`/its test file outright in this task (Task 11 handles the actual data migration into Footer) — just stop rendering it on the page. If Task 11 ends up not needing the component at all afterward, that task deletes the file; keep this task's diff focused.

**Step-by-step:**

- [ ] **Step 1:** Read `Testimonios.tsx`/`.module.css`, `Confianza.tsx`, and `content/site.ts`/wherever the 4 real testimonials live (`content/testimonials.ts`? verify the actual file) and `app/page.tsx`'s current section composition order.
- [ ] **Step 2:** Extend `Testimonios.test.tsx`: assert all 4 real testimonials are still represented in the DOM (even if only one is visually "active" at a time via the cycling mechanism — don't silently drop 3 of 4 reviews from the accessible DOM; if using a cycling UI, ensure non-visible ones are still reachable/announced appropriately, not `display:none`-hidden from assistive tech permanently).
- [ ] **Step 3:** Implement the pull-quote rebuild. Remove `<Confianza />` from `app/page.tsx`.
- [ ] **Step 4: Verify** `npm test && npm run build`. Real browser + reduced-motion + keyboard check on the new testimonial cycling mechanism specifically (any auto-advance must pause/not run under reduced motion, matching this project's hard rule).
- [ ] **Step 5: Commit**

```bash
git add components/sections/Testimonios.tsx components/sections/Testimonios.module.css components/sections/Testimonios.test.tsx app/page.tsx
git commit -m "feat: rebuild Testimonios as editorial pull-quotes, remove Confianza stat-bar from the page"
```

---

### Task 11: Final CTA + Footer rebuild

**Files:**
- Modify: `components/sections/CtaContacto.tsx`/`.module.css`, `components/layout/Footer.tsx`/`.module.css`, associated tests
- Modify/Delete: `components/sections/Confianza.tsx` and its test (migrate its 2 real numbers into `Footer.tsx`, then delete the now-unused standalone component and test file)

**Decisions:**
- `CtaContacto`: replace the centered-heading-paragraph-button block entirely with a full-bleed real photograph (select one of the studio's genuinely striking real photos not already used as a "hero" moment elsewhere on the site — check what's available across all now-integrated projects, including Task 6's new ones, to avoid re-using the exact same image twice in one page-scroll) with the existing CTA copy ("¿Celebras algo importante? Cuéntanos tu fecha...") overlaid asymmetrically (not centered), and "Empezar un proyecto" rendered as an understated animated-underline text link (per this plan's global no-filled-buttons decision), not the current solid maroon rectangle.
- `Footer`: restyle beyond plain text rows — still minimalist per the brief (footers aren't the place for heavy art direction), but bring it in line with the new type/spacing system (Task 1's tokens) rather than leaving it as the one remaining completely unstyled section. Add Confianza's 2 real numbers (2.320 Facebook / 1.622 Instagram, already thousands-separator-formatted from this session's earlier fix) as a small detail line — e.g. "2.320 me gusta en Facebook · 1.622 seguidores en Instagram" in small type, clearly secondary to the studio name/contact/social links, not a headline stat.
- After migrating, delete `Confianza.tsx`, `Confianza.module.css`, `Confianza.test.tsx` (confirm nothing else imports `Confianza` before deleting — grep first).

**Step-by-step:**

- [ ] **Step 1:** Read `CtaContacto.tsx`/`.module.css`, `Footer.tsx`/`.module.css`, and `Confianza.tsx`/`.test.tsx` in full. Grep the repo for `Confianza` to confirm `app/page.tsx` (already edited in Task 10) is the only importer before planning the deletion.
- [ ] **Step 2:** Extend/write tests: `CtaContacto.test.tsx` asserts the CTA renders as a text link (not a `<button>`-styled `<a>` — check via computed role/absence of button-chrome classes, or simply assert the specific new class names exist) and the underlying `href`/copy are unchanged (still real, still `mailto:`/`tel:`/route as appropriate — verify what it currently points to). `Footer.test.tsx` asserts the 2 real numbers render with correct formatting.
- [ ] **Step 3:** Implement both rebuilds. Delete `Confianza.tsx`/`.module.css`/`.test.tsx`.
- [ ] **Step 4: Verify** `npm test && npm run build`. Real browser check: CTA reads as a genuine full-bleed editorial closing moment (not a landing-page CTA block), Footer looks intentional rather than default-browser-text, no dead import errors from the Confianza deletion.
- [ ] **Step 5: Commit**

```bash
git add components/sections/CtaContacto.tsx components/sections/CtaContacto.module.css components/layout/Footer.tsx components/layout/Footer.module.css
git rm components/sections/Confianza.tsx components/sections/Confianza.module.css components/sections/Confianza.test.tsx
git commit -m "feat: rebuild final CTA as a full-bleed photo moment, restyle Footer, retire Confianza stat-bar"
```

---

### Task 12: De-duplicate the `/trabajos` and `/servicios` page-header partial

The audit's other named "literal CMS page-template" smell: both pages currently share a pixel-identical page-header block (logo, one nav indicator, big serif `<h1>`, subneath).

**Files:**
- Modify: `app/trabajos/page.tsx` (or wherever its header block lives — check if `TrabajosFilter.tsx` renders it or a parent page file), `app/servicios/page.tsx`, their `.module.css` files

**Decisions:**
- `/trabajos`: open with a full-bleed real image from the featured/most recent project (not a plain text title) — the page title can be smaller, overlaid on or beside that image, echoing the portfolio's own new editorial-spread language rather than a generic "page banner."
- `/servicios`: open differently — since Task 8 already restructured the page into per-service scroll moments, its "header" can simply BE the first service's own full moment (no separate generic banner needed at all) — verify this reads well live rather than feeling like a missing element.
- This task depends on Task 8 (services restructure) already having landed — sequence accordingly if dispatch order needs adjusting.

**Step-by-step:**

- [ ] **Step 1:** Read both pages' current header-rendering code to find exactly where the shared partial lives.
- [ ] **Step 2:** Implement each page's bespoke opener per the decisions above.
- [ ] **Step 3: Verify** `npm test && npm run build`. Real browser check: the two pages no longer look like the same template with different text.
- [ ] **Step 4: Commit**

```bash
git add app/trabajos/page.tsx app/trabajos/*.module.css app/servicios/page.tsx app/servicios/page.module.css
git commit -m "feat: give /trabajos and /servicios distinct openers, retiring the shared page-header partial"
```

---

### Task 13: Mobile-specific dedicated pass

Mirrors the prior plan's Task 10. Everything above must be re-verified specifically on mobile — full-bleed breakouts, offset/overlap compositions, and cursor-reactive Hero depth all carry real mobile-specific risk that per-task sanity-checks won't fully catch.

**Files:** whichever `.module.css`/component files need mobile-specific adjustment — determined by testing, not pre-declared.

- [ ] **Step 1:** Real mobile-viewport testing (390px, 428px, and a narrow 360px) across every route touched by Tasks 1–12, using `playwright-cli` (this project's established working tool for real-viewport screenshots — `resize_window` is a confirmed no-op in this environment).
- [ ] **Step 2:** For each issue found — a `.breakout` element causing horizontal scroll, an `overlap-pair`/`diptych` spread collapsing illegibly, the cursor-reactive Hero effect's `pointermove` listener firing uselessly on touch (should already be gated via `matchMedia('(hover:hover)')` from Task 3 — verify this actually holds on a real mobile emulation, not just in theory), chapter numerals overflowing at 360px — fix directly, document before/after.
- [ ] **Step 3: Verify** `npm test && npm run build` after all fixes; re-walk every route once more end to end on mobile.
- [ ] **Step 4: Commit**

```bash
git add -A  # file list genuinely unknowable in advance
git commit -m "fix: mobile-specific pass across the editorial redesign"
```

---

### Task 14: Final performance, accessibility, and reduced-motion verification

Mirrors the prior plan's Task 11. This plan added meaningfully more motion (Hero cursor-tracking, portfolio spread entrances, testimonial cycling, per-service scroll moments) — re-verify all of it holds the project's real, previously-passing bar (Lighthouse ~0.99/1.00/1.00/1.00) rather than assuming it does.

**Files:** none modified unless this task's own checks surface a regression to fix.

- [ ] **Step 1:** Real Lighthouse pass (production build, `npm run build && npm start`, confirm no stray dev-server process is squatting on the port first) against `/`, `/trabajos`, `/trabajos/<a task-6 project slug>`, `/servicios`. Compare against the retained baseline.
- [ ] **Step 2:** Reduced-motion sweep across every animation introduced or touched by Tasks 1–13 (progressive Hero reveal, cursor-reactive depth, portfolio spread entrances, testimonial cycling, per-service scroll reveals, chapter-numeral entrances if animated) — confirm each falls back to a complete, usable static experience, not just "doesn't crash."
- [ ] **Step 3:** Keyboard-only pass across every new/changed interactive element (the unified menu toggle, portfolio spread links, testimonial cycling controls if manual, the new CTA text link) — confirm reachable, operable, visible focus states.
- [ ] **Step 4:** If any regression is found, fix directly, re-verify, document in this task's commit. A clean pass with no code change is a valid, complete outcome.
- [ ] **Step 5: Commit** (only if a fix was needed)

```bash
git add <fixed files>
git commit -m "fix: performance/accessibility regressions found in final editorial-redesign verification pass"
```

---

## Self-Review Notes

- **Brief coverage:** Hero (§3) → Task 3 (evolves, doesn't replace the prior plan's Task 1 work). Scroll experience (§4) → distributed across Tasks 3/4/8/9 as curated, non-stacked techniques per section, not a single "add all the listed techniques" task. Portfolio (§5) → Tasks 4/5/6/7, the largest single investment in this plan, matching the brief's own heaviest emphasis. Microinteractions (§6) → covered incidentally by Tasks 2 (menu), 3 (cursor depth), 4 (hover/focus zoom) rather than a dedicated task — the brief's own §6 items are mostly refinements of mechanisms this plan already touches elsewhere, a dedicated task would duplicate effort. Typography (§7) → Task 1 (chapter numerals) + Task 9 (About/Manifiesto scale) + distributed through every section-rebuild task's own type decisions. Negative space (§8) → the retirement of the shared section wrapper (Task 1's core purpose) IS the mechanism for this; not a separate task. Navigation (§9) → Task 2. Color (§10) → deliberately not a task; audit confirmed the existing tokens are sound, and the brief's own §10 says "adapta la paleta a las fotografías" — the photography is already ink/warm-neutral-toned, matching the existing palette, so no change is the correct, evidence-based call, not a skipped step. Motion/performance (§11) → distributed as a hard Global Constraint across every task + Task 14's dedicated final pass. Responsive (§12) → Task 13. Photography treatment (§13) → Task 4's variant system is the direct answer. Section architecture (§14) → the brief's own suggested narrative is NOT followed literally (explicitly permitted: "no tienes que seguir esta estructura literalmente") — this plan keeps the existing, already-reasonable section order (Hero → Manifiesto → Portfolio → Services → About → Testimonials → CTA → Footer) and fixes the RHYTHM within that order rather than reshuffling section order, since the audit found no evidence the order itself is the problem (the wrapper idiom is). Detail refinement (§15) → distributed through every task's own "Verify" step demanding real browser checks, not a separate polish task. §16 (the "stop and ask if this is generic" self-check) → encoded as the review discipline at the end of each task (task reviewer + this plan's own final whole-branch review, matching this project's established SDD process). §17 (explicit anti-pattern list) → every named anti-pattern maps to a specific fix: generic-CTA-with-button → Task 11; repetitive cards → Tasks 4/5; perfect grid → Task 4; shadows/borders/border-radius/gradients/glassmorphism → not present in the current codebase per the audit (nothing to remove) and forbidden from being introduced via Global Constraints; centered text constantly → Task 1's wrapper retirement; repeating section patterns → Task 1 (root cause) + every section task (symptom fixes); unnecessary icons → not present per audit, nothing to remove; WordPress/Elementor look → the plan's entire purpose. §18 (final design-review criterion) → Task 14 + this plan's own final whole-branch review step (per `subagent-driven-development`'s standard closing sequence) is where "does this still look like a template?" gets asked one more time with fresh eyes, exactly as the brief demands.
- **Deliberately NOT built, with reasoning:** a literal reordering of page sections per the brief's suggested narrative (§14) — audit found no evidence order is the problem, only rhythm within the existing order; reordering without evidence would be change for its own sake. Horizontal-scroll sections, sticky-scroll sections, and additional clip-path/masking techniques beyond what Tasks 3/4/9 already specify (§4's full technique list) — curated out per this project's own "curate, don't accumulate" ruling, exactly as the prior plan curated hollywoodexhibit2026.com's masked-photo technique as ONE signature moment rather than adopting every technique on every reference site. A new color palette (§10) — audit-confirmed unnecessary. Any WebGL exploration (§4's "profundidad" language could be read as implying it, but explicitly isn't) — restated hard ruling, evidence-based from real reference-site load-time measurements in the prior plan.
- **Type/interface consistency checked:** `EditorialSpread`'s props (Task 4) are consumed identically by Tasks 5 and 7 (Home, `/trabajos`, and project-detail-page cover treatment) — same variant enum, same prop shape, no drift. `Confianza`'s data migrates to `Footer` (Task 11) only after `Testimonios`/`app/page.tsx` (Task 10) stops rendering `<Confianza />` — sequenced correctly so no task ever imports a component another task is mid-deletion of. Task 12 explicitly depends on Task 8 landing first (documented in Task 12's own decisions) since `/servicios`'s new opener strategy assumes Task 8's restructure already exists.
- **No placeholders:** every task above has concrete files, concrete decisions, and either complete implementation guidance or an explicitly bounded scope for implementer judgment (e.g. Task 6's photo-selection judgment, Task 4's variant-assignment heuristic, Task 3's exact reveal-timing choice) — never a bare "add appropriate styling" instruction.
