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

**Files:**
- Modify: `components/motion/Cursor.tsx` (add `abrir`/`explorar` labels), `components/sections/ServiciosPreview.tsx`, `app/trabajos/TrabajosFilter.tsx`, `app/trabajos/[slug]/page.tsx` (external/next-project links), `components/ui/NextProjectLink.tsx`
- Test: `components/motion/Cursor.test.tsx` (existing — extend for new labels), plus each touched component's existing test file (extend to assert the new `data-cursor` attribute is present)

**Interfaces:** `LABELS` in `Cursor.tsx` gains `abrir: 'ABRIR'` and `explorar: 'EXPLORAR'`. No signature changes.

- [ ] **Step 1–4 (TDD per consumer):** for each touched component, add the failing test asserting the relevant interactive element has the correct `data-cursor` value, verify it fails, add the attribute, verify it passes. Mapping: project cards in `TrabajosFilter.tsx` → `ver` (matches `SelectedWork.tsx`'s existing convention); video-opening triggers → `reproducir` (already the case via `VideoPreview.tsx`, confirm/extend to `ProjectGallery.tsx`'s gallery-item video triggers too); `NextProjectLink.tsx` → `explorar`; any external link (Instagram/Facebook in the Footer, `info@...` mailto is NOT external in this sense, skip it) → `abrir`.

- [ ] **Step 5: Verify** `npm test && npm run build`, manually hover each updated element on desktop (cursor only activates on `pointer: fine` devices per the existing `Cursor.tsx` check — nothing to change there) and confirm the correct label appears.

- [ ] **Step 6: Commit**

```bash
git add components/motion/Cursor.tsx components/motion/Cursor.test.tsx components/sections/ServiciosPreview.tsx app/trabajos/TrabajosFilter.tsx app/trabajos/[slug]/page.tsx components/ui/NextProjectLink.tsx <their test files>
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

Replace `TrabajosFilter.tsx`'s current bordered-box category buttons with a typographic treatment: tracked-uppercase labels in a horizontal row, separated by a thin divider or generous spacing (not boxes), with the active state shown via the underline treatment already established elsewhere (`Header.tsx`'s `aria-current` underline) rather than a colored border — for visual consistency between the two typographic nav treatments now in the site (Header's nav, this one).

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

**Files:**
- Modify: `app/trabajos/[slug]/page.tsx`, `app/trabajos/[slug]/page.module.css`, `components/sections/ProjectGallery.tsx`, `components/sections/ProjectGallery.module.css`

- [ ] **Step 1:** Apply the same mixed-sizing rhythm principle from Task 4 to `ProjectGallery.tsx`'s gallery grid — not every image the same size; let 1–2 images per project run larger/fullbleed-within-the-page-shell.
- [ ] **Step 2:** Increase the hero media's (the project's cover image/video, shown at the top of the detail page) dominance — it should feel like the opening shot of the story, not a smaller version of a gallery thumbnail. Check the current `page.tsx` for how the cover is currently sized and increase its viewport share.
- [ ] **Step 3:** Verify `NextProjectLink.tsx`'s existing page-transition wiring (Task 1/7 of the incremental plan) still works after your markup changes — don't regress the View Transitions behavior.
- [ ] **Step 4: Verify** `npm test && npm run build`; visually check `/trabajos/boda-real-01` and at least one photo-only project (e.g. `/trabajos/clara-y-manuel`) at desktop and mobile.
- [ ] **Step 5: Commit**

```bash
git add app/trabajos/[slug]/page.tsx app/trabajos/[slug]/page.module.css components/sections/ProjectGallery.tsx components/sections/ProjectGallery.module.css
git commit -m "feat: editorial gallery rhythm and larger hero media on project detail pages"
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

### Task 9: One curated advanced scroll moment

Per the brief's own "10 excellent > 50 mediocre" instruction, this plan implements exactly ONE additional advanced scroll technique beyond what's already shipped (Hero parallax, ScrollReveal, staggered/mixed grid, filter re-flow animation) — not the brief's entire list (pinned sections, horizontal galleries, clip-path reveals, image displacement, masking, velocity effects). Pick the single highest-impact one: a **pinned horizontal-scroll moment inside the Home's `SelectedWork` section**, where 3–4 featured project images scroll horizontally while the page scrolls vertically past that section (a well-established, tasteful technique — GSAP's `ScrollTrigger` with `pin: true` and a horizontal `xPercent` tween is the standard implementation, no new dependency needed).

**Files:**
- Modify: `components/sections/SelectedWork.tsx`, `components/sections/SelectedWork.module.css`

- [ ] **Step 1:** Read GSAP ScrollTrigger's pinning documentation pattern (`node_modules/gsap/...` or its known API — `pin: true`, `scrub: true`) and this project's existing `Hero.tsx` Task-21 ScrollTrigger usage for the established mock/test pattern (`vi.mock('gsap', ...)`, `vi.mock('gsap/ScrollTrigger', ...)`).
- [ ] **Step 2:** Implement the pin+horizontal-scroll effect for the featured-work grid specifically (not the whole page), scoped behind `useReducedMotion()` — with reduced motion, the section must render as a normal (non-pinned, vertically-stacked or simple grid) fallback, fully navigable and complete, not a broken half-implemented pinned state.
- [ ] **Step 3 (TDD):** extend `SelectedWork.test.tsx` to assert the `gsap.to`/`ScrollTrigger` setup is called with `pin: true` when motion is not reduced, and is NOT set up when it is reduced (mirroring Task 21's exact test pattern).
- [ ] **Step 4: Verify.** `npm test && npm run build`. This is the task most likely to affect Lighthouse Performance — re-run Lighthouse locally (or note in your report that you couldn't and why) and confirm no material regression from the incremental plan's retained ~0.95 score. Manually verify: the pin/horizontal-scroll feels smooth (not janky) on both a fast scroll and a slow scroll; reduced-motion fallback is fully functional; mobile either gets a lighter version or the same reduced-motion-style fallback (pinned horizontal scroll is a poor mobile UX regardless of motion preference — your call, document it, but do not ship a broken/awkward mobile experience for this).
- [ ] **Step 5: Commit**

```bash
git add components/sections/SelectedWork.tsx components/sections/SelectedWork.module.css components/sections/SelectedWork.test.tsx
git commit -m "feat: add one curated pinned horizontal-scroll moment to featured work"
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
