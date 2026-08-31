export const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;
