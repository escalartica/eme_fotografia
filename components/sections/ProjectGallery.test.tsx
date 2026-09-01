import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectGallery } from './ProjectGallery';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('ProjectGallery', () => {
  it('renders an image for each image gallery item', () => {
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
});
