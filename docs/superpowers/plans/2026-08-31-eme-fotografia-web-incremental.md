# EME Fotografía Sevilla — Incremental Follow-On Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gaps the final whole-branch review found and the client explicitly asked for, on top of the completed 31-task base build — without touching what's already shipped and approved.

**Architecture:** No new dependencies, no new architecture. Every task extends an existing, already-reviewed pattern (CSS Modules + tokens, `ScrollReveal`/`VideoPreview`/`Lightbox` motion primitives, the typed `content/*.ts` layer, the Next 16 Server/Client Component split already established for pages needing `generateMetadata`).

**Tech Stack:** Unchanged from the base plan — Next.js 16.3.3 (App Router), TypeScript, CSS Modules + custom-property tokens, Vitest + Testing Library, GSAP + Lenis. **No Tailwind, no Framer Motion, no CMS** — see "Evaluated and Declined" below for why.

**Spec:** This plan has no separate written spec document — its scope was set directly by the client across two conversations (2026-08-31): an initial wishlist ("Vamos a construir desde cero…", later walked back to "no descartes nada de lo revisado — cuando cierres el plan actual… te propongo el nuevo plan"), and the final whole-branch review's findings (`git log`-visible in commits `deae9d9..b033ff6`, ledger deleted post-merge per the base plan's own convention — the review's findings are restated as tasks below instead of by reference). Where a design decision was needed that no prior document settled (container widths, an FAQ's placement, whether a top-level "how we work" section is worth building), this plan makes the call and flags it for the client's OK during plan review, not silently.

