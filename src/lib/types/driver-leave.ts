// ========================================
// FILE: src/lib/types/driver-leave.ts
// ========================================
import { LeaveStatus } from '@/lib/db/schemas/driver_leaves';

export interface IDriverLeave {
  id:               string;
  driver_id:        string;
  driver_name?:     string;   // via JOIN
  start_date:       string;   // YYYY-MM-DD
  end_date:         string;   // YYYY-MM-DD
  reason:           string | null;
  notes:            string | null;
  status:           LeaveStatus;
  cancelled_at:     string | null;
  cancelled_reason: string | null;
  created_at:       string;
  updated_at:       string;
  deleted_at?:      string | null;
}

export interface ICreateDriverLeave {
  driver_id:  string;
  start_date: string;
  end_date:   string;
  reason?:    string;
  notes?:     string;
}

export interface IUpdateDriverLeave {
  start_date?: string;
  end_date?:   string;
  reason?:     string;
  notes?:      string;
}

export interface ICancelDriverLeave {
  cancelled_reason?: string;
}

export interface IDriverLeavesPaginationParams {
  page?:      number;
  limit?:     number;
  search?:    string;       // busca por nome do driver
  status?:    LeaveStatus | 'all';
  driver_id?: string;       // filtrar por driver
  from_date?: string;       // filtrar por intervalo de datas
  to_date?:   string;
}