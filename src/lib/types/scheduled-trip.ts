// ========================================
// FILE: src/lib/types/scheduled-trip.ts
// ========================================
import { ScheduledTripStatus } from '../db/schemas/scheduled_trips';

export interface IScheduledTrip {
  id:             string;
  driver_id:      string;
  driver_name?:   string;   // via JOIN
  vehicle_id:     string;
  vehicle_plate?: string;   // via JOIN
  vehicle_brand?: string;   // via JOIN
  vehicle_model?: string;   // via JOIN
  route_id?:      string | null;
  route_name?:    string | null;  // via JOIN
  scheduled_date: string;         // YYYY-MM-DD
  origin?:        string | null;
  destination?:   string | null;
  purpose?:       string | null;
  notes?:         string | null;
  status:         ScheduledTripStatus;
  trip_id?:       string | null;  // preenchido quando lançada
  launched_at?:   string | null;
  cancelled_at?:  string | null;
  cancelled_reason?: string | null;
  created_at:     string;
  updated_at:     string;
}

export interface ICreateScheduledTrip {
  driver_id:      string;
  vehicle_id:     string;
  route_id?:      string;
  scheduled_date: string;
  origin?:        string;
  destination?:   string;
  purpose?:       string;
  notes?:         string;
}

export interface IUpdateScheduledTrip {
  vehicle_id?:     string;
  route_id?:       string;
  scheduled_date?: string;
  origin?:         string;
  destination?:    string;
  purpose?:        string;
  notes?:          string;
}

export interface ICancelScheduledTrip {
  cancelled_reason?: string;
}

export interface IScheduledTripsPaginationParams {
  page?:      number;
  limit?:     number;
  search?:    string;
  status?:    ScheduledTripStatus | 'all';
  driver_id?: string;
  vehicle_id?: string;
  from_date?: string;
  to_date?:   string;
}