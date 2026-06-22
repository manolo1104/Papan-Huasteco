-- ============================================================
--  El Papán Huasteco · Panel de Caja — Migración FASE 4 (Supabase)
--  Catálogo editable de CONCEPTOS de gasto (para que en /gastos sea
--  lista desplegable y no se escriba distinto cada vez).
--  Pégalo en: Supabase -> SQL Editor -> New query -> Run  (una sola vez)
-- ============================================================

-- Conceptos de gasto editables (igual patrón que caja_categorias)
create table if not exists public.caja_conceptos (
  id          text primary key,            -- slug, ej. "compra_carne"
  label       text not null,
  orden       int  not null default 100,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Semilla con los conceptos más comunes de un restaurante
insert into public.caja_conceptos (id, label, orden) values
  ('compra_carne',      'Compra de carne',                 10),
  ('compra_abarrotes',  'Abarrotes / Despensa',            20),
  ('compra_verdura',    'Frutas y verduras',               30),
  ('tortillas',         'Tortillas',                       40),
  ('refrescos_bebidas', 'Refrescos y bebidas',             50),
  ('gas',               'Gas',                             60),
  ('luz',               'Luz (CFE)',                       70),
  ('agua',              'Agua',                            80),
  ('internet_telefono', 'Internet / Teléfono',             90),
  ('sueldos',           'Sueldos / Raya',                 100),
  ('renta',             'Renta',                          110),
  ('limpieza',          'Limpieza',                       120),
  ('mantenimiento',     'Mantenimiento',                  130),
  ('publicidad',        'Publicidad',                     140),
  ('otros',             'Otro gasto',                     150)
on conflict (id) do nothing;

create index if not exists caja_conceptos_orden_idx on public.caja_conceptos (orden);

-- RLS + permisos para el rol del servidor (igual que en fases anteriores)
alter table public.caja_conceptos enable row level security;
grant all privileges on public.caja_conceptos to service_role;

-- Listo. Ya puedes administrar los conceptos en /admin/ajustes y elegirlos
-- como lista desplegable al registrar un gasto en /admin/gastos.
