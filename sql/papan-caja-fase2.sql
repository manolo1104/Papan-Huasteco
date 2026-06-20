-- ============================================================
--  El Papán Huasteco · Panel de Caja — Migración FASE 2 (Supabase)
--  Pégalo en: Supabase -> SQL Editor -> New query -> Run  (una sola vez)
-- ============================================================

-- 1) Categorías de gasto editables (antes estaban fijas en el código)
create table if not exists public.caja_categorias (
  id          text primary key,            -- slug, ej. "insumos_proveedores"
  label       text not null,
  orden       int  not null default 100,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.caja_categorias (id, label, orden) values
  ('insumos_proveedores', 'Insumos / Proveedores', 10),
  ('nomina',              'Nómina / Personal', 20),
  ('servicios',           'Servicios (luz, gas, agua, internet)', 30),
  ('renta',               'Renta', 40),
  ('mantenimiento',       'Mantenimiento / Limpieza', 50),
  ('otros',               'Otros', 60)
on conflict (id) do nothing;

-- 2) Meta de ventas por mes
create table if not exists public.caja_metas (
  mes          text primary key,           -- 'YYYY-MM'
  meta_ventas  numeric not null default 0,
  updated_at   timestamptz not null default now()
);

-- 3) Foto del ticket/comprobante en cada gasto
alter table public.caja_gastos add column if not exists comprobante_url text;

-- 4) Bucket de almacenamiento para las fotos de tickets (público = visibles por URL)
insert into storage.buckets (id, name, public)
  values ('tickets', 'tickets', true)
  on conflict (id) do nothing;

-- 5) Índices
create index if not exists caja_categorias_orden_idx on public.caja_categorias (orden);

-- 6) updated_at automático en metas (reusa la función creada en Fase 1)
drop trigger if exists caja_metas_touch on public.caja_metas;
create trigger caja_metas_touch
  before update on public.caja_metas
  for each row execute function public.caja_touch_updated_at();

-- 7) RLS + permisos para el rol del servidor (igual que en Fase 1)
alter table public.caja_categorias enable row level security;
alter table public.caja_metas      enable row level security;
grant all privileges on public.caja_categorias to service_role;
grant all privileges on public.caja_metas      to service_role;

-- Listo. Ya puedes editar categorías, fijar metas y subir fotos de tickets.