**Context carried over from the base build (do not re-derive, just know this):**
- Design tokens live in `styles/tokens.css`: colors `--color-ink #1F262E`, `--color-accent #992927`, `--color-paper #F7F5F2`, `--color-muted #6B7178`; spacing `--space-1` (0.5–0.75rem) through `--space-5` (6–10rem), all fluid `clamp()`; type scale `--type-body`, `--type-h3` (1.5–2.25rem), `--type-h2` (2.25–4rem), `--type-h1` (3–7.5rem, reserved for the true full-bleed Hero — interior pages use `--type-h2`/`--type-h3`); `--duration-fast/base/slow`, `--ease-standard`.
- `Header` is `position: fixed`, `z-index: 50`, height ≈ `space-2 * 2 + 2.5rem` (see `styles/globals.css`'s `main { padding-top: … }` rule, which every non-Hero page already relies on for clearance — do not touch that rule in this plan).
- `useReducedMotion()` (`lib/hooks/useReducedMotion.ts`) is `useSyncExternalStore`-based, returns a live boolean, safe to call anywhere.
- `ScrollReveal` (`components/motion/ScrollReveal.tsx`) takes `{ children, className? }`, fades+slides in on scroll, no-ops under reduced motion.
- The `SelectedWork` card pattern (image cover, reusable as-is): a `Link` wrapping a `div.imageWrap { position: relative; aspect-ratio: 3/2 }` containing `<Image fill sizes="…" />`, with `.imageWrap img { object-fit: cover }` in the CSS Module. This is the established, review-verified way to show a project cover without stretching regardless of the source asset's real aspect ratio — reuse it verbatim in Task 6 below, do not invent a new pattern.
- `content/types.ts` defines `Project`, `ProjectMedia`, `ProjectCategory` (`= ServiceSlug`, i.e. `'boda' | 'video' | 'fotomaton' | '360'`), `Service`, `Testimonial`, `SiteInfo` — extend these, never redefine them elsewhere.
- Real production domain: `https://www.emefotografiasevilla.es` (used verbatim in `lib/seo.ts`, `lib/schema.ts`, `app/sitemap.ts`, `app/robots.ts`).

## Sequencing note — real assets are landing imminently

The client is providing real photos, video, and the company logo shortly after this plan is approved. Two consequences for how this plan should run:

1. **The image-handling code is already asset-agnostic.** The base build's final-review fix wave moved `SelectedWork`/`ProjectGallery` to `fill` + `aspect-ratio` + `object-fit: cover` specifically so covers render correctly regardless of the source photo's exact proportions (verified against the current placeholder set's actual mixed ratios — 3:2, 2:3, and one 3:4). Real photos, whatever their exact dimensions, will render through the same code path without further change. **Nothing in this plan needs to wait for the real assets.**
2. **What DOES need a human pass once real assets land, outside this plan's scope:** re-checking `object-fit: cover`'s crop framing on each real photo (cover-fit can crop content a fixed-ratio box wouldn't), replacing `alt` text (currently accurate for the placeholder Unsplash/Pexels content, will need rewriting for the real photos), and swapping the logo into `Header`/`Footer`/favicon (no task currently renders a logo image at all — Header/Footer currently render the brand name as text; if the client wants an actual logotype in the header, that's a small follow-up task once the logo file exists, not written here since there's nothing to spec against yet).

Tasks in this plan proceed now; the asset swap follows the process already documented in `README.md`.

## Global Constraints

- Every animation still respects `prefers-reduced-motion` — no exceptions. Reuse `useReducedMotion()`; do not add a second motion-detection mechanism.
- Animate only `transform`/`opacity` for anything scroll- or hover-driven.
- No Tailwind. No new CSS methodology — CSS Modules + the existing custom-property tokens only.
- All routes and UI copy in Spanish.
- Real business facts (opening hours, delivery times, cancellation policy, travel fees) must never be invented. Where this plan needs one and no prior source states it, the field is written as a clearly marked placeholder (mirroring the base build's `isPlaceholder`/`(pendiente de confirmación)` pattern) — never presented as fact.
- No `any` in new code. No new external service/runtime dependency (this includes declining a CMS — see below).

## Evaluated and Declined (per the client's request to critically evaluate, not just build the whole wishlist)

- **Framer Motion:** Not needed. Every remaining animation task below (View Transitions wiring, a scroll-triggered count-up, a focus-trapped lightbox) is either a native browser API or a small addition to the existing GSAP/`ScrollReveal` primitives. Adding a second animation library alongside GSAP+Lenis would be pure duplication with no capability gained — declined.
- **i18n (next-intl, ES/EN):** Explicitly deferred, per the client's own instruction ("solo cuando el copy esté cerrado, no antes"). Copy is not closed: `/sobre-nosotros` still has a placeholder team section, testimonials are all placeholders, and this plan is about to add real Spanish copy (FAQ, Manifiesto) that would need translating too. Not a task in this plan — revisit once all copy, including this plan's new copy, is client-approved and final.
- **CMS (Sanity):** Declined. This is a single studio with 4 seed projects and infrequent updates (the client edits `content/projects.ts` etc. directly, or hands a diff to whoever maintains the repo). Sanity would add: a new external service dependency, a schema to design and keep in sync with `content/types.ts`, hosting/auth to manage, and a webhook or ISR strategy to keep the static site in sync — real ongoing cost for a client who does not need to self-serve content on a daily/weekly cadence. If the client's actual pain point turns out to be "I want to edit text myself without asking a developer," a lighter alternative (e.g. a git-based CMS front-end over the same `content/*.ts` files, or simply the client sending updated copy for a developer to paste in, which is the current and perfectly adequate flow) solves that without the operational overhead. Recommend against — flag for the client's explicit override if they disagree after reading this.
- **A dedicated top-level "how we work" process section:** Declined as a separate section. `/servicios` (Task 24 of the base plan) already renders each service's own `process: {step,title,description}[]` as an ordered list — a second, service-agnostic "our process" block would either duplicate that content or float disconnected from the service it actually varies by (a wedding's process differs from a 360° gala booth's). If the client specifically wants a single unified "3 steps to book us" teaser for the Home page (distinct from Manifiesto, see Task 15), say so and it's a small follow-up — not written here since nothing currently calls for one beyond the general wishlist item.
- **Video re-cut (base review finding I7):** Declined as obsolete. The 11.5MB/28s placeholder preview clip is exactly the kind of content the imminent real-video handoff replaces; re-encoding a file that's about to be deleted is wasted effort.
- **The 3 remaining `react-hooks/set-state-in-effect` occurrences** (`Cursor.tsx`, `Confianza.tsx`, `Hero.tsx`'s defensive branch): Declined. These are lint-only (confirmed: `next build` does not gate on ESLint here, zero runtime impact), the root cause (`useReducedMotion`'s old `useState`+`useEffect` pattern) was already fixed in the base build's final fix wave, and `Hero.tsx`'s occurrence is a deliberate, necessary defensive branch the original reviewer explicitly said not to remove. Spending a task suppressing three warnings with zero user-visible effect is exactly the kind of busywork the client asked this plan to screen out.

---

### Task 1: Wire up View Transitions between `/trabajos` and `/trabajos/[slug]`

`components/motion/PageTransition.tsx` (`withPageTransition`) and its View Transitions CSS in `styles/globals.css` were built and unit-tested in the base plan but never called from anywhere — confirmed dead code by the final review. This task wires it into the one place the client's original spec asked for it: navigating from the work index into a project's detail page (shared-image continuity between the grid card and the detail hero).

**Files:**
- Modify: `app/trabajos/TrabajosFilter.tsx`
- Modify: `components/sections/ProjectGallery.tsx` (the "siguiente proyecto" link on the detail page, for the same continuity on prev/next navigation)
- Test: `app/trabajos/TrabajosFilter.test.tsx` (existing file — extend), `components/sections/ProjectGallery.test.tsx` (existing file — extend)

**Interfaces:**
- Consumes: `withPageTransition(navigate: () => void)` from `components/motion/PageTransition.tsx` (unchanged, already built).
- Produces: nothing new — this task only wires an existing export into existing components.

- [ ] **Step 1: Write the failing test for `TrabajosFilter`**

Add to `app/trabajos/TrabajosFilter.test.tsx` (keep existing tests as-is, add this one):

```tsx
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));

describe('TrabajosFilter — page transition', () => {
  it('navigates via the router (not a bare <a> reload) when a project link is clicked, wrapped in a view transition', async () => {
    const push = vi.fn();
    (useRouter as any).mockReturnValue({ push });
    const startViewTransition = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    (document as any).startViewTransition = startViewTransition;

    const user = userEvent.setup();
    render(<TrabajosFilter projects={projects} />);
    await user.click(screen.getByRole('link', { name: /ver proyecto clara y manuel/i }));

    expect(startViewTransition).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/trabajos/clara-y-manuel');

    delete (document as any).startViewTransition;
  });
});
```

(`userEvent` and `projects` are already imported at the top of the existing test file from the base plan — reuse them, don't re-import.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/trabajos/TrabajosFilter.test.tsx`
Expected: FAIL — the current `<Link>` doesn't call `useRouter`/`withPageTransition` at all.

- [ ] **Step 3: Implement the wiring in `TrabajosFilter.tsx`**

Replace the plain `<Link>` in the project list with a click handler that calls `withPageTransition`, keeping `<Link>` as the element (for correct `href`, prefetch, and no-JS fallback) but intercepting the click:

```tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '@/content/types';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';
import { withPageTransition } from '@/components/motion/PageTransition';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: 'Bodas' },
  { value: 'video', label: 'Vídeo' },
  { value: 'fotomaton', label: 'Fotomatón' },
  { value: '360', label: '360°' },
];

export function TrabajosFilter({ projects }: { projects: Project[] }) {
  const { category, setCategory, filtered } = useProjectFilter(projects);
  const router = useRouter();

  function handleProjectClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let modified/middle clicks behave normally
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  return (
    <div>
      <h1>Trabajos</h1>
      <div role="tablist" aria-label="Filtrar trabajos por categoría">
        {CATEGORIES.map((c) => (
          <button key={c.value} role="tab" aria-selected={category === c.value} onClick={() => setCategory(c.value)}>
            {c.label}
          </button>
        ))}
      </div>
      <ul>
        {filtered.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/trabajos/${project.slug}`}
              aria-label={`Ver proyecto ${project.title}`}
              onClick={(e) => handleProjectClick(e, `/trabajos/${project.slug}`)}
            >
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run it to verify it passes, then confirm the existing tests still pass**

Run: `npm test -- app/trabajos/TrabajosFilter.test.tsx`
Expected: PASS, all tests in the file (new + pre-existing).

- [ ] **Step 5: Same wiring for the "siguiente proyecto" link — write the failing test**

Add to `components/sections/ProjectGallery.test.tsx`. Note: the "siguiente proyecto" link actually lives in `app/trabajos/[slug]/page.tsx`, not `ProjectGallery.tsx` — check the current file (it was written in the base plan's Task 23) and confirm where the `Link href={`/trabajos/${next.slug}`}` really is before writing this step. If it's in `page.tsx` (a Server Component per the base plan's design), it cannot itself hold an `onClick` handler or call `useRouter` — you'll need to extract just that link into a tiny new client component (e.g. `components/ui/NextProjectLink.tsx`) that takes `{ href: string; label: string }` and applies the same `withPageTransition` pattern as Step 3, then have `page.tsx` render `<NextProjectLink href={...} label={...} />` instead of the raw `<Link>`. Write the failing test against whichever component actually ends up owning the click handler.

```tsx
// If extracted to components/ui/NextProjectLink.tsx — add components/ui/NextProjectLink.test.tsx:
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { NextProjectLink } from './NextProjectLink';

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));

describe('NextProjectLink', () => {
  it('navigates via the router wrapped in a view transition on click', async () => {
    const push = vi.fn();
    (useRouter as any).mockReturnValue({ push });
    const startViewTransition = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    (document as any).startViewTransition = startViewTransition;

    const user = userEvent.setup();
    render(<NextProjectLink href="/trabajos/lucia-y-jorge" label="Siguiente proyecto: Lucía y Jorge" />);
    await user.click(screen.getByRole('link', { name: /siguiente proyecto/i }));

    expect(startViewTransition).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/trabajos/lucia-y-jorge');
    delete (document as any).startViewTransition;
  });
});
```

- [ ] **Step 6: Run it to verify it fails, then implement**

```tsx
// components/ui/NextProjectLink.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withPageTransition } from '@/components/motion/PageTransition';

export function NextProjectLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        withPageTransition(() => router.push(href));
      }}
    >
      {label}
    </Link>
  );
}
```

Update `app/trabajos/[slug]/page.tsx` to import and render `<NextProjectLink href={`/trabajos/${next.slug}`} label={`Siguiente proyecto: ${next.title}`} />` in place of the raw `<Link>`. This does not change `page.tsx`'s Server Component status (it's a leaf child now, same pattern already used for `ProjectGallery`).

- [ ] **Step 7: Run it to verify it passes**

Run: `npm test -- components/ui/NextProjectLink.test.tsx app/trabajos/[slug]/page.test.tsx`
Expected: PASS. Also run `npm test` (full suite) to confirm zero regressions on `app/trabajos/[slug]/page.test.tsx`'s existing "renders prev/next navigation" assertion (it asserts the link's accessible name, which is unchanged).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire up View Transitions between /trabajos and project detail pages"
```

---

### Task 2: Trigger Confianza's count-up on scroll into view, not on mount

Currently `Confianza` starts its 1.5s count-up the instant the component mounts, regardless of whether it's actually visible — most visitors scroll past it before it finishes, or never trigger it at all if they arrive mid-page via an anchor link. Gate it behind visibility, matching how every other reveal on the site behaves.

**Files:**
- Modify: `components/sections/Confianza.tsx`
- Test: `components/sections/Confianza.test.tsx` (existing file — extend)

**Interfaces:**
- Consumes: `useReducedMotion()` (unchanged usage — still skips the animation and shows final values immediately).
- Produces: no change to `Confianza`'s external usage (`<Confianza />`, no props) — Home's mounting in `app/page.tsx` is untouched.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to components/sections/Confianza.test.tsx — keep existing tests, add this one.
// This requires a real IntersectionObserver mock; follow the same pattern already
// used in components/motion/VideoPreview.test.tsx's beforeEach.
describe('Confianza — scroll-triggered', () => {
  let intersectCallback: IntersectionObserverCallback | undefined;

  beforeEach(() => {
    intersectCallback = undefined;
    (window as any).IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
      intersectCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });
  });

  it('does not start counting until it scrolls into view', () => {
    vi.useFakeTimers();
    render(<Confianza />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.queryByText('2320')).not.toBeInTheDocument();

    act(() => { intersectCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('2320')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Confianza.test.tsx`
Expected: FAIL — the current implementation counts up immediately on mount, so `2320` is already present before any intersection fires.

- [ ] **Step 3: Implement the visibility gate**

Read the current `components/sections/Confianza.tsx` first (it was modified once already in the base plan's Task 20 fix round for reduced-motion) — apply this change on top of that, don't regress the existing reduced-motion branch. Gate `useCountUp`'s interval behind a `visible` flag set by an `IntersectionObserver` on the section itself:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Confianza.module.css';

function useCountUp(target: number, active: boolean, reducedMotion: boolean, durationMs = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    if (!active) return;
    const steps = 30;
    const stepMs = durationMs / steps;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setValue(Math.round((current / steps) * target));
      if (current >= steps) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, active, reducedMotion, durationMs]);
  return value;
}

export function Confianza() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.4 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reducedMotion, visible]);

  const fb = useCountUp(site.facebookLikes, visible, reducedMotion);
  const ig = useCountUp(site.instagramFollowers, visible, reducedMotion);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Confianza de la comunidad">
      <div>
        <span className={styles.number}>{fb}</span>
        <span>me gusta en Facebook</span>
      </div>
      <div>
        <span className={styles.number}>{ig}</span>
        <span>seguidores en Instagram</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Confianza.test.tsx`
Expected: PASS, including the existing reduced-motion test from the base plan (which mocks `useReducedMotion` to return `true` and expects immediate final values — verify this still holds, since the `reducedMotion` branch in `useCountUp` is unconditional and runs regardless of `visible`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: trigger Confianza's count-up on scroll into view instead of on mount"
```

---

### Task 3: Real Tab-cycle focus trap in Lightbox

`Lightbox` (base plan Task 16, later fixed to move focus in on open and restore it on close) explicitly did not implement a full focus trap — Tab from the last focusable element inside currently escapes to the browser chrome/rest of the page instead of cycling back to the first. The client's accessibility priority list specifically asks for this.

**Files:**
- Modify: `components/motion/Lightbox.tsx`
- Test: `components/motion/Lightbox.test.tsx` (existing file — extend)

**Interfaces:**
- Consumes: nothing new.
- Produces: no change to `<Lightbox isOpen onClose>{children}</Lightbox>`'s public interface — every existing consumer (`SelectedWork`, `ProjectGallery`) is unaffected.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to components/motion/Lightbox.test.tsx
it('traps Tab focus within the modal content, cycling from the last focusable element back to the first', async () => {
  const user = userEvent.setup();
  render(
    <Lightbox isOpen onClose={() => {}}>
      <button>Primero</button>
      <button>Segundo</button>
      <button>Último</button>
    </Lightbox>
  );
  screen.getByText('Último').focus();
  await user.tab();
  expect(screen.getByText('Primero')).toHaveFocus();
});

it('traps Shift+Tab, cycling from the first focusable element back to the last', async () => {
  const user = userEvent.setup();
  render(
    <Lightbox isOpen onClose={() => {}}>
      <button>Primero</button>
      <button>Segundo</button>
      <button>Último</button>
    </Lightbox>
  );
  screen.getByText('Primero').focus();
  await user.tab({ shift: true });
  expect(screen.getByText('Último')).toHaveFocus();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/Lightbox.test.tsx`
Expected: FAIL — Tab/Shift+Tab currently moves focus out of the modal entirely (or does nothing special) rather than cycling.

- [ ] **Step 3: Implement the trap**

Read the current `components/motion/Lightbox.tsx` first (it already has `contentRef`, `previouslyFocused`, and a `keydown` listener for Escape from the earlier fix round) — extend the same `keydown` handler to also handle `Tab`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import styles from './Lightbox.module.css';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    contentRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !contentRef.current) return;
      const focusable = getFocusable(contentRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} data-testid="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={contentRef} className={styles.content} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/Lightbox.test.tsx`
Expected: PASS, all tests (new trap tests + the pre-existing open/close/Escape/backdrop/focus-move/focus-restore tests from the base plan).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add a real Tab-cycle focus trap to Lightbox"
```

---

### Task 4: Active-route indication in Header nav

`Header`'s nav links currently have no `aria-current` and no visual "you are here" state — every link looks identical regardless of the current route.

**Files:**
- Modify: `components/layout/Header.tsx`, `components/layout/Header.module.css`
- Test: `components/layout/Header.test.tsx` (existing file — extend)

**Interfaces:**
- Consumes: `usePathname()` from `next/navigation` (new import, standard Next.js hook, no new dependency).
- Produces: no change to `<Header />`'s external usage.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to components/layout/Header.test.tsx
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

describe('Header — active route', () => {
  it('marks the current route with aria-current', () => {
    (usePathname as any).mockReturnValue('/servicios');
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Trabajos' })).not.toHaveAttribute('aria-current');
  });
});
```

Check the existing `Header.test.tsx` first — if it doesn't already mock `next/navigation`, this `vi.mock` needs to be added at the top of the file (module-level), which affects every test in the file, not just the new one — verify none of the pre-existing tests break from `usePathname` now being a mock returning `undefined` by default (if they do, add a `beforeEach` default: `(usePathname as any).mockReturnValue('/')`).

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/layout/Header.test.tsx`
Expected: FAIL — no `aria-current` attribute exists yet.

- [ ] **Step 3: Implement**

Read the current `Header.tsx` first to see exactly how nav links are rendered (from a `content/site.ts` or hardcoded array — the base plan built this in Task 10). Add `usePathname()` and set `aria-current="page"` when the link's `href` matches:

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ...existing imports (site, styles, MobileMenu, etc.) — keep them as-is

export function Header() {
  const pathname = usePathname();
  // ...existing state/logic (menu open, etc.) — keep as-is
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>{site.brandName}</Link>
      {/* ...existing mobile menu button, unchanged... */}
      <nav className={styles.desktopNav}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

(Adapt to the actual existing variable names for the nav-links array and any other structure already in the file — the only real change is adding `usePathname` and the `aria-current` prop, do not restructure anything else.)

Add the visual state to `Header.module.css`:

```css
.desktopNav a[aria-current="page"] {
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-underline-offset: 0.3em;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/layout/Header.test.tsx`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: indicate the active route in Header nav"
```

---

### Task 5: Styling pass — Servicios, Sobre nosotros, Contacto

These three pages currently render with zero component-level CSS: no container width, no horizontal padding, no vertical rhythm between sections, headings at browser-default size in the wrong font. This task gives all three the same page-shell treatment, consistent with the tokens already established by the Home page's sections.

**Design decision this task locks in** (flagging for the client's OK, since no prior document specified exact numbers): a `44rem`-ish reading measure for body copy (comfortable line length), a `75rem` outer container for anything wider (the services list, the multi-field form), horizontal padding `var(--space-3)`, and `var(--space-4)`–`var(--space-5)` vertical rhythm between major blocks — matching the spacing scale already used by `SelectedWork`/`ServiciosPreview`/etc. on Home. Interior-page `h1` uses `--type-h2` (not `--type-h1`, which stays reserved for the true full-bleed Hero) and `--font-serif`; `h2` uses `--type-h3`.

**Files:**
- Create: `app/servicios/page.module.css`, `app/sobre-nosotros/page.module.css`, `app/contacto/page.module.css`
- Modify: `app/servicios/page.tsx`, `app/sobre-nosotros/page.tsx`, `app/contacto/page.tsx` (add `className` props referencing the new modules — no structural/content changes)
- Test: none new — these are pure-CSS changes to already-tested pages; the existing `page.test.tsx` files for all three assert on content/structure that isn't changing, so they continue to pass unmodified. Verification is via the build + a visual check, not a new unit test (CSS Modules assign hashed class names Vitest/jsdom don't meaningfully assert on).

**Interfaces:** none — no new exports, no prop changes to any component.

- [ ] **Step 1: Create `app/servicios/page.module.css`**

```css
.page {
  max-width: 75rem;
  margin-inline: auto;
  padding-inline: var(--space-3);
  padding-block: var(--space-4) var(--space-5);
}
.page h1 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 1;
  margin-block-end: var(--space-4);
}
.service {
  max-width: 44rem;
  padding-block: var(--space-4);
  border-top: 1px solid var(--color-muted);
}
.service:first-of-type { border-top: none; padding-top: 0; }
.service h2 {
  font-family: var(--font-serif);
  font-size: var(--type-h3);
  margin-block-end: var(--space-1);
}
.service p { color: var(--color-muted); margin-block-end: var(--space-2); }
.service ul { margin-block: var(--space-2); padding-left: var(--space-2); }
.service ol { margin-block: var(--space-2); padding-left: var(--space-2); }
.service a {
  display: inline-block;
  margin-block-start: var(--space-2);
  color: var(--color-accent);
  font-weight: 600;
}
```

- [ ] **Step 2: Wire it into `app/servicios/page.tsx`**

Read the current file (built in base plan Task 24). Add the `styles` import and apply `className={styles.page}` to the outer `<div>`, `className={styles.service}` to each per-service `<section>`, and no other structural change:

```tsx
import Link from 'next/link';
import { services } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = buildMetadata({ /* ...unchanged from base build... */ });

export default function Page() {
  return (
    <div className={styles.page}>
      <h1>Servicios</h1>
      {services.map((service) => (
        <section key={service.slug} id={service.slug} className={styles.service} aria-labelledby={`${service.slug}-heading`}>
          <h2 id={`${service.slug}-heading`}>{service.name}</h2>
          <p>{service.tagline}</p>
          <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{service.idealFor}</p>
          <ol>
            {service.process.map((step) => (
              <li key={step.step}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/contacto">{service.ctaLabel}</Link>
        </section>
      ))}
    </div>
  );
}
```

(Keep the real `metadata` export exactly as it already is in the file — only the JSX gains `className`s.)

- [ ] **Step 3: Run the existing test and build to confirm no regression**

Run: `npm test -- app/servicios/page.test.tsx && npm run build`
Expected: PASS / succeeds — the existing test asserts on headings/text/links, none of which changed.

- [ ] **Step 4: Repeat the same pattern for `app/sobre-nosotros/page.module.css` + `page.tsx`**

```css
/* app/sobre-nosotros/page.module.css */
.page {
  max-width: 44rem;
  margin-inline: auto;
  padding-inline: var(--space-3);
  padding-block: var(--space-4) var(--space-5);
}
.page h1 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 1;
  margin-block-end: var(--space-3);
}
.page section { margin-block-start: var(--space-4); }
.page h2 {
  font-family: var(--font-serif);
  font-size: var(--type-h3);
  margin-block-end: var(--space-1);
}
.page p { margin-block-end: var(--space-1); }
.teamImage { border-radius: 2px; margin-block: var(--space-2); height: auto; }
```

Read the current `app/sobre-nosotros/page.tsx` (built in base plan Task 25) and apply `className={styles.page}` to the outer `<article>`, `className={styles.teamImage}` to the team `<Image>`, no other structural change.

- [ ] **Step 5: Run the existing test and build**

Run: `npm test -- app/sobre-nosotros/page.test.tsx && npm run build`
Expected: PASS / succeeds.

- [ ] **Step 6: Repeat for `app/contacto/page.module.css` + `page.tsx`, plus style `ContactForm.module.css`**

```css
/* app/contacto/page.module.css */
.page {
  max-width: 44rem;
  margin-inline: auto;
  padding-inline: var(--space-3);
  padding-block: var(--space-4) var(--space-5);
}
.page h1 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 1;
  margin-block-end: var(--space-2);
}
.page > p { margin-block-end: var(--space-1); color: var(--color-muted); }
.page > p:last-of-type { margin-block-end: var(--space-4); }
.page a { color: var(--color-accent); }
```

Read the current `app/contacto/page.tsx` (base plan Task 26) and apply `className={styles.page}` to the outer `<div>`.

`components/ui/ContactForm.module.css` already has minimal styling from the base plan (`.form`, inputs, button) — leave it as-is, it doesn't need this pass; only the page wrapper around it does.

- [ ] **Step 7: Run the existing test and build**

Run: `npm test -- app/contacto/page.test.tsx && npm run build`
Expected: succeeds (there is no dedicated `page.test.tsx` for `/contacto` per the base plan's Task 26 brief — if none exists, just run the full suite + build).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "style: add page-shell CSS to Servicios, Sobre nosotros, and Contacto"
```

---

### Task 6: Styling pass — `/trabajos` listing (with real cover images)

Beyond the missing container/spacing (same shell pattern as Task 5), `/trabajos`'s project list currently renders as bare text links — no cover images at all, unlike the visually equivalent grid on Home's `SelectedWork`. This task brings it to parity, reusing `SelectedWork`'s established image-card pattern verbatim (see Global Constraints above — do not invent a second pattern).

**Files:**
- Create: `app/trabajos/TrabajosFilter.module.css`
- Modify: `app/trabajos/TrabajosFilter.tsx`
- Test: `app/trabajos/TrabajosFilter.test.tsx` (existing file — extend)

**Interfaces:**
- Consumes: `project.cover: ProjectMedia` (already available on every `Project` in the `projects` prop — no content-layer change needed).
- Produces: no change to `<TrabajosFilter projects={projects} />`'s external usage.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to app/trabajos/TrabajosFilter.test.tsx
it('renders a cover image for each image-cover project', () => {
  render(<TrabajosFilter projects={projects} />);
  const imageCoverCount = projects.filter((p) => p.cover.type === 'image').length;
  expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(imageCoverCount);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/trabajos/TrabajosFilter.test.tsx`
Expected: FAIL — the current list renders text-only `<li>`s, no `<img>` anywhere.

- [ ] **Step 3: Implement — add the cover-image card, reusing `SelectedWork`'s exact pattern**

```tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '@/content/types';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';
import { withPageTransition } from '@/components/motion/PageTransition';
import { VideoPreview } from '@/components/motion/VideoPreview';
import styles from './TrabajosFilter.module.css';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: 'Bodas' },
  { value: 'video', label: 'Vídeo' },
  { value: 'fotomaton', label: 'Fotomatón' },
  { value: '360', label: '360°' },
];

export function TrabajosFilter({ projects }: { projects: Project[] }) {
  const { category, setCategory, filtered } = useProjectFilter(projects);
  const router = useRouter();

  function handleProjectClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  return (
    <div className={styles.page}>
      <h1>Trabajos</h1>
      <div role="tablist" aria-label="Filtrar trabajos por categoría" className={styles.tablist}>
        {CATEGORIES.map((c) => (
          <button key={c.value} role="tab" aria-selected={category === c.value} onClick={() => setCategory(c.value)} className={styles.tab}>
            {c.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className={styles.empty}>Todavía no hay trabajos en esta categoría — vuelve pronto.</p>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((project) => (
            <li key={project.slug} className={styles.card}>
              <Link
                href={`/trabajos/${project.slug}`}
                aria-label={`Ver proyecto ${project.title}`}
                onClick={(e) => handleProjectClick(e, `/trabajos/${project.slug}`)}
              >
                {project.cover.type === 'image' ? (
                  <div className={styles.imageWrap}>
                    <Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className={styles.imageWrap}>
                    <Image src={project.cover.poster ?? project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                  </div>
                )}
                <span className={styles.title}>{project.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

(Note: this listing page intentionally shows a static poster for video-cover projects rather than the full `VideoPreview` autoplay treatment used on Home's `SelectedWork` — a grid of several simultaneously-autoplaying videos on a dense listing page is a worse experience than on Home's shorter, curated selection. If the client wants full parity instead, that's a one-line change swapping the `else` branch for `<VideoPreview media={project.cover} onOpenFull={...} />` plus a `Lightbox`, mirroring `SelectedWork` exactly — flag this as an open question during plan review rather than deciding unilaterally, since it's a real UX trade-off, not just a styling choice.)

```css
/* app/trabajos/TrabajosFilter.module.css */
.page {
  max-width: 75rem;
  margin-inline: auto;
  padding-inline: var(--space-3);
  padding-block: var(--space-4) var(--space-5);
}
.page h1 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 1;
  margin-block-end: var(--space-3);
}
.tablist { display: flex; gap: var(--space-2); margin-block-end: var(--space-4); flex-wrap: wrap; }
.tab {
  background: none;
  border: 1px solid var(--color-muted);
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
  font: inherit;
}
.tab[aria-selected="true"] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.empty { color: var(--color-muted); padding-block: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); list-style: none; padding: 0; }
.card { position: relative; }
.imageWrap { position: relative; width: 100%; aspect-ratio: 3 / 2; }
.imageWrap img { object-fit: cover; }
.title { display: block; margin-top: var(--space-1); font-family: var(--font-serif); }
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- app/trabajos/TrabajosFilter.test.tsx`
Expected: PASS, all tests including the pre-existing filter/link-count tests from base plan Tasks 22/28.

- [ ] **Step 5: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass; confirm no TypeScript errors from the new `Image`/`styles` usage.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "style: add cover images and page-shell styling to /trabajos listing"
```

---

### Task 7: Styling pass — `/trabajos/[slug]` detail page

Same shell treatment, applied to the project detail page and its `ProjectGallery`.

**Files:**
- Create: `app/trabajos/[slug]/page.module.css`
- Modify: `app/trabajos/[slug]/page.tsx`, `components/sections/ProjectGallery.module.css` (already exists from base plan — extend it)
- Test: `app/trabajos/[slug]/page.test.tsx`, `components/sections/ProjectGallery.test.tsx` (existing files — no new tests needed, pure CSS, run existing ones to confirm no regression)

**Interfaces:** none — no prop/export changes.

- [ ] **Step 1: Create `app/trabajos/[slug]/page.module.css`**

```css
.page {
  max-width: 75rem;
  margin-inline: auto;
  padding-inline: var(--space-3);
  padding-block: var(--space-4) var(--space-5);
}
.page h1 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 1;
  margin-block-end: var(--space-1);
}
.meta { color: var(--color-muted); margin-block-end: var(--space-2); }
.description { max-width: 44rem; margin-block-end: var(--space-4); }
.nextLink {
  display: inline-block;
  margin-block-start: var(--space-4);
  padding-block-start: var(--space-3);
  border-top: 1px solid var(--color-muted);
  color: var(--color-accent);
  font-family: var(--font-serif);
}
```

- [ ] **Step 2: Wire it into `page.tsx`**

Read the current file (base plan Task 23, later modified for `generateMetadata` in Task 28 and the JSON-LD script in Task 29 — this task must not disturb any of that, only add `className`s to the JSX). Apply `styles.page` to the `<article>`, `styles.meta` to the category/year/location `<p>`, `styles.description` to the description `<p>`, and `styles.nextLink` to the `NextProjectLink` (from Task 1 of this plan).

- [ ] **Step 3: Extend `ProjectGallery.module.css`**

Read the current file (base plan Task 23, already has `.section`/image-wrap rules from the C1 fix wave — check exact current class names before adding, don't duplicate). Add:

```css
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-2); margin-block: var(--space-3); }
```

Apply `styles.grid` to `ProjectGallery.tsx`'s image-list wrapper `<div>`.

- [ ] **Step 4: Run the existing tests and build**

Run: `npm test -- "app/trabajos/[slug]" components/sections/ProjectGallery.test.tsx && npm run build`
Expected: all pass, no regressions.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: add page-shell styling to the project detail page and gallery grid"
```

---

### Task 8: Fix the permanently-empty "Fotomatón" filter

The `fotomaton` filter tab in `/trabajos` matches zero seed projects (the one photobooth-adjacent seed project is categorized `'360'`, not `'fotomaton'`) — clicking it currently shows nothing with no explanation. Task 6 above already added a generic empty-state message for any empty filter result, which covers the immediate UX gap. This task addresses the underlying data question directly rather than leaving it as a permanent dead filter.

**Files:**
- Modify: `content/projects.ts`

**Interfaces:** none — `Project`/`ProjectCategory` types are unchanged.

- [ ] **Step 1: Decide the fix — this needs the client's input, not a default**

Read `content/projects.ts`'s `gala-empresa-fotomaton-360` entry. It's a single seed project that's genuinely both a photobooth (`fotomatón`) and a 360° platform (`360°`) event — the current single-`category` field can't represent both. Two real options, not a default to pick silently:

- **(a)** Split it into two separate placeholder seed projects, one per category, if the client's real portfolio actually has distinct fotomatón-only and 360°-only work to eventually replace them with.
- **(b)** Recategorize the single project as `fotomaton` (dropping the `360` tab's only match instead), if 360° is the rarer/secondary service and fotomatón is more central — or vice versa.

**Do not implement either silently — this step is a checkpoint: confirm with the client which real projects they actually have (or plan to have) in each category before touching the data**, since whichever seed category is now empty will hit the exact same problem the fix wave's empty-state message already covers gracefully in the meantime. If the client's real project set arrives with fotomatón examples, this becomes moot — the real data replaces the seed entirely per `README.md`'s swap process.

- [ ] **Step 2 (once decided): apply the change to `content/projects.ts`**, run `npm test -- content/projects.test.ts` to confirm the existing placeholder-flag/shape assertions still pass, and commit:

```bash
git add content/projects.ts
git commit -m "content: <describe the actual category fix once decided>"
```

---

### Task 9: Enrich JSON-LD structured data

`lib/schema.ts`'s `localBusinessSchema()` and `creativeWorkSchema()` (base plan Task 29) omit several cheap, high-value SEO fields the final review flagged: `url`, `image`, `areaServed` for the business; `image`/`url` for each creative work.

**Correction (2026-08-31, ruling recorded in this plan's ledger before Task 9 was dispatched):** this task originally also specced an `openingHoursSpecification` field sourced from a claimed "Lunes 9:00-13:00 / 16:00-19:00" real value in `content/site.ts`. That value does not exist anywhere in the codebase — `content/site.ts` has no opening-hours field at all, and `README.md` explicitly lists "el horario completo" as still pending client confirmation. Shipping invented hours into structured data would violate this plan's Global Constraint against fabricating business facts, so `openingHoursSpecification` is dropped from this task entirely; add it in a future task only once the client confirms real hours. The task text below is also corrected against the *current* `lib/schema.ts` (streetAddress/postalCode were added to the address block by base-plan work after this task was originally drafted — the replacement code below preserves them instead of silently dropping them), and `areaServed` now sources from `site.legalCity` (`'Sevilla'`, the metro area the studio markets itself to) rather than `site.addressLocality` (`'La Algaba'`, the precise but different registered-address town) — using the latter would have made the task's own test assertion (`areaServed` = `'Sevilla'`) fail. The real logo has since landed at `public/images/logo/eme-mark-square.png`, so `image` uses that instead of a placeholder hero photo.

**Files:**
- Modify: `lib/schema.ts`
- Test: `lib/schema.test.ts` (existing file — extend)

**Interfaces:**
- Consumes: `site.legalCity`, `site.email`, `site.brandName`, `site.instagramUrl`, `site.facebookUrl`, `site.streetAddress`, `site.addressLocality`, `site.postalCode`, `site.addressCountry` (all already in `content/site.ts` / already used).
- Produces: `localBusinessSchema()` and `creativeWorkSchema(project)` keep their existing signatures — only their returned object gains fields, nothing is removed or renamed (any code consuming these functions elsewhere is unaffected).

- [ ] **Step 1: Write the failing test**

```ts
// Add to lib/schema.test.ts
it('includes url, image, and areaServed on the LocalBusiness schema', () => {
  const schema = localBusinessSchema();
  expect(schema.url).toBe('https://www.emefotografiasevilla.es');
  expect(schema.image).toBe('https://www.emefotografiasevilla.es/images/logo/eme-mark-square.png');
  expect(schema.areaServed).toBe('Sevilla');
  expect(schema.address).toEqual({
    '@type': 'PostalAddress',
    streetAddress: site.streetAddress,
    addressLocality: site.addressLocality,
    postalCode: site.postalCode,
    addressCountry: site.addressCountry,
  });
});

it('includes image and url on the CreativeWork schema when the project has a cover image', () => {
  const project = projects.find((p) => p.cover.type === 'image')!;
  const schema = creativeWorkSchema(project);
  expect(schema.image).toContain(project.cover.src);
  expect(schema.url).toBe(`https://www.emefotografiasevilla.es/trabajos/${project.slug}`);
});
```

(Add `import { site } from '@/content/site';` to the test file if not already imported.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/schema.test.ts`
Expected: FAIL — `url`/`image`/`areaServed` don't exist yet on the LocalBusiness schema, and the CreativeWork schema has no `image`/`url`.

- [ ] **Step 3: Implement**

```ts
import { site } from '@/content/site';
import type { Project } from '@/content/types';

const SITE_URL = 'https://www.emefotografiasevilla.es';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.brandName,
    url: SITE_URL,
    image: `${SITE_URL}/images/logo/eme-mark-square.png`,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      postalCode: site.postalCode,
      addressCountry: site.addressCountry,
    },
    areaServed: site.legalCity,
    sameAs: [site.instagramUrl, site.facebookUrl],
  };
}

export function creativeWorkSchema(project: Project) {
  const imageSrc = project.cover.type === 'image' ? project.cover.src : project.cover.poster;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    dateCreated: String(project.year),
    url: `${SITE_URL}/trabajos/${project.slug}`,
    ...(imageSrc ? { image: `${SITE_URL}${imageSrc}` } : {}),
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — confirm the `<script>` injections in `app/layout.tsx`/`app/trabajos/[slug]/page.tsx` still serialize correctly with the new fields (no unescaped characters — same check as the base plan's Task 29 review).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: enrich JSON-LD schema with url, image, and areaServed"
```

---

### Task 10: `sizes` prop audit + `--font-serif` token fix

Two small, independent perf fixes flagged by the final review: several `next/image` usages across the site never set a `sizes` prop (falling back to a `100vw` srcset, over-downloading on non-fill images), and `--font-serif` in `styles/tokens.css` references the raw `'Fraunces'` family name instead of the `next/font`-generated CSS variable, bypassing the size-adjusted fallback face that protects against layout shift.

**Files:**
- Modify: `styles/tokens.css`, and every `next/image` usage across `components/`/`app/` missing a `sizes` prop on a non-`fill` image (grep for `<Image` without `sizes=` first — this includes at minimum `app/sobre-nosotros/page.tsx` and `components/sections/SobreEmePreview.tsx`, both flagged directly by the final review; check `ProjectGallery.tsx`, `Hero.tsx` too).
- Test: no new tests — these are non-behavioral perf/CLS fixes; run the full suite + build to confirm zero regression.

- [ ] **Step 1: Fix the `--font-serif` token**

Read `app/layout.tsx` to find the exact CSS variable name `next/font/google` generates for Fraunces (something like `--font-fraunces` or similar, set via the `variable` option on the `Fraunces(...)` call — confirm the exact name in the file rather than guessing). Update `styles/tokens.css`:

```css
/* Before: --font-serif: 'Fraunces', Georgia, serif; */
--font-serif: var(--font-fraunces), Georgia, serif; /* use the real generated variable name from app/layout.tsx */
```

- [ ] **Step 2: Run the full suite and build, visually spot-check the Home page's Fraunces headings render correctly**

Run: `npm test && npm run build`
Expected: all pass. This change is purely which CSS custom property resolves the font — if Fraunces still renders (just now via the `next/font`-managed `@font-face` with its fallback-metric override), nothing else should visibly change.

- [ ] **Step 3: Add `sizes` to every non-`fill` `next/image` usage missing one**

For each flagged file, add a `sizes` value proportional to how large the image actually renders at each breakpoint (not a blanket `100vw` — that's the exact problem being fixed). Example for `app/sobre-nosotros/page.tsx`'s team photo (rendered inside a `44rem`-max-width column per Task 5's page shell):

```tsx
<Image src="..." alt="..." width={800} height={1200} sizes="(max-width: 700px) 100vw, 44rem" className={styles.teamImage} />
```

Apply the equivalent reasoning to each other flagged usage — the `sizes` value should match that image's actual rendered width in the page-shell layout Tasks 5–7 just established, not a copy-pasted constant.

- [ ] **Step 4: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: correct --font-serif token and add missing next/image sizes props"
```

---

### Task 11: Category display labels in the content layer

`project.category` currently renders as its raw storage value (`"boda"`, `"video"`, `"360"`) on the project detail page instead of a human-readable label. `TrabajosFilter` already has the right display strings (`'Bodas'`, `'Vídeo'`, `'360°'`) hardcoded locally — this task moves them to the content layer so both places share one source of truth.

**Files:**
- Modify: `content/types.ts`, `content/services.ts` (or a new small `lib/category-labels.ts` — see Step 1), `app/trabajos/[slug]/page.tsx`, `app/trabajos/TrabajosFilter.tsx`
- Test: `lib/category-labels.test.ts` (new, if extracted as its own module — see Step 1)

**Interfaces:**
- Produces: `CATEGORY_LABELS: Record<ProjectCategory, string>` — a single exported lookup, consumed by both `TrabajosFilter.tsx` and `app/trabajos/[slug]/page.tsx`.

- [ ] **Step 1: Decide where this lives — check `content/services.ts` first**

`content/services.ts` already has a `name` field per service (`'Fotografía de Boda'`, `'Vídeo'`, `'Fotomatón'`, `'Experiencia 360°'`) keyed by the same `slug`/`ProjectCategory` values — but those are the longer service-page names, not the shorter grid-filter labels (`'Bodas'` vs `'Fotografía de Boda'`). Rather than force one field to serve both, create a small dedicated module:

```ts
// lib/category-labels.ts
import type { ProjectCategory } from '@/content/types';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  boda: 'Bodas',
  video: 'Vídeo',
  fotomaton: 'Fotomatón',
  '360': '360°',
};
```

- [ ] **Step 2: Write the failing test**

```ts
// lib/category-labels.test.ts
import { describe, it, expect } from 'vitest';
import { CATEGORY_LABELS } from './category-labels';
import { projects } from '@/content/projects';

describe('CATEGORY_LABELS', () => {
  it('has a label for every category actually used by a seed project', () => {
    for (const project of projects) {
      expect(CATEGORY_LABELS[project.category]).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- lib/category-labels.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 4: Implement `lib/category-labels.ts`** (code given in Step 1 above)

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- lib/category-labels.test.ts`
Expected: PASS.

- [ ] **Step 6: Use it in `app/trabajos/[slug]/page.tsx`**

Replace the raw `{project.category}` interpolation with `{CATEGORY_LABELS[project.category]}`, importing from `@/lib/category-labels`.

- [ ] **Step 7: Use it in `app/trabajos/TrabajosFilter.tsx`**

Replace the local hardcoded `CATEGORIES` array's `label` values with `CATEGORY_LABELS[c.value]` where `c.value !== 'todos'` (keep `'Todos'` as a literal — it's not a `ProjectCategory`, it's the "show everything" option, not in the lookup).

- [ ] **Step 8: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — confirm `app/trabajos/[slug]/page.test.tsx` and `TrabajosFilter.test.tsx`'s existing assertions on visible label text still hold (they should, since the label VALUES are unchanged, only their source moved).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: move category display labels to a shared content module"
```

---

### Task 12: FAQ section on `/contacto`

The client's spec asks for an FAQ addressing booking-blocking questions (availability, delivery times, travel, booking process, image rights). Placed on `/contacto` rather than as a new top-level nav route — right where someone is about to reach out is where these objections actually get resolved, and it keeps the nav from growing to a 5th item for a small content block (see "Evaluated and Declined" for the reasoning against a dedicated top-level process page; this is the FAQ's placement decision, flagged here for the client's OK during plan review — a dedicated `/faq` route is a trivial follow-up if they'd rather have one).

**Files:**
- Create: `content/faq.ts`, `components/sections/Faq.tsx`, `components/sections/Faq.module.css`
- Test: `content/faq.test.ts`, `components/sections/Faq.test.tsx`
- Modify: `app/contacto/page.tsx` (mount `<Faq />`)

**Interfaces:**
- Produces: `faqs: FaqEntry[]` from `content/faq.ts`; `<Faq />` (no props, reads `faqs` directly, matching the pattern every other content-driven section already uses).

- [ ] **Step 1: Write the failing test for the content shape**

```ts
// content/faq.test.ts
import { describe, it, expect } from 'vitest';
import { faqs } from './faq';

describe('faqs', () => {
  it('has at least 5 entries covering the core pre-booking questions', () => {
    expect(faqs.length).toBeGreaterThanOrEqual(5);
    for (const f of faqs) {
      expect(f.question).toBeTruthy();
      expect(f.answer).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- content/faq.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement `content/faq.ts`**

Add the type to `content/types.ts` first:

```ts
// Add to content/types.ts
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  isPendingConfirmation?: boolean;
}
```

```ts
// content/faq.ts
import type { FaqEntry } from './types';

export const faqs: FaqEntry[] = [
  {
    id: 'disponibilidad',
    question: '¿Cómo sé si estáis disponibles para mi fecha?',
    answer: 'Escríbenos con la fecha de tu evento a través del formulario de contacto y te confirmamos disponibilidad en menos de 48 horas.',
  },
  {
    id: 'reserva',
    question: '¿Cómo se reserva la fecha?',
    answer: 'La fecha queda reservada con la firma del contrato y el pago de una señal. Te lo explicamos todo en la primera llamada, sin compromiso.',
  },
  {
    id: 'entrega',
    question: '¿Cuánto se tarda en recibir las fotos y el vídeo?',
    answer: 'Plazo de entrega pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto lo tengamos cerrado.',
    isPendingConfirmation: true,
  },
  {
    id: 'desplazamiento',
    question: '¿Os desplazáis fuera de Sevilla?',
    answer: 'Sí, cubrimos bodas y eventos fuera de Sevilla. El coste de desplazamiento depende de la distancia — coméntanoslo al escribirnos y te damos un presupuesto ajustado.',
  },
  {
    id: 'derechos-imagen',
    question: '¿Quién tiene los derechos de las fotos y vídeos?',
    answer: 'Política de derechos de imagen pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto la tengamos cerrada.',
    isPendingConfirmation: true,
  },
  {
    id: 'cancelacion',
    question: '¿Qué pasa si tengo que cambiar la fecha?',
    answer: 'Política de cambios de fecha pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto la tengamos cerrada.',
    isPendingConfirmation: true,
  },
];
```

(Three of the six answers are honestly marked pending — delivery timeframe, image-rights policy, and date-change policy are real business decisions this plan cannot invent, per the Global Constraints. The other three are generic-but-accurate process descriptions consistent with what's already documented elsewhere in the site's copy. Flag these three specifically for the client during plan review — the FAQ ships more useful with real answers than with none, but must not ship implying answers that were never confirmed.)

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- content/faq.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing test for `Faq.tsx`**

```tsx
// components/sections/Faq.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Faq } from './Faq';
import { faqs } from '@/content/faq';

describe('Faq', () => {
  it('renders every question as a collapsed disclosure, answer hidden until expanded', async () => {
    const user = userEvent.setup();
    render(<Faq />);
    expect(screen.getAllByRole('button')).toHaveLength(faqs.length);
    expect(screen.queryByText(faqs[0].answer)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: faqs[0].question }));
    expect(screen.getByText(faqs[0].answer)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- components/sections/Faq.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 7: Implement `Faq.tsx` using native `<details>`/`<summary>`** (zero JS state needed, fully keyboard-accessible by default, matches the project's "no unneeded complexity" ethos)

```tsx
import { faqs } from '@/content/faq';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <h2 id="faq-heading">Preguntas frecuentes</h2>
      {faqs.map((f) => (
        <details key={f.id} className={styles.item}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </section>
  );
}
```

```css
/* components/sections/Faq.module.css */
.section { margin-block-start: var(--space-4); padding-block-start: var(--space-3); border-top: 1px solid var(--color-muted); }
.section h2 { font-family: var(--font-serif); font-size: var(--type-h3); margin-block-end: var(--space-2); }
.item { padding-block: var(--space-1); border-bottom: 1px solid var(--color-muted); }
.item summary { cursor: pointer; font-weight: 600; padding-block: var(--space-1); }
.item p { color: var(--color-muted); padding-block-end: var(--space-1); }
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- components/sections/Faq.test.tsx`
Expected: PASS. Note: Testing Library's `getByRole('button', ...)` on a native `<summary>` works because browsers/jsdom expose `<summary>` with an implicit `button` role — confirm this holds in this project's jsdom version by checking the test actually passes, not just assuming.

- [ ] **Step 9: Mount on `/contacto`**

Add `<Faq />` to `app/contacto/page.tsx`, after the `<ContactForm />` (so a visitor sees the form's clear call-to-action first, with the FAQ as supporting context below it — not blocking the primary action).

- [ ] **Step 10: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add FAQ section to /contacto"
```

---

### Task 13: Testimonial photos

`Testimonial` currently has no photo field at all — the client's spec explicitly asks for "citas reales de parejas con foto." This task adds the type support and rendering; the real photos/names arrive with the asset handoff and replace the placeholder entries per `README.md`'s existing swap process (no new process needed).

**Files:**
- Modify: `content/types.ts`, `content/testimonials.ts`, `components/sections/Testimonios.tsx`, `components/sections/Testimonios.module.css` (new)
- Test: `content/testimonials.test.ts` (existing — extend), `components/sections/Testimonios.test.tsx` (new)

**Interfaces:**
- Produces: `Testimonial.photo?: string` (optional — testimonials without a photo yet, or ones where the client prefers text-only, still render correctly).

- [ ] **Step 1: Extend the type**

```ts
// content/types.ts — extend the existing Testimonial interface, don't redefine it
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  isPlaceholder: boolean;
  photo?: string; // path under public/images/, e.g. '/images/testimonios/placeholder-01.webp'
}
```

- [ ] **Step 2: Write the failing test for the content layer**

```ts
// Add to content/testimonials.test.ts (existing file)
it('every entry with a photo path has a corresponding placeholder-prefixed filename', () => {
  for (const t of testimonials) {
    if (t.photo) expect(t.photo).toMatch(/\/placeholder-/);
  }
});
```

- [ ] **Step 3: Run it — this passes trivially today** (no entry has a `photo` field yet) — that's expected, it's a guard for when photos are added, not a red/green step on its own. Move to the component test instead.

- [ ] **Step 4: Write the failing test for `Testimonios.tsx`**

```tsx
// components/sections/Testimonios.test.tsx (new file)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonios } from './Testimonios';

describe('Testimonios', () => {
  it('renders a photo when the testimonial has one, and degrades gracefully when it does not', () => {
    render(<Testimonios />);
    // Current seed data has zero photos — confirm no <img> is rendered and nothing crashes.
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByText(/lo que dicen de nosotros/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npm test -- components/sections/Testimonios.test.tsx`
Expected: FAIL only if `Testimonios.tsx` doesn't currently exist as importable in a way this test expects — check first; if the base plan's Task 21 version already renders correctly with zero photos, this specific test may pass immediately. If so, skip to Step 6 and add the photo-rendering half of the test instead:

```tsx
  it('renders a photo with the author\'s name as alt text when present', () => {
    vi.doMock('@/content/testimonials', () => ({
      testimonials: [{ id: 'x', quote: 'Cita', author: 'Ana', role: 'Pareja', isPlaceholder: true, photo: '/images/testimonios/placeholder-01.webp' }],
    }));
    // Note: vi.doMock requires re-importing the module under test after mocking —
    // use vi.resetModules() + dynamic import, or restructure Testimonios to accept
    // testimonials as an optional prop defaulting to the real import, whichever is
    // more consistent with this codebase's existing test patterns (check how other
    // content-driven sections are tested for content-swap scenarios first).
  });
```

- [ ] **Step 6: Implement**

```tsx
// components/sections/Testimonios.tsx
import Image from 'next/image';
import { testimonials } from '@/content/testimonials';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './Testimonios.module.css';

export function Testimonios() {
  return (
    <section aria-labelledby="testimonios-heading" className={styles.section}>
      <h2 id="testimonios-heading">Lo que dicen de nosotros</h2>
      {testimonials.map((t) => (
        <ScrollReveal key={t.id} className={styles.item}>
          <blockquote className={styles.quote}>
            {t.photo && (
              <div className={styles.photoWrap}>
                <Image src={t.photo} alt={t.author} fill sizes="4rem" />
              </div>
            )}
            <p>"{t.quote}"</p>
            <cite>{t.author} — {t.role}</cite>
          </blockquote>
        </ScrollReveal>
      ))}
    </section>
  );
}
```

```css
/* components/sections/Testimonios.module.css */
.section { padding: var(--space-5) var(--space-3); max-width: 44rem; margin-inline: auto; }
.section h2 { font-family: var(--font-serif); font-size: var(--type-h3); margin-block-end: var(--space-3); }
.item { padding-block: var(--space-3); border-top: 1px solid var(--color-muted); }
.item:first-of-type { border-top: none; }
.photoWrap { position: relative; width: 4rem; height: 4rem; border-radius: 50%; overflow: hidden; margin-block-end: var(--space-1); }
.photoWrap img { object-fit: cover; }
.quote cite { display: block; margin-block-start: var(--space-1); color: var(--color-muted); font-style: normal; }
```

- [ ] **Step 7: Run it to verify it passes**

Run: `npm test -- components/sections/Testimonios.test.tsx content/testimonials.test.ts`
Expected: PASS.

- [ ] **Step 8: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass, including `app/page.test.tsx`'s existing heading-order assertion for the Home page (Testimonios' `h2` text is unchanged).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add optional photo support to testimonials"
```

---

### Task 14: Contact form — add `lugar` and `número de invitados`

The client's spec explicitly asked for "fecha del evento, lugar, número de invitados y presupuesto." `fecha` and `presupuesto` already exist (base plan Task 26); `lugar` (venue/location) and `número de invitados` (guest count) do not.

**Files:**
- Modify: `lib/contact-store.ts`, `components/ui/ContactForm.tsx`
- Test: `lib/contact-store.test.ts`, `components/ui/ContactForm.test.tsx` (existing files — extend)

**Interfaces:**
- Modifies: `ContactSubmission` interface gains `lugar?: string` and `numeroInvitados?: string` (both optional, matching `fecha`/`presupuesto`'s existing optionality — a lead shouldn't be blocked from submitting over incomplete logistics, only over `nombre`/`email`/`tipoEvento`/`mensaje`, per the base build's existing validation rule in `saveContactSubmission`, which is unchanged by this task).

- [ ] **Step 1: Write the failing test for the store**

```ts
// Add to lib/contact-store.test.ts
it('persists lugar and numeroInvitados when provided', async () => {
  const { id } = await saveContactSubmission({
    nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola',
    lugar: 'Hacienda de San Rafael', numeroInvitados: '80',
  }, testDir);
  const files = await fs.readdir(testDir);
  const content = JSON.parse(await fs.readFile(path.join(testDir, files[0]), 'utf-8'));
  expect(content.lugar).toBe('Hacienda de San Rafael');
  expect(content.numeroInvitados).toBe('80');
});
```

(Use the same `testDir`/injectable-directory pattern the base plan's final-review fix wave already established for this test file — do not write to the real `data/contact-submissions/`.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/contact-store.test.ts`
Expected: FAIL — `lugar`/`numeroInvitados` aren't in the `ContactSubmission` interface, so TypeScript would actually reject this at compile time before it even runs as a runtime failure — either is an acceptable "fails for the right reason."

- [ ] **Step 3: Implement — extend the interface**

```ts
// lib/contact-store.ts — extend the existing interface, keep everything else (the file/UUID/validation logic) unchanged
export interface ContactSubmission {
  nombre: string;
  email: string;
  tipoEvento: string;
  fecha?: string;
  lugar?: string;
  numeroInvitados?: string;
  presupuesto?: string;
  mensaje: string;
}
```

No change needed to `saveContactSubmission`'s body — it already spreads `...payload` (per the base build's fix-wave bug fix ensuring `id`/`receivedAt` always win), so any extra fields on the payload object pass through automatically.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/contact-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing test for the form**

```tsx
// Add to components/ui/ContactForm.test.tsx
it('includes lugar and número de invitados fields, both optional', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);
  expect(screen.getByLabelText(/lugar/i)).not.toBeRequired();
  expect(screen.getByLabelText(/número de invitados/i)).not.toBeRequired();

  await user.type(screen.getByLabelText(/nombre/i), 'Ana');
  await user.type(screen.getByLabelText(/correo/i), 'ana@example.com');
  await user.selectOptions(screen.getByLabelText(/tipo de evento/i), 'boda');
  await user.type(screen.getByLabelText(/lugar/i), 'Hacienda de San Rafael');
  await user.type(screen.getByLabelText(/número de invitados/i), '80');
  await user.type(screen.getByLabelText(/mensaje/i), 'Nos casamos en junio');
  await user.click(screen.getByRole('button', { name: /enviar/i }));

  expect(global.fetch).toHaveBeenCalledWith('/api/contacto', expect.objectContaining({
    body: expect.stringContaining('"lugar":"Hacienda de San Rafael"'),
  }));
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- components/ui/ContactForm.test.tsx`
Expected: FAIL — the fields don't exist yet.

- [ ] **Step 7: Implement**

Read the current `ContactForm.tsx` (already modified once by the base plan's final-review fix wave for `isSubmitting`/`try-catch` — apply this on top, don't regress that). Add the two fields between `fecha` and `presupuesto`:

```tsx
<label htmlFor="lugar">Lugar del evento</label>
<input id="lugar" name="lugar" placeholder="Ej. Hacienda de San Rafael, Sevilla" />

<label htmlFor="numeroInvitados">Número de invitados</label>
<input id="numeroInvitados" name="numeroInvitados" type="number" min="0" placeholder="Ej. 80" />
```

(Placed as plain optional inputs, same pattern as the existing `presupuesto` field — no new validation rules, consistent with this task's Interfaces note above.)

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- components/ui/ContactForm.test.tsx`
Expected: PASS, all tests including the pre-existing ones from the base build.

- [ ] **Step 9: Update the API route test to confirm the extra fields pass through end-to-end**

```ts
// Add to app/api/contacto/route.test.ts
it('persists lugar and numeroInvitados through the full request/response cycle', async () => {
  const res = await POST(req({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola', lugar: 'Sevilla capital', numeroInvitados: '50' }));
  expect(res.status).toBe(200);
});
```

- [ ] **Step 10: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add lugar and número de invitados fields to the contact form"
```

---

### Task 15: Build and mount the Manifiesto section

The design spec's own sitemap (`docs/superpowers/specs/2026-08-31-eme-fotografia-web-design.md`) and the base plan's File Structure both call for a "Manifiesto" section between Hero and Selected Work on Home — scheduled but never actually built in any of the 31 base tasks (confirmed: no `Manifiesto.tsx` exists, `app/page.tsx` goes straight from `<Hero />` to `<SelectedWork />`). This is a genuine gap, not new scope — closing it here.

**Files:**
- Create: `components/sections/Manifiesto.tsx`, `components/sections/Manifiesto.module.css`
- Test: `components/sections/Manifiesto.test.tsx`
- Modify: `app/page.tsx`, `app/page.test.tsx` (existing heading-order test — extend)

**Interfaces:**
- Produces: `<Manifiesto />` (no props, matching every other Home section's pattern) — mounted between `<Hero />` and `<SelectedWork />` in `app/page.tsx`.

- [ ] **Step 1: Write the failing test**

```tsx
// components/sections/Manifiesto.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifiesto } from './Manifiesto';

describe('Manifiesto', () => {
  it('renders the studio\'s philosophy statement as a heading + copy', () => {
    render(<Manifiesto />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/editorial/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Manifiesto.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

Real Spanish copy, matching the warm-specific tone already established in `SobreEmePreview` and `Hero` (no client-specific facts needed here — this is brand voice, not a business detail that could be wrong):

```tsx
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './Manifiesto.module.css';

export function Manifiesto() {
  return (
    <ScrollReveal>
      <section className={styles.section} aria-labelledby="manifiesto-heading">
        <h2 id="manifiesto-heading">No contamos bodas. Contamos historias con fecha.</h2>
        <p>
          Cada pareja llega con su propio ritmo, su propia luz, su propia gente alrededor.
          Nuestro trabajo es no interponernos: observar de cerca, con la mirada de un
          editorial de moda, y entregar algo que se sienta tan real dentro de diez años
          como el día que pasó.
        </p>
      </section>
    </ScrollReveal>
  );
}
```

```css
/* components/sections/Manifiesto.module.css */
.section {
  max-width: 44rem;
  margin-inline: auto;
  padding: var(--space-5) var(--space-3);
  text-align: center;
}
.section h2 {
  font-family: var(--font-serif);
  font-size: var(--type-h3);
  line-height: 1.1;
  margin-block-end: var(--space-2);
}
.section p { color: var(--color-muted); }
```

(Flag this copy for the client's review during plan approval — it's real, finished brand-voice copy, not a placeholder, but it's this plan's own draft rather than something the client wrote or explicitly approved word-for-word.)

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Manifiesto.test.tsx`
Expected: PASS.

- [ ] **Step 5: Mount it on Home and update the heading-order test**

In `app/page.tsx`, import `Manifiesto` and place it between `<Hero />` and `<SelectedWork />`.

Update the existing test in `app/page.test.tsx` (base plan Task 21) — its `headingTexts` array must now include the Manifiesto heading in the right position:

```tsx
expect(headingTexts).toEqual([
  'No contamos bodas. Contamos historias con fecha.',
  'Trabajos seleccionados',
  'Servicios',
  'Sobre EME Fotografía Sevilla',
  'Lo que dicen de nosotros',
  '¿Celebras algo importante?',
]);
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npm test -- app/page.test.tsx`
Expected: PASS.

- [ ] **Step 7: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add and mount the Manifiesto section on Home"
```

---

### Task 16: Dead code cleanup

Small, zero-risk removals flagged by the final review — grouped into one task since none of them has independent design judgment attached, just deletion + confirming nothing references the removed code.

**Files:**
- Delete: `lib/breakpoints.ts`, `lib/breakpoints.test.ts`, `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- Modify: `styles/tokens.css` (remove unusable `--bp-*` custom properties), `components/motion/Cursor.tsx` (remove the unused `'arrastrar'` cursor label state, if `Cursor.tsx` defines it as a distinct case with no consumer — verify first)
- Verify: `public/images/hero/placeholder-hero-02.webp` — check for any reference before deleting; only remove if genuinely unused

- [ ] **Step 1: Confirm each item is genuinely dead before removing anything**

```bash
grep -rn "breakpoints" --include="*.ts" --include="*.tsx" app/ components/ lib/ | grep -v breakpoints.test.ts
grep -rn "bp-mobile\|bp-tablet\|bp-laptop\|bp-desktop" app/ components/ styles/
grep -rn "arrastrar" app/ components/
grep -rn "placeholder-hero-02" app/ components/ content/
grep -rln "file.svg\|globe.svg\|next.svg\|vercel.svg\|window.svg" app/ components/
```

For each grep that returns a real usage (not just the definition site itself), do NOT remove that item — note it in the commit message as "kept, still referenced" instead. This step is a checkpoint, not a formality — the final review's findings were about the state of the codebase at review time; confirm they still hold before deleting anything.

- [ ] **Step 2: Remove confirmed-dead items**

```bash
rm -f lib/breakpoints.ts lib/breakpoints.test.ts
rm -f public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
# Only if Step 1 confirmed no reference:
rm -f public/images/hero/placeholder-hero-02.webp
```

Remove the `--bp-*` lines from `styles/tokens.css` (they cannot be used inside a CSS `@media` condition since custom properties aren't resolved at parse time for media queries — this is a hard CSS limitation, not a style choice, so there's no working alternative to "delete them," any real breakpoint value has to stay a literal in the `@media` rule itself, which is already how `Header.module.css`'s `768px` is written).

If Step 1 confirms the Cursor's `'arrastrar'` state truly has no `data-cursor="arrastrar"` consumer anywhere, remove that case from `components/motion/Cursor.tsx`'s label-lookup logic (read the file first — do not guess at its exact shape).

- [ ] **Step 3: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — this step is the real verification that nothing was actually still depended on.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead code and unused assets flagged by the final review"
```

---

## Addendum — premium art-direction pass (added after Task 16)

The client shared a large creative brief studying award-winning photography portfolios (Richard Prescott, Levon Biss, Benjamin Von Wong, Tim Tadder, Erik Almås, Awwwards) and asked for a premium redesign direction, following an analyze-first methodology. The research (visiting and inspecting each live site) found:

- **Richard Prescott** genuinely uses WebGL (confirmed via a live canvas/WebGL context) — and it costs 25+ seconds of load time before content appears. A real, measured tradeoff, not a hypothetical one.
- The equally-or-more-acclaimed sites that load fast (Von Wong, Tim Tadder, Levon Biss) achieve the premium feel WITHOUT WebGL: large-scale asymmetric imagery, oversized editorial typography, generous negative space, and — specifically on Von Wong — project cards carrying a real accent-colored impact/context line ("Recreado en 10 ciudades · 193 países"), not just an image and a title.
- Tim Tadder's nav explicitly splits "Portfolios" (category discovery) from "Projects" (case studies) — a structure this site already has (`/trabajos` with category filters → `/trabajos/[slug]` detail).

**Ruling: no WebGL.** The measured cost (25s+ load) directly contradicts this project's performance discipline (real Lighthouse Performance 0.95, retained and re-verified after every change in this plan) and the client's own explicit fallback instruction ("si puedes conseguir la misma sensación con CSS/GSAP, prioriza esa solución"). Everything below is CSS/GSAP — the same stack already in use, no new dependency.

These five tasks extend the site's *existing* editorial identity (Fraunces/General Sans, the ink/accent/paper palette, `ScrollReveal`/GSAP/Lenis, the already-correct Home→Trabajos→Categoría→Proyecto→Galería→Contacto structure) rather than replacing it — approved by the client to append to this plan and continue execution.

### Task 17: Asymmetric staggered grid for the work galleries

Both the Home page's `SelectedWork` grid and the `/trabajos` listing grid currently lay out every card in a uniform row-aligned grid. This task staggers every third card vertically on wider viewports — the asymmetric, non-grid-aligned rhythm observed on Levon Biss and Diana Toloza — using pure CSS, no JS, no new markup.

**Files:**
- Modify: `components/sections/SelectedWork.module.css`, `app/trabajos/TrabajosFilter.module.css`

**Interfaces:** none — pure CSS, no component/prop changes.

- [ ] **Step 1: Add the staggered rule to `SelectedWork.module.css`**

Read the current file first (shown in this plan's context above — `.grid`/`.card`/`.imageWrap`/`.title` already exist). Append:

```css
@media (min-width: 700px) {
  .card:nth-child(3n+2) {
    margin-block-start: var(--space-4);
  }
}
```

(Scoped to `min-width: 700px` so the vertical offset never applies on a single-column mobile layout, where it would just look like broken spacing rather than an intentional stagger.)

- [ ] **Step 2: Add the identical rule to `app/trabajos/TrabajosFilter.module.css`**

Same rule, same selector — this grid uses the identical `.card`/`.grid` class names (established in Task 6 of this plan by reusing `SelectedWork`'s pattern verbatim), so the same CSS applies without modification:

```css
@media (min-width: 700px) {
  .card:nth-child(3n+2) {
    margin-block-start: var(--space-4);
  }
}
```

- [ ] **Step 3: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — this is a pure-CSS change with no new testable behavior; the existing tests for both grids assert on content/links, not layout, so they're unaffected.

- [ ] **Step 4: Visual check**

Start a production server and view both `/` (scroll to "Trabajos seleccionados") and `/trabajos` at a viewport ≥700px wide — confirm every 2nd-of-3 card sits visibly lower than its neighbors, breaking the uniform grid rhythm. Check at 375px too — confirm the stagger does NOT apply (single column, no `margin-block-start` offset).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: stagger the work-gallery grids for an asymmetric editorial layout"
```

---

### Task 18: Subtle hover-scale on gallery cards

A very subtle image scale on hover — one of the interaction priorities the client explicitly listed ("scale muy sutil de fotografías"). Animates only `transform` (per this project's global constraint), respects `prefers-reduced-motion`.

**Files:**
- Modify: `components/sections/SelectedWork.module.css`, `app/trabajos/TrabajosFilter.module.css`

**Interfaces:** none — pure CSS.

- [ ] **Step 1: Add the hover-scale rule to `SelectedWork.module.css`**

```css
.imageWrap {
  overflow: hidden;
}
.imageWrap img {
  transition: transform var(--duration-fast) var(--ease-standard);
}
.card:hover .imageWrap img {
  transform: scale(1.04);
}
@media (prefers-reduced-motion: reduce) {
  .imageWrap img { transition: none; }
  .card:hover .imageWrap img { transform: none; }
}
```

(`overflow: hidden` on `.imageWrap` is required so the scaled image doesn't visibly spill past its rounded box — `.imageWrap` is already `position: relative` with a fixed `aspect-ratio`, so this doesn't affect layout, only clips the hover overflow.)

- [ ] **Step 2: Add the identical rule to `app/trabajos/TrabajosFilter.module.css`**

Same CSS block, same class names, for the same reason as Task 17.

- [ ] **Step 3: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 4: Visual check**

Hover a project card on `/` and `/trabajos` — confirm the image scales up very slightly (not the whole card, not the title) and returns smoothly on mouse-out. Then emulate `prefers-reduced-motion: reduce` in DevTools and confirm the hover scale no longer happens at all (not just "instant" — genuinely absent, per this project's established "no exceptions" reduced-motion rule).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add subtle hover-scale to gallery card images"
```

---

### Task 19: Oversized typographic moment on Manifiesto

The client's brief and the research both called out oversized editorial display type (Diana Toloza's hollow-stroke "Works" treatment, Von Wong's large headline) as a recurring premium signal. `Manifiesto` — the section closest in spirit to a brand statement — currently uses `--type-h3` (1.5–2.25rem), the same size as every other section subheading. This task gives it real presence: `--type-h2` (2.25–4rem), the same scale already used for interior-page `h1`s, without violating the established "`--type-h1` stays reserved for the Home Hero" rule (this is still an `h2` element, just a larger `h2`).

**Files:**
- Modify: `components/sections/Manifiesto.module.css`

**Interfaces:** none — pure CSS, no markup/component change.

- [ ] **Step 1: Update the heading size**

Read the current file first (shown in this plan's context above). Change:

```css
.section h2 {
  font-family: var(--font-serif);
  font-size: var(--type-h2);
  line-height: 0.98;
  margin-block-end: var(--space-3);
  max-width: 20ch;
  margin-inline: auto;
}
```

(`max-width: 20ch` + `margin-inline: auto` keeps the now-larger heading from stretching edge-to-edge into an unreadable single line on wide viewports — it wraps to 2–3 lines instead, matching the multi-line oversized-headline treatment observed on Von Wong and Diana Toloza. `line-height: 0.98` tightens the line spacing for a punchier, more editorial block at this larger size — matches the tightening already used on `Hero.module.css`'s `.content h1 { line-height: 0.95; }`.)

- [ ] **Step 2: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — `Manifiesto.test.tsx` asserts on the heading role/text content, not its computed size, so it's unaffected.

- [ ] **Step 3: Visual check**

View `/` and scroll to Manifiesto — confirm the heading now reads noticeably larger than the section's body paragraph and the other sections' `h2`s (Trabajos seleccionados, Servicios, etc.), wrapping to 2–3 lines rather than one long line, at both 375px and 1440px.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: give Manifiesto's heading real oversized editorial presence"
```

---

### Task 20: Optional project impact line

Von Wong's project cards pair an accent-colored impact/result line with grey metadata (place/date) — turning a photo into "work with results," not just an image. This task adds that as an OPTIONAL field on `Project`, rendered on the detail page only when present. No existing seed project gets a fabricated value — this is infrastructure for when the client provides a real one (e.g., a guest count, a press mention, a venue detail worth calling out), consistent with this project's standing rule against inventing business facts.

**Files:**
- Modify: `content/types.ts`, `app/trabajos/[slug]/page.tsx`, `app/trabajos/[slug]/page.module.css`
- Test: `app/trabajos/[slug]/page.test.tsx` (existing file — extend)

**Interfaces:**
- `Project` gains `impactLine?: string` (optional — every existing seed project and every existing test constructing a `Project` without one stays valid).

- [ ] **Step 1: Extend the type**

```ts
// content/types.ts — extend the existing Project interface, don't redefine it
export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: number;
  client: string;
  location: string;
  description: string;
  impactLine?: string;
  cover: ProjectMedia;
  gallery: ProjectMedia[];
}
```

- [ ] **Step 2: Write the failing test**

```tsx
// Add to app/trabajos/[slug]/page.test.tsx
it('renders the impact line when a project has one, styled distinctly from the metadata line', async () => {
  // clara-y-manuel has no impactLine in the seed data — this test needs a project that does.
  // If no seed project has one yet, this test is written against a stubbed/inline
  // project object rather than the real content module — check the file's existing
  // test setup pattern first and follow it (some tests here render the real Page
  // against a real slug; if none of the 4 seed projects has impactLine set, add
  // a minimal one to a NON-primary seed project's data for this test to exercise
  // against, or test via a lower-level check appropriate to how this file's other
  // tests are structured — use your judgment based on the actual file, and document
  // your choice in the report).
  const result = await Page({ params: Promise.resolve({ slug: 'clara-y-manuel' }) });
  render(result);
  // clara-y-manuel has no impactLine — confirm nothing renders for it.
  expect(screen.queryByTestId('project-impact')).not.toBeInTheDocument();
});
```

(This test deliberately checks the ABSENCE case first, since no seed project has real impact data yet — the presence case can't be tested against real content without fabricating a fact. If you judge a presence-case test is still valuable with an explicitly-fake, clearly-test-only value not touching `content/projects.ts`, add one — document your reasoning either way.)

- [ ] **Step 3: Run it to verify it passes as a baseline (no seed data has this field yet, so there's nothing to turn red first here — this step confirms the absence-case assertion is meaningful against real current data)**

Run: `npm test -- "app/trabajos/[slug]/page.test.tsx"`
Expected: PASS (the component doesn't render anything for `project-impact` yet — same before and after Step 1's type addition alone; this becomes a real regression guard once Step 4 is implemented).

- [ ] **Step 4: Implement the conditional render**

Read the current `app/trabajos/[slug]/page.tsx` (shown in this plan's context above). Add, right after the existing `<p className={styles.meta}>` line and before `<p className={styles.description}>` — do NOT modify the existing meta line itself (a separate task in this plan may also touch that line; keep this addition independent):

```tsx
{project.impactLine && (
  <p className={styles.impact} data-testid="project-impact">{project.impactLine}</p>
)}
```

Add to `app/trabajos/[slug]/page.module.css`:

```css
.impact {
  color: var(--color-accent);
  font-weight: 600;
  margin-block-end: var(--space-1);
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- "app/trabajos/[slug]/page.test.tsx"`
Expected: PASS.

- [ ] **Step 6: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass — confirm `content/projects.test.ts` (which iterates every seed project) doesn't break on the new optional field (it shouldn't, since nothing there asserts on `impactLine`'s presence/absence).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add optional project impact line, rendered when present"
```

---

### Task 21: Contained parallax on the Hero image

The client's brief explicitly asked for "parallax muy contenido" (very contained) — scoped to the Hero only, not sitewide. GSAP `ScrollTrigger` (already a dependency, already used by `ScrollReveal`) drives a subtle `translateY` on the Hero background image as the user scrolls past it, animating only `transform` (per this project's global constraint), fully gated behind `useReducedMotion()`.

**Files:**
- Modify: `components/sections/Hero.tsx`, `components/sections/Hero.module.css`
- Test: `components/sections/Hero.test.tsx` (existing file — extend)

**Interfaces:** none — no new exports, `<Hero />` keeps its zero-prop signature.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to components/sections/Hero.test.tsx
import { gsap } from 'gsap';

vi.mock('gsap', () => ({ gsap: { to: vi.fn(), registerPlugin: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

it('sets up a contained parallax tween on the hero image when motion is not reduced', () => {
  render(<Hero />);
  expect(gsap.to).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ scrollTrigger: expect.objectContaining({ trigger: expect.anything() }) })
  );
});

it('does not set up parallax when motion is reduced', () => {
  // This file's existing tests already establish the pattern for driving
  // useReducedMotion to true via a real window.matchMedia override — reuse
  // that exact pattern here (check the file for it) rather than inventing
  // a second mocking approach in the same file.
});
```

(The brief gives the shape of this test rather than a byte-exact snippet, since it must integrate with `Hero.test.tsx`'s EXISTING `gsap`-mocking needs, if any — check the current file first: if it does not yet mock `gsap` at all, add the mock at the top of the file per the snippet above; if some other test in the file already renders `<Hero />` without expecting `gsap.to` to have been called, verify that test still passes once parallax is gated correctly behind `reducedMotion` — a mount with the default `matches: false` stub from `vitest.setup.ts` means `reducedMotion` starts `false`, so `gsap.to` WOULD be called on every existing test's render too, per the reduced-motion default already established for every other test in this file. Read the file fully before writing this test, and document exactly what you found and how you integrated with it.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Hero.test.tsx`
Expected: FAIL — no `gsap.to` call exists yet for the image parallax.

- [ ] **Step 3: Implement the parallax effect**

Read the current `components/sections/Hero.tsx` (shown in this plan's context above — it already imports `useEffect`, `useState`, `useReducedMotion`). Add a `ref` on the `<Image>`'s wrapping element and a GSAP effect:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Hero.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INTRO_KEY = 'eme-intro-shown';

export function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(INTRO_KEY) === 'true';
    if (alreadyShown) return;
    if (reducedMotion) {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      return;
    }
    setShowIntro(true);
    const timer = setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
    }, 1400);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !heroRef.current || !imageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={heroRef} className={styles.hero} data-hero-fullbleed>
      {showIntro && (
        <div data-testid="intro-sequence" className={styles.intro}>
          <span className={styles.introMark}>eme</span>
        </div>
      )}
      <div ref={imageRef} className={styles.imageParallax}>
        <Image
          src="/images/hero/placeholder-hero-01.webp"
          alt="Pareja de novios en un momento espontáneo, fotografía editorial de boda"
          fill
          priority
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h1>{site.brandName}</h1>
        <p>Fotografía y vídeo de bodas y eventos en {site.legalCity}, con la mirada de un editorial de moda.</p>
      </div>
    </section>
  );
}
```

Add to `components/sections/Hero.module.css`:

```css
.imageParallax {
  position: absolute;
  inset: -8% 0;
  z-index: -1;
}
.imageParallax .image {
  position: relative;
  width: 100%;
  height: 100%;
}
```

(The wrapping `.imageParallax` element replaces `.image`'s own `z-index: -1` as the positioned/animated node — `yPercent: 12` translates it within its own `inset: -8%` overscan box, so the parallax shift never reveals empty space at the section's top/bottom edges. `.image`'s existing `object-fit: cover` rule stays on the `next/image` element itself, now filling its parent `.imageParallax` box via the added `position: relative; width: 100%; height: 100%` — `next/image`'s `fill` prop still works identically, just measuring against the new wrapper instead of `.hero` directly.)

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Hero.test.tsx`
Expected: PASS, all tests including every pre-existing one in the file.

- [ ] **Step 5: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 6: Visual check**

Start a production server, view `/`, and scroll past the Hero — confirm the background image shifts very subtly relative to the viewport (contained parallax, not a dramatic effect), while the `h1`/`p` content stays fixed in its own layer. Then emulate `prefers-reduced-motion: reduce` and confirm the image no longer shifts at all while scrolling.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add contained GSAP parallax to the Hero background image"
```

---

### Task 22: Close the video-only Lightbox focus-escape gap with a real focus-trap library

Task 3's review (task reviewer, `.superpowers/sdd/2026-08-31-eme-fotografia-web-incremental/progress.md`) found the hand-rolled `getFocusable()` Tab-trap in `components/motion/Lightbox.tsx` is a no-op whenever the modal's only content is a bare `<video controls>` element — exactly what both real Lightbox call sites render (`components/sections/SelectedWork.tsx:39-41`, `components/sections/ProjectGallery.tsx:26-28`). `getFocusable()`'s `querySelectorAll` can never see a native `<video controls>` element's internal Play/volume/fullscreen buttons — those live in a user-agent shadow tree that is not exposed to JS in any browser, by spec, regardless of enumeration technique. So Tab can walk forward through the video's native controls and then escape straight into the rest of the page (Header/Footer), and Shift+Tab from the video's first control can escape backward the same way.

A hand-rolled two-sentinel-`div` fix was considered and rejected: naively placing a leading sentinel as the first tabbable child inside the trap container intercepts the very first real Tab press after the modal opens (before the user ever reaches the video), misrouting focus instead of fixing anything — getting this right requires the same guard-node-plus-programmatic-initial-focus choreography that the `focus-trap` library (davidtheclark/focus-trap, MIT, ~4KB, single dependency on `tabbable`) already implements and has hardened for years across exactly this class of edge case (its `fallbackFocus` option exists specifically for containers with no conventionally-tabbable descendants). Adopting it here is justified by that regression risk, not by convenience — this project otherwise avoids adding dependencies (Framer Motion was explicitly declined as redundant with GSAP).

**Files:**
- Modify: `components/motion/Lightbox.tsx`
- Test: `components/motion/Lightbox.test.tsx` (existing file — extend)
- Modify: `package.json`, `package-lock.json` (new dependency)

**Interfaces:** none — `<Lightbox isOpen onClose children>` keeps its exact existing prop signature. `getFocusable()` is deleted; nothing else in the codebase imports it (verify with `grep -rn "getFocusable" --include=*.tsx --include=*.ts .` before deleting — expected: only this file).

- [ ] **Step 1: Install the dependency**

```bash
npm install focus-trap
```

- [ ] **Step 2: Write the failing test**

```tsx
// Add to components/motion/Lightbox.test.tsx

it('does not throw and still restores focus on close when the content has no conventionally-focusable descendants', async () => {
  const trigger = document.createElement('button');
  document.body.appendChild(trigger);
  trigger.focus();

  const { rerender } = render(
    <Lightbox isOpen onClose={() => {}}>
      <video data-testid="clip" />
    </Lightbox>
  );
  expect(trigger).not.toHaveFocus();
  expect(screen.getByTestId('clip').parentElement).toHaveFocus();

  rerender(<Lightbox isOpen={false} onClose={() => {}}><video data-testid="clip" /></Lightbox>);
  expect(trigger).toHaveFocus();

  document.body.removeChild(trigger);
});
```

Note: this test cannot reproduce the actual escape bug — jsdom does not implement native `<video controls>` shadow-DOM tab stops, so no unit test can. It exists to prove the `focus-trap` integration doesn't regress the no-focusable-content path (initial focus, focus restore on close) that the old code handled as a special case (`if (focusable.length === 0) return;`). The real fix is verified manually in Step 6.

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- components/motion/Lightbox.test.tsx`
Expected: FAIL — current code has no `focus-trap` import, so this specific test may actually pass by accident against the OLD code (the old code's early-return already avoids throwing here too). That's expected and fine: this step's real purpose is confirming the test file compiles and runs, not a strict RED assertion for this particular case. The meaningful regression check is Step 5 (all 7 pre-existing tests) passing unchanged after the rewrite.

- [ ] **Step 4: Replace the hand-rolled trap with `focus-trap`**

Replace the full contents of `components/motion/Lightbox.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { createFocusTrap, type FocusTrap } from 'focus-trap';
import styles from './Lightbox.module.css';

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const trap = createFocusTrap(contentRef.current, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      fallbackFocus: () => contentRef.current!,
    });
    trapRef.current = trap;
    trap.activate();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      trap.deactivate();
      trapRef.current = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} data-testid="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={contentRef} className={styles.content} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

`escapeDeactivates: false` and `clickOutsideDeactivates: false` keep Escape and backdrop-click handling exactly as they were (owned by this component's own listeners, not the library's), avoiding double-fired `onClose` calls. `returnFocusOnDeactivate` defaults to `true`, so the library's own `deactivate()` restores focus to whatever was focused before `activate()` — this replaces the old `previouslyFocused` ref entirely; do not keep it, it would be dead code.

- [ ] **Step 5: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all pass, including all 5 original Lightbox tests, Task 3's 2 trap tests (`components/motion/Lightbox.test.tsx`), and the new test from Step 2 — 8 tests total in this file, none rewritten except the deleted `previouslyFocused`-specific assertions being satisfied by the library instead.

- [ ] **Step 6: Manual real-browser verification (required — jsdom cannot cover this)**

Start a production server (`npm run build && npm start`), open `/trabajos`, click into a project whose gallery includes a video (or the Home page's featured video, depending on current seed data), and open its Lightbox. Press Tab repeatedly: confirm focus enters the video's native controls, then loops back into the dialog (does not reach the page's Header/Footer/other content) after the last control. Repeat with Shift+Tab from the first control, confirming the same containment backward. Confirm Escape still closes it and returns focus to the trigger element, and backdrop click still closes it.

- [ ] **Step 7: Commit**

```bash
git add -A package.json package-lock.json
git commit -m "fix: replace hand-rolled Lightbox focus trap with focus-trap library"
```

---

## Self-Review Notes

- **Client's 6-point list coverage:** (1) Animations → Tasks 1–2 (View Transitions wiring, Confianza scroll-trigger), Framer Motion explicitly declined. (2) Accessibility → Task 3 (Lightbox focus trap), Task 4 (active-route `aria-current`); cursor's existing `aria-hidden`/`pointer-events:none`/reduced-motion handling was already reviewed clean in the base build, nothing new needed there. (3) Performance/SEO → Task 9 (JSON-LD enrichment), Task 10 (`sizes` audit, font token fix); Lighthouse/metadata/sitemap already shipped in the base build, re-verify scores after this plan's changes rather than re-building what exists. (4) Missing sections → Task 12 (FAQ), Task 13 (testimonial photos), Task 14 (contact form fields); dedicated "how we work" section explicitly declined as redundant with `/servicios`' existing per-service process. (5) i18n → explicitly deferred, no task. (6) CMS → explicitly declined, no task.
- **Final-review findings coverage:** C2 (no styling on 5 routes) → Tasks 5–7. I4 (empty Fotomatón filter) → Task 6 (empty-state message) + Task 8 (taxonomy decision, needs client input). I7 (video re-cut) → declined as obsolete. Minor items (font token, `sizes`, category labels, Confianza trigger, dead code, `aria-current`, Manifiesto) → Tasks 2, 4, 10, 11, 15, 16. Remaining lint occurrences → explicitly declined.
- **Type consistency checked:** `ContactSubmission` (Task 14) extends the same interface `lib/contact-store.ts` and `app/api/contacto/route.ts` already share — no new type introduced, no signature renamed. `Testimonial.photo?` (Task 13) is additive and optional, so every existing `testimonials.ts` entry and every existing test that constructs a `Testimonial` without a `photo` field stays valid. `FaqEntry` (Task 12) and `CATEGORY_LABELS`/`ProjectCategory` (Task 11) are new/reused types with no prior definition to conflict with. `withPageTransition` (Task 1) is consumed with its exact existing signature (`(navigate: () => void) => void`), not modified.
- **No placeholders in this plan's own tasks:** every task above has real, complete code — the only "TBD"-shaped items are Task 8 (category taxonomy, explicitly flagged as needing the client's decision rather than a code default) and the three `isPendingConfirmation` FAQ answers in Task 12 (explicitly and honestly marked as such in the data itself, mirroring the base build's own established pattern for unconfirmed business facts — this is the correct handling per this project's Global Constraints, not a plan gap).
