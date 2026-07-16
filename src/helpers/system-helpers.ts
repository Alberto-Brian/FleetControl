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

