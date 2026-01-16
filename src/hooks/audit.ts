import { audit_logs } from '@/lib/db/schemas';
import { dbManager, db } from '@/lib/db/db_client';
import { generateUuid } from '@/lib/utils/cripto';

interface AuditOptions {
  userId?: string;
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  previousData?: any;
  newData?: any;
}

export async function createAuditLog(options: AuditOptions) {
  const { userId, tableName, recordId, action, previousData, newData } = options;

  try {
    await db.insert(audit_logs).values({
      id: generateUuid(),
      user_id: userId,
      table_name: tableName,
      record_id: recordId,
      action,
      previous_data: previousData ? JSON.stringify(previousData) : null,
      new_data: newData ? JSON.stringify(newData) : null,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

