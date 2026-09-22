// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/powersync/powersync-worker-entry.ts
// ========================================
//
// Achado real (2026-09-22): o worker padrão do @powersync/node
// (node_modules/@powersync/node/lib/db/DefaultWorker.js) calcula o
// caminho do binário nativo (powersync_x64.dll/.so/.dylib) via
// `url.fileURLToPath(new URL('../<ficheiro>', import.meta.url))` —
// relativo ao PRÓPRIO ficheiro que está a correr. Dentro de um app.asar
// isto resolve sempre para o caminho VIRTUAL do arquivo
// (.../app.asar/node_modules/@powersync/node/lib/<ficheiro>), nunca para
// o ficheiro real em disco que o forge.config.ts já desempacota
// (packagerConfig.asar.unpack) — mesmo quando a ENTRADA do worker (este
// tipo de .js) também está listada no glob de unpack, porque a leitura de
// módulos (require/import) do Electron continua sempre transparente pelo
// caminho .asar/..., é só o NOME que fica "virtual". Como
// Database.loadExtension() do better-sqlite3 é uma chamada directa ao SO
// (LoadLibrary no Windows), não passa pelo fs virtual/patchado do
// Electron — falha com "Impossível localizar o módulo especificado"
// mesmo com o binário genuinamente presente em disco.
//
// Este ficheiro substitui o worker por omissão (ligado via
// `database.openWorker` em client.ts) só para poder fornecer um
// `extensionPath()` que usa o caminho REAL, calculado no processo
// principal via `process.resourcesPath` (uma API do Electron que nunca
// sofre virtualização do asar) e passado aqui via `workerData` — em vez
// do cálculo relativo por omissão do SDK, que quebra dentro de um
// pacote .asar.
//
// `@powersync/node/worker.js` é o subpath PÚBLICO do pacote (confirmado
// no seu package.json `exports`) que reexporta exactamente
// `startPowerSyncWorker`/`getPowerSyncExtensionFilename` — pensado pelos
// próprios autores do SDK para este tipo de bundling/empacotamento
// personalizado, não uma importação interna frágil.
import { workerData } from "node:worker_threads";
import path from "node:path";

// tsc (moduleResolution: "node" neste projecto) não entende o mapa
// "exports" de subpaths do package.json — o subpath "./worker.js" é real
// e resolve correctamente em runtime (Node/Electron), confirmado
// directamente no package.json do pacote (types em lib/worker.d.ts). O
// `as any` evita que o tsc tente resolver estaticamente o especificador
// (que falharia pela mesma razão), sem mudar moduleResolution do projecto
// inteiro por causa de um único import.
interface PowerSyncWorkerModule {
    startPowerSyncWorker(options?: Partial<{ extensionPath: () => string }>): void;
    getPowerSyncExtensionFilename(): string;
}

async function main() {
    const { startPowerSyncWorker, getPowerSyncExtensionFilename } = (await import(
        "@powersync/node/worker.js" as any
    )) as PowerSyncWorkerModule;
    const { extensionDir } = workerData as { extensionDir: string };

    startPowerSyncWorker({
        extensionPath: () => path.join(extensionDir, getPowerSyncExtensionFilename()),
    });
}

void main();
