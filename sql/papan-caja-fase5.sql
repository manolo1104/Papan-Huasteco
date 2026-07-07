-- ============================================================
-- PANEL DE CAJA — FASE 5
-- Métodos de venta (transferencia y booking), personas por mesa,
-- datos de cobro (pago recibido, voucher, referencia), bitácora
-- de movimientos, config (PIN de cancelaciones) y suma atómica
-- de ventas al turno.
--
-- CÓMO CORRERLA: Supabase → SQL Editor → pegar TODO este archivo
-- → Run. Es idempotente (se puede correr dos veces sin romper).
-- ⚠ Correrla ANTES de desplegar el código de la fase 5.
-- ============================================================

-- ── caja_turnos: desglose de ventas nuevo ────────────────────
alter table public.caja_turnos
  add column if not exists ventas_transferencia numeric not null default 0,
  add column if not exists ventas_booking numeric not null default 0;

-- ── pos_ordenes: personas, datos de cobro y voucher ──────────
alter table public.pos_ordenes
  add column if not exists personas int,
  add column if not exists pago_recibido numeric,
  add column if not exists comprobante_url text,
  add column if not exists pago_referencia text; -- ej. habitación/huésped en booking

-- ── Bitácora de movimientos ──────────────────────────────────
create table if not exists public.caja_bitacora (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rol text not null,            -- admin | operador | mesero | cocina
  accion text not null,         -- cobrar | cancelar_orden | borrar_item_enviado | abrir_turno | cerrar_turno | gasto_creado | gasto_borrado | pin_cambiado | ...
  detalle text,                 -- texto legible ("Mesa 5 · 3 items · $525 efectivo")
  ref_tipo text,                -- orden | turno | gasto | config
  ref_id uuid,
  monto numeric
);
create index if not exists caja_bitacora_created_idx
  on public.caja_bitacora (created_at desc);
alter table public.caja_bitacora enable row level security;

-- ── Config simple (PIN de cancelaciones, hasheado) ───────────
create table if not exists public.caja_config (
  clave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);
alter table public.caja_config enable row level security;

-- ── Suma atómica de ventas al turno ──────────────────────────
-- Evita la condición de carrera de leer-modificar-escribir cuando
-- dos cajas cobran al mismo tiempo.
create or replace function public.sumar_venta_turno(p_turno uuid, p_forma text, p_monto numeric)
returns void language sql as $$
  update public.caja_turnos set
    ventas_efectivo      = ventas_efectivo      + case when p_forma = 'efectivo'      then p_monto else 0 end,
    ventas_tarjeta       = ventas_tarjeta       + case when p_forma = 'tarjeta'       then p_monto else 0 end,
    ventas_transferencia = ventas_transferencia + case when p_forma = 'transferencia' then p_monto else 0 end,
    ventas_booking       = ventas_booking       + case when p_forma = 'booking'       then p_monto else 0 end,
    total_ingresos       = total_ingresos + p_monto,
    updated_at           = now()
  where id = p_turno;
$$;

-- ── GOTCHA conocido del proyecto ─────────────────────────────
-- Con las llaves nuevas de Supabase, service_role necesita grants
-- explícitos sobre objetos nuevos.
grant all privileges on public.caja_bitacora to service_role;
grant all privileges on public.caja_config to service_role;
grant execute on function public.sumar_venta_turno to service_role;
