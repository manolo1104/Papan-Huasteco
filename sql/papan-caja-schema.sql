-- ============================================================
--  El Papán Huasteco · Panel de Caja y Finanzas — Base de datos (Supabase)
--  Pega TODO esto en: Supabase -> tu proyecto -> SQL Editor -> New query -> Run
--  (Las 3 tablas tienen RLS SIN políticas públicas: solo se acceden desde el
--   servidor del sitio con la SUPABASE_SERVICE_ROLE_KEY. Nadie más las ve.)
-- ============================================================

-- 1) Turnos / cortes de caja (uno por turno trabajado)
create table if not exists public.caja_turnos (
  id                  uuid primary key default gen_random_uuid(),
  fecha               date not null default current_date,
  turno               text not null,                    -- matutino / vespertino / completo
  responsable         text,                             -- quién hizo el corte
  estado              text not null default 'abierto'
                        check (estado in ('abierto','cerrado')),
  fondo_inicial       numeric not null default 0,       -- efectivo con que abre la caja
  ventas_efectivo     numeric not null default 0,
  ventas_tarjeta      numeric not null default 0,
  otros_ingresos      numeric not null default 0,       -- ingresos misceláneos (efectivo)
  otros_ingresos_nota text,
  retiros             numeric not null default 0,       -- efectivo retirado / depositado
  efectivo_esperado   numeric not null default 0,       -- calculado al cerrar
  efectivo_contado    numeric not null default 0,       -- lo contado físicamente
  diferencia          numeric not null default 0,       -- contado - esperado (negativo = faltante)
  total_ingresos      numeric not null default 0,       -- efectivo + tarjeta + otros
  notas               text,
  created_by          text,                             -- rol que lo registró
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 2) Gastos / egresos del día o turno
create table if not exists public.caja_gastos (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null default current_date,
  turno_id    uuid references public.caja_turnos(id) on delete set null,
  categoria   text not null default 'otros',
  concepto    text not null,
  monto       numeric not null default 0,
  forma_pago  text not null default 'efectivo'
                check (forma_pago in ('efectivo','tarjeta','transferencia')),
  proveedor   text,
  nota        text,
  created_by  text,
  created_at  timestamptz not null default now()
);

-- 3) Eventos / grupos
create table if not exists public.eventos (
  id              uuid primary key default gen_random_uuid(),
  cliente_nombre  text not null,
  contacto        text,
  fecha           date,
  num_personas    integer,
  total_acordado  numeric not null default 0,
  pagado          numeric not null default 0,          -- suma de abonos recibidos
  estado          text not null default 'cotizado'
                    check (estado in ('cotizado','confirmado','realizado','pagado','cancelado')),
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 4) Índices útiles
create index if not exists caja_turnos_fecha_idx  on public.caja_turnos (fecha);
create index if not exists caja_turnos_estado_idx on public.caja_turnos (estado);
create index if not exists caja_gastos_fecha_idx  on public.caja_gastos (fecha);
create index if not exists caja_gastos_turno_idx  on public.caja_gastos (turno_id);
create index if not exists eventos_fecha_idx      on public.eventos (fecha);

-- 5) updated_at automático
create or replace function public.caja_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists caja_turnos_touch on public.caja_turnos;
create trigger caja_turnos_touch
  before update on public.caja_turnos
  for each row execute function public.caja_touch_updated_at();

drop trigger if exists eventos_touch on public.eventos;
create trigger eventos_touch
  before update on public.eventos
  for each row execute function public.caja_touch_updated_at();

-- 6) RLS ON, SIN políticas -> solo el servidor (service-role) lee/escribe.
alter table public.caja_turnos enable row level security;
alter table public.caja_gastos enable row level security;
alter table public.eventos     enable row level security;

-- 7) Permisos para el rol del servidor (la llave secreta = service_role).
--    Solo este rol tiene acceso; anon/authenticated siguen bloqueados por RLS.
grant all privileges on public.caja_turnos to service_role;
grant all privileges on public.caja_gastos to service_role;
grant all privileges on public.eventos     to service_role;

-- Listo. El panel /admin ya puede usar estas tablas con SUPABASE_SERVICE_ROLE_KEY.
