// src/lib/db/queries/clients_queries.ts
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { clients } from '@/lib/db/schemas/clients';
import { generateUuid } from '@/lib/utils/cripto';
import { eq } from 'drizzle-orm';

export interface ICreateClient {
    name: string;
    email: string;
}

export async function createClient(clientData: ICreateClient) {
    const id = generateUuid();
    await checkAndRotate();
    const { db } = useDb();
    const result = await db
        .insert(clients)
        .values([
            {
                id: id,
                name: clientData.name,
                email: clientData.email,
            },
        ])
        .returning({
            id: clients.id,
            name: clients.name,
            email: clients.email,
        });

    return result[0];
}

export async function getAllClients() {
    const { db } = useDb();
    const result = await db.query.clients.findMany({
        columns: {
            id: true,
            name: true,
            email: true,
        },
    });

    return result;
}

export async function deleteClient(clientId: string) {
    const { db } = useDb();
    await db.delete(clients).where(eq(clients.id, clientId));

    return clientId;
}
