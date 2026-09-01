# EME Fotografía Sevilla — Art Direction Reconstruction (v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site's visual/motion identity so it reads as a real audiovisual studio's portfolio — cinematic, editorial, asymmetric, dynamic — instead of the current generic editorial-corporate template feel, without regressing the project's established discipline (real Lighthouse Performance ~0.95, WCAG AA, `prefers-reduced-motion` respected everywhere, Spanish-only copy, no fabricated business facts).

**Architecture:** Same stack throughout — Next.js App Router, CSS Modules + `styles/tokens.css` custom properties, GSAP + ScrollTrigger + Lenis for motion, `next/image`/`next/font`. No WebGL, no new UI framework, no Tailwind. This is a redesign of composition, rhythm, and motion within the existing engineering foundation, not a rewrite of it.

**Tech Stack:** Next.js 16, React, CSS Modules, GSAP/ScrollTrigger, Lenis, `focus-trap` (Lightbox only).

**Spec:** This plan's spec is the client's own 29-section art-direction brief (delivered 2026-09-01, in-session) plus the two prior specs this project already implements: `docs/superpowers/specs/2026-08-31-eme-fotografia-web-design.md` (base) and the incremental plan's own accumulated rulings (`docs/superpowers/plans/2026-08-31-eme-fotografia-web-incremental.md`). Where the new brief conflicts with an established, evidence-based ruling from the incremental plan (specifically: no WebGL, load-time discipline), the established ruling wins — restated per-task below where relevant.

## Why this plan exists

A controller-run visual audit of the incremental plan's finished state (browsing every route in a real browser) found three Home-page sections shipping with **zero CSS** (raw browser-default markup: `ServiciosPreview`, `SobreEmePreview`, `CtaContacto`) and a Hero background photo of a clothing rack with no connection to wedding photography. Shown this, the client rejected fixing these as isolated bugs and asked for a full art-direction reconstruction — citing the current build as reading like "una plantilla de WordPress," missing the real logo entirely (the logo files existed in `public/images/logo/` but nothing in the app referenced them), and lacking cinematic identity, rhythm, and motion. The client's own words: *"Trabaja directamente sobre el proyecto... No pares."* — explicit instruction to execute without a further approval checkpoint, unlike the prior creative-brief episode (which required a research-then-present-then-approve cycle before writing tasks).

**Already done, before this plan's Task 1 (commit `90882e4`):** the Header now renders the real logo (`public/images/logo/eme-logo.png`) instead of the brand name as plain text, with `mix-blend-mode: difference` moved off the logo (so it renders true-color) and kept only on the nav text/menu button (so those stay legible over any background).

## Global Constraints

- No Tailwind; CSS Modules + `styles/tokens.css` custom properties only. Extend tokens where the brief calls for genuinely new values (e.g. new type-scale steps for small metadata labels) — add them to `styles/tokens.css`, don't hardcode magic values in component CSS.
- Animate only `transform`/`opacity` (GPU-cheap); never animate `width`/`height`/`top`/`left`/layout properties directly — use `transform: scale()`/`translate()` instead. Every animation must be gated behind `useReducedMotion()` (client components) or `@media (prefers-reduced-motion: reduce)` (pure CSS).
- **No WebGL.** Restated from the incremental plan's own evidence-based ruling: a reference site using WebGL cost 25+ seconds of load time in real measurement; the equally-or-more-acclaimed fast sites achieve the premium feel via scale/asymmetry/typography/rhythm, not WebGL. This project's real, currently-passing Lighthouse Performance score (~0.95) is a hard line, not a suggestion — re-verify it after every task that touches Hero, portfolio, or scroll behavior (Task 12).
- All user-facing copy in Spanish. The brief's own English placeholder labels (VIEW, PLAY, EXPLORE, OPEN, DRAG) are creative-direction shorthand, not a request to switch the site's language — implement the equivalent Spanish labels (VER, REPRODUCIR, EXPLORAR, ABRIR, ARRASTRAR), consistent with this project's existing hard constraint and the cursor's existing `ver`/`reproducir` states.
- Never fabricate business facts. This plan is entirely visual/motion/structural — no task here should introduce new claims about the business (hours, policies, pricing, dates). Where a task needs real estate for copy (e.g. the About section rewrite), reuse or lightly rephrase copy that's already been through the honesty process (`content/site.ts`, `Manifiesto.tsx`'s existing copy, `content/services.ts`), never invent a new fact.
- Curate, don't accumulate. The client's own instruction: *"10 animaciones excelentes antes que 50 mediocres."* Each task below is scoped to ONE clear technique with a clear purpose — do not layer in extra effects beyond what a task specifies, even if the brief's source section lists more.
- Mobile is not "shrink desktop." Task 11 is dedicated to this, but every earlier task's implementer must sanity-check their own change at a narrow viewport (checked into that task's own verification steps) — no task is "done" if it introduces horizontal overflow or an unusably dense mobile layout.
- TDD where the change is behavioral (JS logic, motion triggers, interaction state). Pure CSS/visual tasks don't need new unit tests for the visual outcome itself (unit tests can't meaningfully assert on visual design) — verify those with the full suite (regression safety) + a real browser check (documented per task).

---

### Task 1: Hero rebuild — real footage, layered asymmetric composition

