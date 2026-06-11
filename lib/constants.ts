export const CATEGORIAS_PARTICIPANTE = [
  "Participante",
  "Acompanhante",
  "Dependente",
  "Expositor",
  "Patrocinador",
  "Apoio",
  "Organizador",
  "Prestador de Serviços",
  "Imprensa",
  "Palestrante",
  "Moderador",
  "Convidado",
] as const;

export type CategoriaParticipante = (typeof CATEGORIAS_PARTICIPANTE)[number];

export const PAPEIS_PALESTRANTE = [
  "Palestrante",
  "Moderador",
  "Convidado",
] as const;

export type PapelPalestrante = (typeof PAPEIS_PALESTRANTE)[number];

export const PAPEIS_ADMIN = [
  "Administrador",
  "Super Administrador",
] as const;

export type PapelAdmin = (typeof PAPEIS_ADMIN)[number];

export const STATUS_INSCRICAO = [
  "Pendente",
  "Confirmado",
  "Cancelado",
] as const;

export type StatusInscricao = (typeof STATUS_INSCRICAO)[number];
