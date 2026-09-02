// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/powersync/schema.ts
// ========================================
//
// Fase 12, Prompt 22.8 — schema local (SQLite, PowerSync-managed) espelhando
// os 7 streams definidos em fleetcontrol-infrastructure/docker/powersync/
// sync-config.yaml (Prompt 22.6), por sua vez espelhando as colunas reais dos
// 7 schemas Drizzle em fleetcontrol-api/src/db/schemas/ (vehicles, drivers,
// trips, fuel, maintenances, expenses, categories) — lidos directamente nesta
// sessão para garantir paridade coluna-a-coluna, não assumidos de memória.
//
// Regras do SDK (ver .claude/skills/powersync/references/sdks/powersync-js.md):
// - Nunca declarar 'id' — o PowerSync cria-o automaticamente como TEXT PRIMARY KEY.
// - Só column.text/column.integer/column.real — sem boolean/date nativos:
//   booleans (is_active, tracking_enabled) ficam 0/1 (column.integer);
//   timestamps (created_at, updated_at, deleted_at, *_date) ficam ISO string
//   (column.text), tal como já é o caso das colunas `text('...')` de data no
//   próprio schema Drizzle do lado do servidor (ex. start_date, entry_date).
//
// Achado durante o primeiro arranque real da app após o Prompt 22.8 (ver
// nota em client.ts) — @powersync/node é um pacote ESM-only ("type":
// "module", exports só com condições import/module-sync, sem require), mas
// o processo principal deste Electron continua a compilar para CJS
// (vite.main.config.ts, formats:['cjs']) e externaliza todas as
// `dependencies` (vite.base.config.ts). Um `import` estático aqui vira um
// `require('@powersync/node')` no bundle final, que rebenta com
// ERR_PACKAGE_PATH_NOT_EXPORTED. `column`/`Schema`/`Table` só podem ser
// obtidos via `import()` dinâmico (suportado nativamente pelo Node/Electron
// mesmo a partir de um módulo CJS) — por isso este ficheiro deixou de
// exportar uma `AppSchema` construída no carregamento do módulo, passa a
// expor `loadAppSchema()`, chamada uma única vez por client.ts.
export async function loadAppSchema() {
  const { column, Schema, Table } = await import('@powersync/node');

  const vehicles = new Table({
    organization_id:    column.text,
    category_id:         column.text,
    traccar_device_id:   column.text,
    traccar_unique_id:   column.text,
    license_plate:       column.text,
    brand:               column.text,
    model:               column.text,
    year:                column.integer,
    color:               column.text,
    chassis_number:      column.text,
    engine_number:       column.text,
    fuel_tank_capacity:  column.integer,
    tire_size:           column.text,
    current_mileage:     column.integer,
    acquisition_date:    column.text,
    acquisition_value:   column.integer,
    status:              column.text,
    notes:               column.text,
    photo:               column.text,
    is_active:           column.integer,
    tracking_enabled:    column.integer,
    created_at:          column.text,
    created_by:          column.text,
    updated_at:          column.text,
    updated_by:          column.text,
    deleted_at:          column.text,
    deleted_by:          column.text,
  });

  const drivers = new Table({
    organization_id:     column.text,
    name:                column.text,
    tax_id:              column.text,
    id_number:           column.text,
    birth_date:          column.text,
    phone:               column.text,
    email:               column.text,
    address:             column.text,
    city:                column.text,
    state:               column.text,
    postal_code:         column.text,
    license_number:      column.text,
    license_category:    column.text,
    license_expiry_date: column.text,
    hire_date:           column.text,
    status:              column.text,
    availability:        column.text,
    photo:               column.text,
    notes:               column.text,
    is_active:           column.integer,
    created_at:          column.text,
    created_by:          column.text,
    updated_at:          column.text,
    updated_by:          column.text,
    deleted_at:          column.text,
    deleted_by:          column.text,
  });

  const trips = new Table(
    {
      organization_id: column.text,
      vehicle_id:      column.text,
      driver_id:       column.text,
      origin:          column.text,
      destination:     column.text,
      start_date:      column.text,
      end_date:        column.text,
      start_mileage:   column.integer,
      end_mileage:     column.integer,
      purpose:         column.text,
      status:          column.text,
      notes:           column.text,
      created_at:      column.text,
      created_by:      column.text,
      updated_at:      column.text,
      updated_by:      column.text,
      deleted_at:      column.text,
      deleted_by:      column.text,
    },
    { indexes: { vehicle: ['vehicle_id'] } },
  );

  const fuel = new Table(
    {
      organization_id: column.text,
      vehicle_id:      column.text,
      refueling_date:  column.text,
      liters:          column.real,
      price_per_liter: column.real,
      total_cost:      column.real,
      mileage:         column.integer,
      station:         column.text,
      receipt_photo:   column.text,
      notes:           column.text,
      created_at:      column.text,
      created_by:      column.text,
      updated_at:      column.text,
      updated_by:      column.text,
      deleted_at:      column.text,
      deleted_by:      column.text,
    },
    { indexes: { vehicle: ['vehicle_id'] } },
  );

  const maintenance = new Table(
    {
      organization_id: column.text,
      vehicle_id:      column.text,
      entry_date:      column.text,
      exit_date:       column.text,
      type:            column.text,
      description:     column.text,
      workshop:        column.text,
      labor_cost:      column.real,
      parts_cost:      column.real,
      total_cost:      column.real,
      mileage:         column.integer,
      status:          column.text,
      notes:           column.text,
      created_at:      column.text,
      created_by:      column.text,
      updated_at:      column.text,
      updated_by:      column.text,
      deleted_at:      column.text,
      deleted_by:      column.text,
    },
    { indexes: { vehicle: ['vehicle_id'] } },
  );

  const expenses = new Table(
    {
      organization_id: column.text,
      vehicle_id:      column.text,
      category_id:     column.text,
      expense_date:    column.text,
      description:     column.text,
      amount:          column.real,
      receipt:         column.text,
      status:          column.text,
      notes:           column.text,
      created_at:      column.text,
      created_by:      column.text,
      updated_at:      column.text,
      updated_by:      column.text,
      deleted_at:      column.text,
      deleted_by:      column.text,
    },
    { indexes: { vehicle: ['vehicle_id'] } },
  );

  const categories = new Table({
    organization_id: column.text,
    name:            column.text,
    description:     column.text,
    type:            column.text,
    color:           column.text,
    icon:            column.text,
    is_active:       column.integer,
    created_at:      column.text,
    created_by:      column.text,
    updated_at:      column.text,
    updated_by:      column.text,
    deleted_at:      column.text,
    deleted_by:      column.text,
  });

  return new Schema({
    vehicles,
    drivers,
    trips,
    fuel,
    maintenance,
    expenses,
    categories,
  });
}

export type Database = Awaited<ReturnType<typeof loadAppSchema>>['types'];
