import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Enum para status do bloco
export const blockStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
    FULL: 'full',
} as const;

export type BlockStatus = typeof blockStatus[keyof typeof blockStatus];

export const blocks = sqliteTable('blocks', {
    // Identificação
    id: text('id').primaryKey(),
    name: text('name').notNull(), // Bloco A, Bloco B, etc
    letter: text('letter').notNull().unique(), // A, B, C, D, E
    description: text('description'), // Peças de moto, Diversos e Brincos
    
    // Controle de espaços
    totalSpaces: integer('total_spaces').notNull().default(0),
    occupiedSpaces: integer('occupied_spaces').notNull().default(0),
    availableSpaces: integer('available_spaces').notNull().default(0), // Campo calculado para otimização
    
    // Status
    status: text('status', { enum: [
        blockStatus.ACTIVE,
        blockStatus.INACTIVE,
        blockStatus.MAINTENANCE,
        blockStatus.FULL,
    ] }).notNull().default(blockStatus.ACTIVE),
    
    // Auditoria - Criação
    createdAt: text('created_at')
        .notNull()
        .default(sql`(datetime('now', 'localtime'))`),
    createdBy: text('created_by'), // ID do usuário que criou
    
    // Auditoria - Atualização
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`(datetime('now', 'localtime'))`),
    updatedBy: text('updated_by'), // ID do usuário que atualizou
    
    // Auditoria - Soft Delete
    deletedAt: text('deleted_at'), // NULL = ativo, data = deletado
    deletedBy: text('deleted_by'), // ID do usuário que deletou
    
    // Metadados adicionais (opcional)
    metadata: text('metadata'), // JSON com informações extras
    notes: text('notes'), // Notas internas sobre o bloco
});

// Tipo inferido do schema
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;

// Funções helper para trabalhar com o schema
export const blockHelpers = {
    // Verifica se o bloco está ativo (não deletado)
    isActive: (block: Block): boolean => {
        return block.deletedAt === null && block.status === blockStatus.ACTIVE;
    },
    
    // Verifica se o bloco está cheio
    isFull: (block: Block): boolean => {
        return block.occupiedSpaces >= block.totalSpaces;
    },
    
    // Calcula percentual de ocupação
    getOccupancyRate: (block: Block): number => {
        if (block.totalSpaces === 0) return 0;
        return (block.occupiedSpaces / block.totalSpaces) * 100;
    },
    
    // Retorna os espaços disponíveis
    getAvailableSpaces: (block: Block): number => {
        return Math.max(0, block.totalSpaces - block.occupiedSpaces);
    },
};

// Exemplo de query para listar apenas blocos ativos
export const getActiveBlocksQuery = {
    where: (blocks: any) => sql`${blocks.deletedAt} IS NULL AND ${blocks.status} = ${blockStatus.ACTIVE}`,
};