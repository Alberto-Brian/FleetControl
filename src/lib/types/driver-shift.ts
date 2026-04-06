// ========================================
// FILE: src/lib/types/driver-shift.ts
// ========================================
import { ShiftStatus } from '../db/schemas/driver_shifts';

// ─── Membro de turno (com dados do motorista via JOIN) ────────────────────────

export interface IShiftMember {
  id:          string;
  shift_id:    string;
  driver_id:   string;
  driver_name: string;
  is_leader:   boolean;
  notes:       string | null;
  created_at:  string;
  updated_at:  string;
}

// ─── Turno completo (com lista de membros) ────────────────────────────────────

export interface IDriverShift {
  id:           string;
  name:         string;
  description:  string | null;
  start_date:   string;    // YYYY-MM-DD
  end_date:     string;    // YYYY-MM-DD
  start_time:   string;    // HH:MM
  end_time:     string;    // HH:MM
  status:       ShiftStatus;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  deleted_at:   string | null;
  // Campos calculados via JOIN / agregação
  members:      IShiftMember[];
  member_count: number;
  leader_name:  string | null;  // nome do líder, se existir
}

// ─── Turno resumido (para listagens sem membros completos) ────────────────────

export interface IDriverShiftSummary {
  id:           string;
  name:         string;
  description:  string | null;
  start_date:   string;
  end_date:     string;
  start_time:   string;
  end_time:     string;
  status:       ShiftStatus;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  member_count: number;
  leader_name:  string | null;
}

// ─── Para criar um turno ──────────────────────────────────────────────────────

export interface ICreateDriverShift {
  name:        string;
  description?: string;
  start_date:  string;
  end_date:    string;
  start_time:  string;
  end_time:    string;
  status?:     ShiftStatus;
  notes?:      string;
  /** Membros a adicionar imediatamente ao criar (opcional) */
  members?:    ICreateShiftMember[];
}

export interface ICreateShiftMember {
  driver_id: string;
  is_leader: boolean;
  notes?:    string;
}

// ─── Para actualizar um turno ─────────────────────────────────────────────────

export type IUpdateDriverShift = Partial<Omit<ICreateDriverShift, 'members'>>;

// ─── Para adicionar/actualizar membros ────────────────────────────────────────

export interface IAddShiftMember {
  driver_id: string;
  is_leader?: boolean;
  notes?:     string;
}

export interface IUpdateShiftMember {
  is_leader?: boolean;
  notes?:     string;
}

// ─── Paginação e filtros ──────────────────────────────────────────────────────

export interface IDriverShiftsPaginationParams {
  page?:      number;
  limit?:     number;
  search?:    string;
  status?:    ShiftStatus | 'all';
  from_date?: string;
  to_date?:   string;
}

// ─── Resultado resumido para badge no card do motorista ──────────────────────
// Indica em que turno activo um motorista está inserido

export interface IDriverShiftBadge {
  shift_id:   string;
  shift_name: string;
  is_leader:  boolean;
  start_time: string;
  end_time:   string;
}