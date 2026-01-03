import { Client } from "@/lib/types/client";

interface CreateClient {
    name: string;
    email: string;
}

export async function createClient(clientInfo: CreateClient) {
    try {
        const result = await window._clients.createClient(clientInfo);
        return result as Client;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getAllClients(): Promise<Client[]> {
    const result = await window._clients.getAllClients();

    return result as Client[];
}

export async function deleteClient(clientId: string) {
    const result = await window._clients.deleteClient(clientId);

    return result as string;
}