The current Hero uses a generic stock photo (a clothing rack) with a centered title — the single most jarring "generic template" signal on the whole site, and the first thing every visitor sees. This project already has real footage: the edited wedding video at `public/videos/previews/real-boda-01-full.mp4` (Eva y Rafa, `content/projects.ts`'s `boda-real-01` project). Using it as the Hero background is a genuine, honest upgrade (real footage, not a better stock photo) that directly answers the brief's repeated emphasis on **CINEMA** and motion as the site's first impression.

**Files:**
- Modify: `components/sections/Hero.tsx`, `components/sections/Hero.module.css`
- Test: `components/sections/Hero.test.tsx` (existing — extend)

**Interfaces:** `<Hero />` keeps its zero-prop signature. No change to `content/projects.ts` or any content module.

**Composition (background / midground / foreground, per the brief's own layering language):**
- **Background:** `public/videos/previews/real-boda-01-full.mp4` on loop, muted, `playsInline`, poster `public/videos/posters/real-boda-01-full.webp` (already exists), covering the full Hero viewport (`object-fit: cover`). This replaces `Hero.tsx`'s current `<Image>` — keep the existing `.imageParallax` wrapper's contained-parallax GSAP tween (Task 21 of the incremental plan), just re-target it at the `<video>` element instead of the `<Image>`. Playback must be driven the same way `VideoPreview.tsx` already does it — NOT the native `autoPlay` HTML attribute: an imperative `useEffect` that calls `.play()`/`.pause()` on the `<video>` ref, gated on `!reducedMotion` (`VideoPreview.tsx` also gates on `IntersectionObserver` visibility, which doesn't apply the same way to a Hero that's visible on load — your call whether to keep an intersection check for when the user scrolls the Hero out of view, but the reduced-motion gate is non-negotiable: with reduced motion, never call `.play()`, show the static poster instead). Read `VideoPreview.tsx` in full before writing this — reuse its exact pattern, don't invent a new one.
- **Midground:** the `EME Fotografía Sevilla` wordmark, made asymmetric — not centered. Move it to align with the left edge (matching the Header's logo left-alignment, creating a vertical relationship between the fixed header and the Hero title) and let it sit lower in the viewport (bottom-left, roughly where it already is per the current `.content` block), but increase its dominance: it should feel like the largest single element on the page. Use `--type-h1` (already reserved for exactly this) and consider letting the wordmark break onto two lines with a tighter line-height for more graphic weight, rather than one long line.
- **Foreground:** a small tracked-uppercase descriptor line (reuse the existing tagline copy: "Fotografía y vídeo de bodas y eventos en Sevilla, con la mirada de un editorial de moda.") styled as a small metadata-style label (new type token, see Task 8) — not the same visual weight as the title — plus a scroll indicator (a simple small element, e.g. a thin vertical line or chevron, subtly animating on a loop, gated behind reduced-motion) in a corner.

**Step-by-step:**

- [ ] **Step 1: Read before touching**

Read `components/motion/VideoPreview.tsx` in full (for the autoplay/poster/reduced-motion pattern to reuse) and the current `components/sections/Hero.tsx`/`.module.css` in full (you're modifying, not rewriting from scratch — the existing `useReducedMotion()` intro-timer effect and Task 21's parallax `useEffect` both stay, just retarget the parallax's `imageRef` at the new video element).

- [ ] **Step 2: Write/extend the failing test**

Extend `components/sections/Hero.test.tsx`: assert the Hero renders a `<video>` element with `src` pointing at `real-boda-01-full.mp4` and a `poster` pointing at `real-boda-01-full.webp`, and that `.play()` is called on the video element when motion is not reduced but NOT called when `useReducedMotion()` returns true (mirror however `VideoPreview.test.tsx` asserts this same distinction — read that test file too, match its pattern, including how it mocks `HTMLMediaElement.prototype.play` in jsdom, which has no real media pipeline).

- [ ] **Step 3: Implement**

Rework the JSX and CSS per the composition above. Keep `priority` semantics for the poster image (LCP-relevant) via whatever mechanism `next/image`'s poster-swap-in pattern already uses elsewhere in this codebase (check `VideoPreview.tsx`). Do not introduce `fill` on the `<video>` itself in a way that breaks the existing `.imageParallax` wrapper's `inset: -8%` overscan technique from Task 21 — that technique still applies, just to a `<video>` instead of an `<Image>`.

- [ ] **Step 4: Verify**

Run `npm test -- components/sections/Hero.test.tsx && npm test && npm run build`. Start the app, view `/` at desktop and at a narrow (< 400px) viewport width, confirm: video plays (muted, looped) at desktop; poster shows with reduced motion emulated; wordmark reads clearly at both sizes; no horizontal overflow on mobile; scroll indicator doesn't overlap the wordmark.

- [ ] **Step 5: Commit**

```bash
git add components/sections/Hero.tsx components/sections/Hero.module.css components/sections/Hero.test.tsx
git commit -m "feat: rebuild Hero with real wedding footage and asymmetric layered composition"
```

---

### Task 2: Header/nav — scroll-aware, typographic

Give the nav more character per the brief while keeping it "extremadamente usable" (the brief's own requirement).

**Files:**
- Modify: `components/layout/Header.tsx`, `components/layout/Header.module.css`
- Test: `components/layout/Header.test.tsx` (existing — extend)

**Interfaces:** `<Header />` unchanged signature. Reuse `useReducedMotion()` (already imported project-wide via `@/lib/hooks/useReducedMotion`).

- [ ] **Step 1: Hide-on-scroll-down, show-on-scroll-up**

Add a `useEffect` tracking `window.scrollY` delta (throttled via `requestAnimationFrame`, not a raw scroll listener firing unthrottled) that toggles a `data-hidden` attribute (or a CSS class) on the header, translating it `translateY(-100%)` when hidden. Gate the *animation* (the `transition` on `transform`) behind `useReducedMotion()` — with reduced motion, the header can still hide/show, just without an animated transition (instant, or simply always-visible if you judge that safer — your call, document which you chose and why). Never hide the header while the mobile menu is open.

- [ ] **Step 2: Typographic nav labels**

Restyle `.desktopNav a` — remove any button/border chrome if present (check current CSS first), use small-caps or tracked uppercase treatment (`letter-spacing`, `text-transform: uppercase`, smaller font-size than body) for a more editorial feel, keeping the existing `aria-current="page"` underline treatment (Task 4 of the incremental plan) working.

- [ ] **Step 3: Test + verify**

Extend `Header.test.tsx` to cover the show/hide behavior (mock/dispatch scroll events, assert the class/attribute toggles correctly at reasonable thresholds — e.g. don't hide until scrolled past some minimum, so the header doesn't flicker at the very top of the page). Run full suite + build. Manually verify in-browser: scroll down (header hides), scroll up (header reappears), open mobile menu while scrolled down (header stays visible, not clipped).

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx components/layout/Header.module.css components/layout/Header.test.tsx
git commit -m "feat: scroll-aware header with typographic nav treatment"
```

---

### Task 3: Custom cursor — extend states sitewide

`components/motion/Cursor.tsx` already supports `ver`/`reproducir`/`arrastrar` (Task 16 of the incremental plan removed the last one as dead — it's being reintroduced here with a real consumer, which is why that removal was correct at the time: don't treat this as contradicting that earlier ruling). Wire real `data-cursor` consumers across the site instead of just `SelectedWork.tsx`'s existing `data-cursor="ver"`.

**Correction (2026-09-01, ruling recorded in this plan's ledger before Task 3 was dispatched):** the original draft of this task listed `components/sections/ServiciosPreview.tsx` as a file to modify, and `app/trabajos/[slug]/page.tsx` under a mistaken assumption it has its own direct links. Both are wrong: `ServiciosPreview.tsx` is about to be entirely rebuilt by Task 6 (numbered list, hover/focus-driven imagery) — adding `data-cursor` to its current bare `<ul>` markup now would be immediately superseded/discarded, wasted work. Removed from this task's scope; Task 6's implementer adds the appropriate `data-cursor` state directly as part of that rebuild instead. Separately, `app/trabajos/[slug]/page.tsx` was checked and has zero direct `<a>`/`<Link>` elements of its own — its only link is rendered via `<NextProjectLink>`, already separately listed — so it needs no changes here and is removed from the file list. `components/sections/ProjectGallery.tsx` was also checked and already renders its video items via `<VideoPreview>`, which already sets `data-cursor="reproducir"` on itself internally — that mapping is already fully done sitewide, no gallery-specific work needed; removed from the file list too. Added instead: `components/layout/Footer.tsx` (+ its existing test file), which the task's own prose already correctly identified as needing the `abrir` treatment for its real Instagram/Facebook external links (confirmed present at `Footer.tsx:14-15`) but which the original file list omitted.

**Files:**
- Modify: `components/motion/Cursor.tsx` (add `abrir`/`explorar` labels), `app/trabajos/TrabajosFilter.tsx`, `components/ui/NextProjectLink.tsx`, `components/layout/Footer.tsx`
- Test: `components/motion/Cursor.test.tsx` (existing — extend for new labels), plus each touched component's existing test file (extend to assert the new `data-cursor` attribute is present)

**Interfaces:** `LABELS` in `Cursor.tsx` gains `abrir: 'ABRIR'` and `explorar: 'EXPLORAR'`. No signature changes.

- [ ] **Step 1–4 (TDD per consumer):** for each touched component, add the failing test asserting the relevant interactive element has the correct `data-cursor` value, verify it fails, add the attribute, verify it passes. Mapping: project cards in `TrabajosFilter.tsx` → `ver` (matches `SelectedWork.tsx`'s existing convention); `NextProjectLink.tsx` → `explorar`; `Footer.tsx`'s Instagram/Facebook links (`target="_blank"`) → `abrir` (the `mailto:` link is NOT external in this sense, leave it alone). Video-opening triggers already have `reproducir` sitewide via `VideoPreview.tsx` — nothing to do there, don't add a redundant attribute.

- [ ] **Step 5: Verify** `npm test && npm run build`, manually hover each updated element on desktop (cursor only activates on `pointer: fine` devices per the existing `Cursor.tsx` check — nothing to change there) and confirm the correct label appears.

- [ ] **Step 6: Commit**

```bash
git add components/motion/Cursor.tsx components/motion/Cursor.test.tsx app/trabajos/TrabajosFilter.tsx components/ui/NextProjectLink.tsx components/layout/Footer.tsx <their test files>
git commit -m "feat: extend custom cursor states to more interactive elements sitewide"
```

---

### Task 4: Portfolio grid — editorial rhythm, typographic filters

Both `components/sections/SelectedWork.tsx` (Home) and `app/trabajos/TrabajosFilter.tsx` (`/trabajos`) currently use a fairly uniform grid (Task 17 of the incremental plan added a light stagger — every 3n+2 card offset vertically). This task pushes further: genuinely mixed card sizes (not just vertical offset) and a typographic filter nav instead of the current bordered-button tabs.

**Files:**
- Modify: `components/sections/SelectedWork.tsx`, `components/sections/SelectedWork.module.css`, `app/trabajos/TrabajosFilter.tsx`, `app/trabajos/TrabajosFilter.module.css`
- Test: existing test files for both — extend only where markup structure changes affect existing assertions (e.g. if you change `.card` from a uniform grid item to a variable-span item, tests asserting card count/content must still pass; tests asserting exact grid CSS values don't need new coverage — visual outcome, not testable behavior).

- [ ] **Step 1: Mixed card sizing**

In both grids, use CSS `grid-column: span 2` (or equivalent) on a deliberate subset of cards (e.g. the first card of every group of 4, or the video card specifically — a natural place to give it more visual weight) at wider viewports, alongside the existing 3n+2 vertical stagger. The goal is a grid that reads as "an editor chose this rhythm," not "every card is identical." Keep single-column stacking on narrow viewports (no spanning below your existing tablet breakpoint).

- [ ] **Step 2: Typographic filter nav**

Replace `TrabajosFilter.tsx`'s current bordered-box category buttons with a typographic treatment: tracked-uppercase labels in a horizontal row, separated by a thin divider or generous spacing (not boxes), with the active state shown via a *visually similar* underline treatment to `Header.tsx`'s `aria-current` styling — for visual consistency between the two typographic nav treatments now in the site. **Do not change the underlying ARIA pattern to match**: `TrabajosFilter.tsx`'s category buttons correctly use `role="tab"` + `aria-selected` (the right pattern for a tab-like filter widget, already implemented and not part of this task's scope) — `Header.tsx`'s `aria-current="page"` is for a different widget (navigation links to separate pages), and swapping one for the other would be an accessibility regression, not a fix. Style the underline off the existing `[aria-selected="true"]` state, matching the Header's underline CSS *values* (`text-decoration-color`, `text-underline-offset`) for consistency, not its ARIA attribute.

- [ ] **Step 3: Animated re-flow on filter change**

When the category filter changes, animate the transition instead of an instant re-render: fade+scale out the leaving cards, fade+scale in the entering ones (GSAP, `transform`/`opacity` only, gated behind `useReducedMotion()` — with reduced motion, fall back to the current instant swap). Keep the existing empty-state message (Task 6 of the incremental plan) working for categories with zero projects.

- [ ] **Step 4: Verify**

`npm test && npm run build`. Manually check: grid rhythm looks intentional at desktop and tablet widths; filter switching animates smoothly and doesn't flash/flicker; reduced-motion emulation shows the instant fallback; empty-state message for Fotomatón still renders correctly; no horizontal overflow on mobile.

- [ ] **Step 5: Commit**

```bash
git add components/sections/SelectedWork.tsx components/sections/SelectedWork.module.css app/trabajos/TrabajosFilter.tsx app/trabajos/TrabajosFilter.module.css <extended test files>
git commit -m "feat: editorial grid rhythm and typographic filter nav for portfolio views"
```

---

### Task 5: Project detail page — editorial gallery rhythm

**Correction (2026-09-01, ruling recorded in this plan's ledger before Task 5 was dispatched):** this task's original Step 2 assumed `page.tsx` already renders `project.cover` somewhere on the page, just too small, and asked to "increase its dominance." Checked directly: it doesn't render it AT ALL — `project.cover` is currently used ONLY inside `generateMetadata()` for the Open Graph `image` field, never in the page's visible JSX. `Page()` currently renders, in order: `<h1>`, meta line, optional impact line, description, `<ProjectGallery>` (which renders `project.gallery`, a *separate* field from `cover`), then `<NextProjectLink>`. So Step 2 isn't "resize an existing element" — it's "add a real cover-media hero block that doesn't exist yet." Rewritten below with a concrete design that reuses this project's already-established media components rather than inventing new autoplay/lightbox logic a third time.

**Files:**
- Modify: `app/trabajos/[slug]/page.tsx`, `app/trabajos/[slug]/page.module.css`, `components/sections/ProjectGallery.tsx`, `components/sections/ProjectGallery.module.css`
- Test: `app/trabajos/[slug]/page.test.tsx` (existing — extend)

- [ ] **Step 1: Add the cover hero block (the actual gap Step 2 originally described).**

In `Page()`, between the `<h1>`/meta block and `<ProjectGallery>`, add a new cover-media element rendering `project.cover`:
- If `project.cover.type === 'image'`: a large `next/image` in a `.coverWrap` (matching the established `position: relative; aspect-ratio: X; overflow: hidden` + `fill` + `object-fit: cover` pattern from `SelectedWork.module.css`), sized to dominate the top of the page (e.g. a wide, shortish aspect-ratio like `16/9` or `2/1` at desktop, taller on mobile) — genuinely bigger and more prominent than any single gallery thumbnail below it.
- If `project.cover.type === 'video'`: reuse `VideoPreview` (already used inside `ProjectGallery.tsx` for gallery video items — same component, same established gated-autoplay/poster/Lightbox-opening pattern) at this larger size, wired to the SAME `Lightbox` state `ProjectGallery` already manages internally today — this likely means either (a) lifting the `openIndex`/`Lightbox` state up from `ProjectGallery.tsx` into `Page.tsx` so both the new cover block and the gallery grid can open the same lightbox, or (b) giving the cover block its own independent small `Lightbox` instance. Prefer (a) if it's a clean lift (check how much `ProjectGallery.tsx`'s internals would need to change); fall back to (b) and document why if (a) turns out messy — either is acceptable, but don't duplicate the video-autoplay-gating logic itself, always go through `VideoPreview`.
- The seed data currently has 3 photo-cover projects (`clara-y-manuel`, `lucia-y-jorge`, `gala-empresa-fotomaton-360`) and 1 video-cover project (`boda-real-01`) — your implementation must handle both correctly, verify against at least one of each.

- [ ] **Step 2 (TDD):** extend `page.test.tsx` to assert the cover media actually renders (an `<img>`/`<video>` sourced from `project.cover.src`, findable via the existing test's project-mock pattern) for both an image-cover and a video-cover test case.

- [ ] **Step 3: Mixed gallery rhythm.** Apply the same mixed-sizing rhythm principle from Task 4 to `ProjectGallery.tsx`'s gallery grid — not every image the same size; let 1–2 images per project run larger/fullbleed-within-the-page-shell.

- [ ] **Step 4:** Verify `NextProjectLink.tsx`'s existing page-transition wiring (base incremental plan's Tasks 1/7) still works after your markup changes — don't regress the View Transitions behavior.

- [ ] **Step 5: Verify** `npm test && npm run build`; visually check `/trabajos/boda-real-01` (video cover) and at least one photo-cover project (e.g. `/trabajos/clara-y-manuel`) at desktop and mobile — confirm the new cover block genuinely reads as "the opening shot of the story," and that clicking a video cover still opens the same lightbox experience as before.

- [ ] **Step 6: Commit**

```bash
git add app/trabajos/[slug]/page.tsx app/trabajos/[slug]/page.module.css components/sections/ProjectGallery.tsx components/sections/ProjectGallery.module.css app/trabajos/[slug]/page.test.tsx
git commit -m "feat: add dominant cover hero block and editorial gallery rhythm to project detail pages"
```

---

### Task 6: Services — numbered editorial list, hover-driven imagery

Replace `ServiciosPreview.tsx`'s current unstyled bare `<ul>` (and give `/servicios`'s own list a lighter version of the same treatment) with a numbered (01/02/03/04) list where hovering a service reveals/changes an associated image — closer to an editorial table of contents than a card grid.

**Files:**
- Modify: `components/sections/ServiciosPreview.tsx`, `components/sections/ServiciosPreview.module.css` (new), `app/servicios/page.tsx`, `app/servicios/page.module.css` (already exists from the incremental plan's Task 5 — extend, don't replace)
- Test: `components/sections/ServiciosPreview.test.tsx` (new)

**Content note:** `content/services.ts` has no per-service image field today. Add one (`Service.previewImage?: string`) sourced from real project cover images already in `content/projects.ts` that match each service's category (`boda` → a real wedding cover photo, `video` → the real Eva y Rafa poster, etc.) — do not introduce new stock imagery; reuse what's already real and already in the seed data. `fotomaton`/`360` have no matching real project yet (Task 8 of the incremental plan, still parked) — leave `previewImage` undefined for those and design the hover-reveal to degrade gracefully (e.g. show nothing, or a neutral placeholder box) when it's absent, same honesty pattern as `Testimonial.photo?` from the incremental plan's Task 13.

- [ ] **Step 1:** Add `previewImage?: string` to `Service` in `content/types.ts`, set it on `boda`/`video` in `content/services.ts` using real existing asset paths (grep `content/projects.ts` for the actual cover `src` values to use verbatim — don't guess a path).
- [ ] **Step 2 (TDD):** write the failing test for `ServiciosPreview.tsx` asserting the numbered list renders all services with correct numbering and that hovering (or focusing, for keyboard users — this must work without a mouse) a service updates/reveals the associated image when present.
- [ ] **Step 3: Implement.** Number format: `01`, `02`, etc. (zero-padded, per the brief). Hover/focus-driven image swap: a single image area that cross-fades between services' `previewImage` on hover/focus (GSAP or CSS transition on `opacity`, reduced-motion-gated to an instant swap). Keyboard users must be able to trigger the same reveal via focus, not just mouse hover — test this explicitly.
- [ ] **Step 4:** Give `app/servicios/page.tsx`'s existing per-service sections (already styled by the incremental plan's Task 5) the same numbering treatment for visual consistency between the Home preview and the full page, without necessarily adding the hover-image mechanic there too (the full page already shows each service's full detail, so the mechanic's compression benefit doesn't apply there — your call whether it's worth adding, document the decision).
- [ ] **Step 5: Verify** `npm test && npm run build`; check keyboard-only navigation (Tab through the list, confirm image updates on focus); check mobile (hover doesn't exist — confirm the list is still fully usable and legible without it, e.g. images could just stack normally on narrow viewports rather than being hover-gated).
- [ ] **Step 6: Commit**

```bash
git add content/types.ts content/services.ts components/sections/ServiciosPreview.tsx components/sections/ServiciosPreview.module.css components/sections/ServiciosPreview.test.tsx app/servicios/page.tsx app/servicios/page.module.css
git commit -m "feat: numbered editorial services list with hover/focus-driven imagery"
```

---

### Task 7: About — editorial identity statement

Rework `SobreEmePreview.tsx` (currently the worst-offending broken layout — an unconstrained 800×1200 image occupying half the viewport with empty space beside it) and give it a real editorial layout: large image properly contained + a short, sharper identity statement, closer in spirit to `Manifiesto.tsx`'s existing strong copy ("No contamos bodas. Contamos historias con fecha.") than to generic "somos un equipo apasionado" copy.

**Files:**
- Modify: `components/sections/SobreEmePreview.tsx`, `components/sections/SobreEmePreview.module.css` (new)
- Test: `components/sections/SobreEmePreview.test.tsx` (new)

- [ ] **Step 1 (TDD):** write the failing test asserting the section renders the (new) heading copy and the image with correct alt text.
- [ ] **Step 2: Fix the image containment bug first.** Wrap the `<Image>` in a proper `.imageWrap` (matching the established `position: relative; aspect-ratio: X; overflow: hidden` + `fill` + `object-fit: cover` pattern already used in `SelectedWork.module.css`/`TrabajosFilter.module.css`) instead of the current raw `width={800} height={1200}` with no container — this alone fixes the "half-viewport image with empty space" bug.
- [ ] **Step 3: Layout.** Two-column on wider viewports (image one side, text the other — your call which side, consider echoing the Hero's asymmetric left-alignment for a repeated visual motif per the brief's "identidad propia" request), stacked on narrow viewports.
- [ ] **Step 4: Copy.** Write ONE new short statement line (not a wall of text) in the same register as `Manifiesto.tsx`'s existing copy. It must not introduce any new business fact — it's a tone/identity statement, not a claims section (the actual "who we are, confirmed founder, pending team" copy stays exactly as-is on `/sobre-nosotros` itself, already correctly honest per the base plan — this Home preview just needs a punchier teaser line, same content register as what's already there, just tighter).
- [ ] **Step 4b (optional refinement, found via reference-site research — apply if time/scope allows, skip without blocking the rest of this task if not):** reveal the new statement line via a subtle `filter: blur(6px) → blur(0)` + `opacity: 0 → 1` transition as it scrolls into view (a technique observed on `hollywoodexhibit2026.com`'s intro copy), layered on top of the existing `ScrollReveal` component's translate+fade rather than replacing it — extend `ScrollReveal` with an optional prop (e.g. `blur?: boolean`) rather than forking a new component, so the base `ScrollReveal` behavior used everywhere else in the site is untouched. `filter` is not literally `transform`/`opacity`, so gate it doubly carefully behind `useReducedMotion()` (already true of `ScrollReveal` itself) and confirm it doesn't trigger a layout-affecting repaint (a blurred `filter` is compositor-friendly in modern browsers, same performance class as `opacity`, but verify this doesn't regress Lighthouse Performance if you add it — Task 11 re-checks this).
- [ ] **Step 5: Verify** `npm test && npm run build`; visually confirm the image is properly contained (no more half-viewport-with-empty-space bug) at desktop and mobile.
- [ ] **Step 6: Commit**

```bash
git add components/sections/SobreEmePreview.tsx components/sections/SobreEmePreview.module.css components/sections/SobreEmePreview.test.tsx
git commit -m "feat: editorial About preview with fixed image containment and sharper identity copy"
```

---

### Task 8: CTA + typography/color system pass

Two related, smaller pieces: style `CtaContacto.tsx` (currently the third unstyled Home section) to match the new system, and add the small-label typographic tier the brief repeatedly asks for (metadata, tracking, numbers, small text as *contrast* against the oversized headings — not everything huge).

**Files:**
- Modify: `components/sections/CtaContacto.tsx`, `components/sections/CtaContacto.module.css` (new), `styles/tokens.css`
- Test: `components/sections/CtaContacto.test.tsx` (new)

- [ ] **Step 1:** Add a new token to `styles/tokens.css` for the small tracked-label treatment this plan's tasks reference (Task 1's Hero descriptor, Task 4's filter nav, Task 5/6's numbering) — e.g. `--type-label: clamp(0.7rem, 0.65rem + 0.1vw, 0.8rem);` plus document the accompanying `letter-spacing`/`text-transform` convention as a comment (this project's established pattern: real, minimal comments only where the value needs explaining, not decorative headers).
- [ ] **Step 2 (TDD):** write the failing test for `CtaContacto.tsx` asserting it renders with the expected heading/link.
- [ ] **Step 3: Style `CtaContacto.tsx`.** Reuse the container pattern already established (`max-width` + `margin-inline: auto` + `padding-block: var(--space-5) var(--space-3)`, matching `Manifiesto.module.css`'s centered-section pattern), oversized `--type-h2` heading, and a real button treatment for "Empezar un proyecto" — reuse `ContactForm.module.css`'s existing accent-background button pattern for visual consistency (same button language sitewide) rather than inventing a new button style.
- [ ] **Step 4: Verify** `npm test && npm run build`; visually confirm.
- [ ] **Step 5: Commit**

```bash
git add components/sections/CtaContacto.tsx components/sections/CtaContacto.module.css components/sections/CtaContacto.test.tsx styles/tokens.css
git commit -m "feat: style CTA section and add small-label type token for metadata contrast"
```

---

### Task 9: One curated advanced scroll moment — masked-photo wordmark reveal

**Correction (2026-09-01, ruling recorded in this plan's ledger before Task 9 was dispatched):** this task originally specced a pinned horizontal-scroll moment inside `SelectedWork`. Superseded by a stronger, more distinctive idea found via a real audit of 6 reference sites the client shared (see ledger for the full research) — `hollywoodexhibit2026.com` uses a technique where a huge wordmark's letterforms are filled with an actual photograph (`background-clip: text`) rather than solid color, as a signature visual moment. This reads as more "identidad propia" (the client's own explicit ask, section 24 of their brief) than a generic horizontal-scroll gallery, since it reuses and reinforces the EME wordmark already established as the site's dominant graphic element in the Hero (Task 1) — and it's pure CSS/GSAP, no new dependency, easier to make genuinely accessible (a solid-color fallback is trivial) than a pinned horizontal-scroll section. Per the client's own "10 excellent > 50 mediocre" instruction, this replaces rather than adds to the horizontal-scroll idea — still exactly one curated technique.

The moment: `Manifiesto.tsx`'s existing large heading ("No contamos bodas. Contamos historias con fecha.") gets a scroll-triggered crossfade from its current solid `--color-ink` text to a version with the SAME real photograph used as the Hero's poster (`public/videos/posters/real-boda-01-full.webp` — a real frame from the client's actual wedding footage, not stock) masked into its letterforms — reinforcing the same real asset as a recurring motif between the Hero and this moment, exactly the kind of repeated visual idea the client's brief asked for under "crea una identidad propia."

**Files:**
- Modify: `components/sections/Manifiesto.tsx`, `components/sections/Manifiesto.module.css`
- Test: `components/sections/Manifiesto.test.tsx` (existing — extend)

**Accessibility-first design (read before implementing):** the solid-`--color-ink` heading is the ALWAYS-PRESENT base layer — it never disappears, guaranteeing full-contrast readable text regardless of motion preference, image load failure, or browser support for `background-clip: text`. The masked-photo version is a second, absolutely-positioned copy of the identical heading text, layered exactly on top, that fades in via `opacity` (GSAP `ScrollTrigger`, `scrub: true`, animating `opacity` only — NOT `clip-path`, to stay within this project's transform/opacity-only animation constraint) as the section scrolls into view. With `prefers-reduced-motion: reduce`, the masked layer is simply never rendered (or rendered at a fixed `opacity: 0`) — the plain solid-ink heading is the entire experience, which is a complete, correct, accessible fallback, not a degraded one.

- [ ] **Step 1: Write the failing test**

Extend `Manifiesto.test.tsx`: assert the section renders TWO copies of the heading text (the base layer + the masked layer — use a query that can distinguish them, e.g. by a `data-testid` on the masked layer), and assert the masked layer's element has `aria-hidden="true"` (it's a pure visual duplicate of the same text — screen readers must only encounter the heading once, via the base layer, to avoid the text being announced twice).

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Manifiesto.test.tsx`
Expected: FAIL — the masked layer doesn't exist yet.

- [ ] **Step 3: Implement**

`Manifiesto.module.css` additions (illustrative — adjust exact values to what reads well against the real image, this is genuinely visual/design work):
```css
.headingWrap { position: relative; }
.headingBase { /* existing h2 styling stays exactly as-is */ }
.headingMasked {
  position: absolute;
  inset: 0;
  margin: 0; /* match .headingBase's own margin reset if any */
  background: url('/videos/posters/real-boda-01-full.webp') center / cover;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  opacity: 0; /* GSAP drives this to 1 on scroll; stays 0 (never rendered) under reduced motion */
  pointer-events: none;
}
```
In `Manifiesto.tsx`, wrap the heading in `.headingWrap`, keep the real `<h2>` as `.headingBase` (unchanged text, unchanged semantics — this is what screen readers and SEO see), and add a second `aria-hidden="true"` element (a `<span>` or duplicate non-semantic element, NOT a second `<h2>` — only one real heading per section) with the identical text and `.headingMasked` class. In a `useEffect` (client component — this file will need `'use client'` added, check whether that breaks anything about how `Manifiesto` is currently used, e.g. its existing `ScrollReveal` wrapper is already a client component, so this is a client-in-client nesting Next.js supports fine), set up a `gsap.to(maskedRef.current, { opacity: 1, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', end: 'top 20%', scrub: true } })`, gated behind `useReducedMotion()` exactly like `Hero.tsx`'s Task-21 parallax pattern (read that code again for the exact `gsap.context`/cleanup shape to reuse).

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Manifiesto.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 6: Verify.** Start the app, scroll to the Manifiesto section on `/`, confirm the heading crossfades from solid ink to the masked photo as it scrolls into view, and crossfades back out smoothly (or stays, your call on whether it reverses on scroll-up — `scrub: true` will do this naturally, which is probably the right default, just confirm it looks good both directions). Emulate `prefers-reduced-motion: reduce` and confirm the heading is the plain solid-ink version the whole time, fully readable, with no failed-image-load artifact or empty gap (since the masked layer never renders in this case). Check mobile width — confirm the mask still reads correctly on a narrower heading box (the photo might need `background-size`/`background-position` adjustment at a narrower `aspect-ratio` if the multi-line heading's box shape changes meaningfully at mobile widths).
- [ ] **Step 7: Commit**

```bash
git add components/sections/Manifiesto.tsx components/sections/Manifiesto.module.css components/sections/Manifiesto.test.tsx
git commit -m "feat: add masked-photo wordmark reveal to Manifiesto as the plan's one curated scroll moment"
```

---

### Task 10: Mobile-specific redesign pass

A dedicated pass reviewing every section touched by Tasks 1–9 specifically on mobile — not "does it not overflow," but "does this feel like it was designed for this size."

**Files:** whichever `.module.css` files from Tasks 1–9 need mobile-specific adjustment (this task's implementer determines the actual list by testing, not by guessing in advance — do not pre-declare files here).

- [ ] **Step 1:** Start the app, open it in a real mobile viewport emulation (or a real device if available) at common widths (360px, 390px, 428px). Go through every route.
- [ ] **Step 2:** For each issue found (cramped spacing, a hover-dependent interaction with no mobile equivalent, an effect that's heavy/janky on mobile, awkward text wrapping, any horizontal overflow), fix it directly in the relevant `.module.css`/component, documenting each fix in your report with a short before/after description.
- [ ] **Step 3: Verify** `npm test && npm run build` after all fixes; re-check the full mobile pass once more end-to-end.
- [ ] **Step 4: Commit**

```bash
git add -A  # this task touches many files across Tasks 1-9's output; explicit paths aren't knowable in advance
git commit -m "fix: mobile-specific pass across the reworked sections"
```

(Note: this is the one task in this plan allowed to use `git add -A`, since its file list is genuinely unknowable in advance — `.agents/`/`.claude/`/`skills-lock.json` are already gitignored, so this is safe.)

---

### Task 11: Performance, accessibility, and reduced-motion re-verification

**Files:** none modified unless this task's own checks surface a regression to fix (in which case, fix it in the relevant file and document what/why in the commit).

- [ ] **Step 1:** Run a real Lighthouse pass (same methodology as the base plan's Task 31 — real run, not estimated) against the built app (`npm run build && npm start`) for `/` and `/trabajos/boda-real-01` (the two pages most changed by this plan). Compare Performance/Accessibility/Best Practices/SEO against the incremental plan's retained baseline (~0.95/1.00/0.96/1.00).
- [ ] **Step 2:** Emulate `prefers-reduced-motion: reduce` in the browser and walk through every route touched by Tasks 1–9, confirming every new animation (Hero video/parallax, header hide/show, filter re-flow, services hover-reveal, pinned horizontal scroll) correctly falls back to its static/instant equivalent — not just that it doesn't crash, that it's still a complete, usable experience.
- [ ] **Step 3:** Run a keyboard-only pass (Tab through the whole site, no mouse) confirming every new interactive element from Tasks 1–9 (header nav, filter tabs, services hover-reveal, project cards, CTA button) is reachable and operable, with visible focus states.
- [ ] **Step 4:** If any regression is found, fix it directly, re-verify, and document the fix in this task's commit. If everything holds, this task's commit is just the report/verification evidence (screenshots or a written summary) — no code change required, and that's a valid, complete outcome for this task.
- [ ] **Step 5: Commit** (only if a fix was needed)

```bash
git add <fixed files>
git commit -m "fix: performance/accessibility regressions found in final art-direction verification pass"
```

---

## Self-Review Notes

- **Brief coverage, curated per the client's own "10 excellent > 50 mediocre" instruction:** Hero (§3, §4) → Task 1. Motion identity (§5) → curated across Tasks 1, 4, 9 rather than implementing every listed technique. Portfolio (§6, §7, §8) → Tasks 4, 5. Filters (§9) → Task 4. Typography (§10) → Task 8. Color (§11) → evaluated, largely already correct (the existing `--color-paper`/`--color-ink`/`--color-muted`/`--color-accent` tokens already match the brief's "off-white/black/warm-grey/small accent" request — no dedicated task, called out here so it's not silently dropped). Navigation (§12) → Task 2. Custom cursor (§13) → Task 3 (already existed from the base plan, extended here). About (§14) → Task 7. Services (§15) → Task 6. Video integration (§16) → Task 1 (Hero) + already-existing `VideoPreview`/`Lightbox` infrastructure elsewhere. Scroll experience (§17) → Task 9 (one curated technique, not the full list). Page transitions (§18) → already exists (incremental plan's Tasks 1/6/7, View Transitions API) — verified still working, not rebuilt. Project page (§19) → Task 5. Mobile (§20) → Task 10. Performance (§21) → Task 11 + ongoing discipline every task already carries. Reduced motion (§22) → every task individually + Task 11's dedicated pass. Anti-patterns (§23) → checked against as each task is reviewed (no cards-with-shadows, no gradients/glassmorphism, no generic corporate copy introduced anywhere in this plan). Identity (§24) → the Hero's real-footage-plus-asymmetric-wordmark treatment plus the numbered-editorial-list motif reused across Tasks 6/7 is this plan's answer to "un lenguaje propio que se repite."
- **Explicitly NOT built, with reasoning:** WebGL anything (§5, §17, §20's "WebGL si lo hubiera") — no WebGL exists or is added anywhere in this plan, per the incremental plan's own measured ruling. Horizontal galleries as a sitewide pattern, clip-path masking, image displacement, "velocity-based effects" as distinct additional techniques — curated out per Task 9's scoping rationale; one well-executed pinned horizontal moment stands in for this whole category rather than stacking several. A from-scratch page-transition rebuild (§18) — the existing View Transitions implementation already does this well and was reviewed clean multiple times in the incremental plan; re-verified, not rebuilt.
- **Type/interface consistency checked:** `Service.previewImage?: string` (Task 6) is additive/optional, so every existing `content/services.ts` entry without it and every existing test constructing a `Service` stays valid — same pattern as `Testimonial.photo?` and `Project.impactLine?` from the incremental plan. `Cursor.tsx`'s `LABELS` record (Task 3) gains two new keys, no existing key renamed. No task changes any exported component's prop signature.
- **No placeholders:** every task above has concrete files, concrete direction, and either complete code or an explicit, bounded scope for implementer judgment (documented as such, e.g. Task 6's fallback-when-no-image behavior, Task 2's reduced-motion hide/show choice) — never a bare "add appropriate styling" instruction.
