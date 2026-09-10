import type { CSSProperties } from 'react';
import styles from './ScrollReveal.module.css';

/**
 * A single, cheap reveal for a block as it scrolls into view.
 *
 * This used to be a client component that imported GSAP and ScrollTrigger
 * and, on mount, set its own children to `opacity: 0`. It is used in 17
 * files and well over a hundred places, so that one decision put GSAP on
 * every route, ran a ScrollTrigger per instance on the main thread, and
 * made "is the copy visible?" depend on JavaScript finishing. It is now a
 * Server Component with no JavaScript at all: the whole reveal is a CSS
 * scroll-driven animation (see ScrollReveal.module.css), which the
 * compositor runs, and the content is visible at rest.
 *
 * The prop shape is unchanged so no caller had to be rewritten.
 */
export function ScrollReveal({
  children,
  className,
  blur,
  delay = 0,
  clipReveal,
  duration,
}: {
  children: React.ReactNode;
  className?: string;
  /** Adds a soft focus-in. Use on type, not on photographs: blurring a
   *  full-bleed image is real GPU work for an effect nobody notices. */
  blur?: boolean;
  /**
   * Sequences one item after its siblings. On a scroll-driven timeline
   * there is no clock to delay against -- progress is the scroll position
   * -- so this shifts the element's own animation range further down
   * instead, which is what produces a visible stagger in a group.
   */
  delay?: number;
  /** Curtain wipe from the bottom edge up, for photographs. */
  clipReveal?: boolean;
  /** Longer reveal, for an establishing shot that wants to hold a beat. */
  duration?: number;
}) {
  const classes = [
    styles.reveal,
    blur ? styles.blur : '',
    clipReveal ? styles.clip : '',
    duration && duration > 1.1 ? styles.slow : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // 0.05s of the old GSAP delay reads as roughly 4% of the entry range.
  const style = delay ? ({ ['--reveal-offset' as string]: `${Math.min(delay * 80, 24)}%` } as CSSProperties) : undefined;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
