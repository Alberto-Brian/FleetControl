// ========================================
// FILE: src/helpers/fines-helpers.ts (CORRIGIDO)
// ========================================
import { ICreateFine, IUpdateFine, IFine, PayFineData } from "@/lib/types/fine";

export async function createFine(data: ICreateFine): Promise<IFine> {
    try {
        const result = await window._fines.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getAllFines(): Promise<any[]> {
    try {
        const result = await window._fines.getAll();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getFineById(id: string): Promise<IFine | null> {
    try {
        const result = await window._fines.getById(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateFine(id: string, data: IUpdateFine): Promise<IFine> {
    try {
        const result = await window._fines.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function markFineAsPaid(id: string, data: PayFineData): Promise<IFine> {
    try {
        const result = await window._fines.markAsPaid(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteFine(id: string): Promise<string> {
    try {
        const result = await window._fines.delete(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getPendingFines(): Promise<any[]> {
    try {
        const result = await window._fines.getPending();
        return result;
    } catch (error) {
        throw error;
    }
}

export function isOverdue(fine: { due_date?: string | null; status: string }): boolean {
  // CORREÇÃO: Contestada também não é vencida (está em análise)
  if (fine.status === 'paid' || fine.status === 'cancelled' || fine.status === 'contested' || !fine.due_date) {
    return false;
  }
  return new Date(fine.due_date) < new Date();
}

export function getDaysUntilDue(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDaysOverdue(dueDate: string): number {
  const diff = new Date().getTime() - new Date(dueDate).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}