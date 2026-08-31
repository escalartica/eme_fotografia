import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectGallery } from './ProjectGallery';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('ProjectGallery', () => {
  it('renders an image for each image gallery item', () => {
    const project = projects.find((p) => p.slug === 'clara-y-manuel')!;
    render(<ProjectGallery project={project} />);
    expect(screen.getAllByRole('img').length).toBe(project.gallery.length);
  });

  it('renders a VideoPreview for video gallery items and opens the lightbox on click', () => {
    const project = projects.find((p) => p.slug === 'boda-elena-y-pablo-video')!;
    render(<ProjectGallery project={project} />);
    const videoItem = project.gallery.find((m) => m.type === 'video')!;
    fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
