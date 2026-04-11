export const SKIN_COLORS = [
  'branca',
  'negra',
  'morena',
  'parda',
  'amarela',
  'indigena',
] as const;
export type SkinColor = (typeof SKIN_COLORS)[number];

export const HAIR_COLORS = [
  'loira',
  'ruiva',
  'preta',
  'castanha',
  'vermelha',
  'colorida',
] as const;
export type HairColor = (typeof HAIR_COLORS)[number];

export const EYE_COLORS = [
  'azul',
  'verde',
  'castanho',
  'preto',
  'mel',
] as const;
export type EyeColor = (typeof EYE_COLORS)[number];

export const BODY_TYPES = [
  'magra',
  'fitness',
  'plus',
  'curvilinea',
  'atletica',
] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const ETHNICITIES = [
  'latina',
  'brasileira',
  'afro',
  'europeia',
  'asiatica',
  'indigena',
  'arabe',
  'outra',
] as const;
export type Ethnicity = (typeof ETHNICITIES)[number];

export const PROFILE_CATEGORIES = {
  skinColor: [...SKIN_COLORS],
  hairColor: [...HAIR_COLORS],
  eyeColor: [...EYE_COLORS],
  bodyType: [...BODY_TYPES],
  ethnicity: [...ETHNICITIES],
};
