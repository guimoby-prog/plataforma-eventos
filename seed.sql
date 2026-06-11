-- Evento de teste
INSERT INTO "Event" (id, name, description, "startDate", "endDate", location, "isPublished", "createdAt", "updatedAt")
VALUES (
  'evento-teste-001',
  'Congresso de Exemplo 2026',
  'O maior evento do setor, reunindo líderes, especialistas e profissionais.',
  '2026-08-15 08:00:00',
  '2026-08-17 18:00:00',
  'Centro de Convenções — São Paulo, SP',
  true,
  NOW(),
  NOW()
);
