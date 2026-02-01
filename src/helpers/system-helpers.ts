export async function getSystemVersion() {
    return await window.system.getSystemVersion();
}
export async function getSchemaVersion() {
    return await window.system.getSchemaVersion();
}

export async function forceDbRotation() {
    return await window.system.forceDbRotation();
}

