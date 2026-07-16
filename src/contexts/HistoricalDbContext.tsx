import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getHistoricalDb, setHistoricalDb as ipcSetHistoricalDb } from '@/helpers/system-helpers';

interface HistoricalDbCtx {
    historicalDbPath: string | null;
    historicalDbName: string | null;
    activate:   (filepath: string) => Promise<void>;
    deactivate: () => Promise<void>;
}

const Ctx = createContext<HistoricalDbCtx | null>(null);

export function HistoricalDbProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = useState<string | null>(null);

    useEffect(() => {
        getHistoricalDb().then(setPath).catch(() => {});
    }, []);

    const activate = useCallback(async (filepath: string) => {
        await ipcSetHistoricalDb(filepath);
        setPath(filepath);
    }, []);

    const deactivate = useCallback(async () => {
        await ipcSetHistoricalDb(null);
        setPath(null);
    }, []);

    const name = path ? (path.split(/[\\/]/).pop() ?? path) : null;

    return (
        <Ctx.Provider value={{ historicalDbPath: path, historicalDbName: name, activate, deactivate }}>
            {children}
        </Ctx.Provider>
    );
}

export function useHistoricalDb() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useHistoricalDb fora do HistoricalDbProvider');
    return ctx;
}
