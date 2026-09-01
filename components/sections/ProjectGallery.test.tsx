import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectGallery } from './ProjectGallery';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('ProjectGallery', () => {
  it('renders an image for each image gallery item (none dropped in the editorial-flow restructure)', () => {
    const project = projects.find((p) => p.slug === 'raquel-y-fran')!;
    render(<ProjectGallery project={project} />);
    expect(screen.getAllByRole('img').length).toBe(project.gallery.length);
  });

  it('renders a VideoPreview for video gallery items and opens the lightbox on click', () => {
    // boda-real-01 has a video cover (rendered by ProjectGallery itself,
    // see the component) plus two video gallery items (the ground-level
    // edit and the aerial highlight), so there are three "Reproducir"
    // buttons total sharing one Lightbox — assert the count reflects
    // cover + gallery videos, and that clicking a gallery one opens it.
    const project = projects.find((p) => p.slug === 'boda-real-01')!;
    render(<ProjectGallery project={project} />);
    const playButtons = screen.getAllByRole('button', { name: /reproducir/i });
    const videoGalleryCount = project.gallery.filter((m) => m.type === 'video').length;
    expect(playButtons).toHaveLength(1 + videoGalleryCount);
    fireEvent.click(playButtons[1]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the video cover and opens the same shared lightbox on click', () => {
    const project = projects.find((p) => p.slug === 'boda-real-01')!;
    if (project.cover.type !== 'video') throw new Error('fixture assumption: boda-real-01 has a video cover');
    render(<ProjectGallery project={project} />);
    const playButtons = screen.getAllByRole('button', { name: /reproducir/i });
    fireEvent.click(playButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the shared lightbox with the clicked image when an image gallery item is clicked (mouse)', () => {
    const project = projects.find((p) => p.slug === 'raquel-y-fran')!;
    render(<ProjectGallery project={project} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const secondImageButton = screen.getAllByRole('button', { name: /ver .* en tamaño completo/i })[1];
    fireEvent.click(secondImageButton);
    const dialog = screen.getByRole('dialog');
    const target = project.gallery[1];
    if (target.type !== 'image') throw new Error('fixture assumption: raquel-y-fran gallery[1] is an image');
    const dialogImg = Array.from(dialog.querySelectorAll('img')).find((img) =>
      img.getAttribute('src')?.includes(encodeURIComponent(target.src))
    );
    expect(dialogImg).toBeDefined();
  });

  it('opens the shared lightbox with an image gallery item via keyboard (Enter on the focused thumbnail button)', async () => {
    const user = userEvent.setup();
    const project = projects.find((p) => p.slug === 'raquel-y-fran')!;
    render(<ProjectGallery project={project} />);
    const firstImageButton = screen.getAllByRole('button', { name: /ver .* en tamaño completo/i })[0];
    firstImageButton.focus();
    expect(firstImageButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it("assigns a genuinely varying 'span' width class across gallery items rather than a single rigid width", () => {
    // raquel-y-fran has 3 gallery items, none with a curated `span` value in
    // content/projects.ts, so this exercises the deterministic full/wide/half
    // fallback cycle — real assertion that the rendered wrapper's data-span
    // (and thus its width-driving CSS class) actually differs per item, not
    // just a cosmetic attribute that maps to identical CSS.
    const project = projects.find((p) => p.slug === 'raquel-y-fran')!;
    const { container } = render(<ProjectGallery project={project} />);
    const items = Array.from(container.querySelectorAll('[data-span]'));
    expect(items).toHaveLength(project.gallery.length);
    const spans = items.map((el) => el.getAttribute('data-span'));
    // Not every item has the same span (genuine variety, not one rigid width).
    expect(new Set(spans).size).toBeGreaterThan(1);
    // Every value is one of the three real enum values.
    spans.forEach((s) => expect(['full', 'wide', 'half']).toContain(s));
  });

  it('marks only the first two image gallery items as priority (eager-loaded), regardless of interleaved video items', () => {
    // boda-real-01's gallery starts with two videos before any images
    // (video, video, image, image, image, image) — "first two images"
    // must count image-type items only, skipping the leading videos, so
    // this is a real regression guard against an index-only off-by-type bug.
    const project = projects.find((p) => p.slug === 'boda-real-01')!;
    render(<ProjectGallery project={project} />);
    const imgs = screen.getAllByRole('img');
    const imageItems = project.gallery.filter((m) => m.type === 'image');
    expect(imgs.length).toBe(imageItems.length);
    imgs.forEach((img, i) => {
      if (i < 2) {
        expect(img.getAttribute('loading')).not.toBe('lazy');
      } else {
        expect(img.getAttribute('loading')).toBe('lazy');
      }
    });
  });
});
