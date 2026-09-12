export const CEREMONY_OBJECTS = [
  'people',
  'innovation',
  'intelligence',
  'collaboration',
  'learning',
  'vision',
  'technology',
  'future',
] as const;

export type CeremonyObject = (typeof CEREMONY_OBJECTS)[number];

export type CeremonyObjectStatus = 'pending' | 'active' | 'completed';

export type CeremonyState = Record<CeremonyObject, CeremonyObjectStatus>;
