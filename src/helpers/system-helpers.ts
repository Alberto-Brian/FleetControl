export async function getSystemVersion() {
    return await window.system.getSystemVersion();
}
export async function getSchemaVersion() {
    return await window.system.getSchemaVersion();
}

export async function forceDbRotation() {
    return await window.system.forceDbRotation();
}

export async function listDatabases() {
    return await window.system.listDatabases();
}

export async function getDatabaseStats(filepath: string) {
    return await window.system.getDatabaseStats(filepath);
}

export async function setHistoricalDb(filepath: string | null) {
    return await window.system.setHistoricalDb(filepath);
}

export async function getHistoricalDb() {
    return await window.system.getHistoricalDb();
}

export async function deleteDatabase(filepath: string, password: string) {
    return await window.system.deleteDatabase(filepath, password);
}

export async function listBackupDatabases() {
    return await window.system.listBackupDatabases();
}

