-- ============================================================
--  El Papán Huasteco · Panel de Caja — Migración FASE 3 (Supabase)
--  POS de mesas + Pantalla de cocina + Inventario y costeo de recetas.
--  Pégalo en: Supabase -> SQL Editor -> New query -> Run  (una sola vez)
-- ============================================================

-- 1) Productos (el menú dentro del sistema). Se llena con "Importar menú".
create table if not exists public.pos_productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  categoria   text not null default 'otros',
  precio      numeric not null default 0,
  disponible  boolean not null default true,
  orden       int not null default 100,
  created_at  timestamptz not null default now()
);
-- nombre único para poder reimportar el menú sin duplicar
create unique index if not exists pos_productos_nombre_idx on public.pos_productos (lower(nombre));

-- 2) Mesas (numeradas + "Para llevar"); editables en Ajustes.
create table if not exists public.pos_mesas (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null,
  orden   int not null default 100,
  activa  boolean not null default true
);
insert into public.pos_mesas (nombre, orden)
select 'Mesa ' || g, g from generate_series(1, 12) as g
where not exists (select 1 from public.pos_mesas);
insert into public.pos_mesas (nombre, orden)
select 'Para llevar', 999
where not exists (select 1 from public.pos_mesas where nombre = 'Para llevar');

-- 3) Órdenes (una cuenta por mesa)
create table if not exists public.pos_ordenes (
  id          uuid primary key default gen_random_uuid(),
  mesa_nombre text not null,
  estado      text not null default 'abierta'
                check (estado in ('abierta','cobrada','cancelada')),
  turno_id    uuid references public.caja_turnos(id) on delete set null,
  forma_pago  text,
  total       numeric not null default 0,
  mesero      text,
  notas       text,
  created_at  timestamptz not null default now(),
  cobrada_at  timestamptz
);
create index if not exists pos_ordenes_estado_idx on public.pos_ordenes (estado);

-- 4) Renglones de la orden
create table if not exists public.pos_orden_items (
  id             uuid primary key default gen_random_uuid(),
  orden_id       uuid not null references public.pos_ordenes(id) on delete cascade,
  producto_id    uuid references public.pos_productos(id) on delete set null,
  nombre         text not null,
  precio_unit    numeric not null default 0,
  cantidad       numeric not null default 1,
  nota           text,
  enviado_cocina boolean not null default false,
  estado         text not null default 'pendiente'
                   check (estado in ('pendiente','listo')),
  created_at     timestamptz not null default now()
);
create index if not exists pos_items_orden_idx on public.pos_orden_items (orden_id);
create index if not exists pos_items_cocina_idx on public.pos_orden_items (enviado_cocina, estado);

-- 5) Insumos (inventario)
create table if not exists public.pos_insumos (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  unidad         text not null default 'pza',     -- kg, lt, pza, etc.
  costo_unitario numeric not null default 0,
  stock_actual   numeric not null default 0,
  stock_minimo   numeric not null default 0,
  created_at     timestamptz not null default now()
);

-- 6) Recetas (qué insumos lleva cada platillo)
create table if not exists public.pos_recetas (
  producto_id uuid not null references public.pos_productos(id) on delete cascade,
  insumo_id   uuid not null references public.pos_insumos(id) on delete cascade,
  cantidad    numeric not null default 0,
  primary key (producto_id, insumo_id)
);

-- 7) RLS + permisos del rol del servidor (gotcha de las llaves nuevas)
alter table public.pos_productos   enable row level security;
alter table public.pos_mesas       enable row level security;
alter table public.pos_ordenes     enable row level security;
alter table public.pos_orden_items enable row level security;
alter table public.pos_insumos     enable row level security;
alter table public.pos_recetas     enable row level security;
grant all privileges on public.pos_productos   to service_role;
grant all privileges on public.pos_mesas       to service_role;
grant all privileges on public.pos_ordenes     to service_role;
grant all privileges on public.pos_orden_items to service_role;
grant all privileges on public.pos_insumos     to service_role;
grant all privileges on public.pos_recetas     to service_role;

-- Listo. Entra a /admin/productos y pulsa "Importar menú" para cargar los platillos.
