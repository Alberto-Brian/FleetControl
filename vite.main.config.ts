// vite.main.config.ts

import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig, mergeConfig, loadEnv } from "vite";
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from "./vite.base.config";
import path from "path";

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<"build">;
    const { forgeConfigSelf, root, mode } = forgeEnv;
    const define = getBuildDefine(forgeEnv);

    // Achado real (2026-09-22): nada no processo principal chama dotenv —
    // process.env.API_URL nunca foi carregado do .env em runtime, nem em dev
    // nem no pacote (o pacote nem sequer leva o .env consigo). server-config.ts
    // caía sempre no fallback 'http://localhost:3001', que não existe fora da
    // máquina de desenvolvimento — a app parecia "com dados zerados" porque
    // login/PowerSync nunca conseguiam ligar. Cravado aqui, tal como o
    // VITE_API_URL do renderer já é cravado automaticamente pelo Vite.
    const desktopEnv = loadEnv(mode, root || process.cwd(), 'API_URL');
    define['process.env.API_URL'] = JSON.stringify(desktopEnv.API_URL || '');
    const config: UserConfig = {
        build: {
            lib: {
                entry: forgeConfigSelf.entry!,
                fileName: () => "[name].js",
                formats: ["cjs"],
            },
            rollupOptions: {
                external,
            },
        },
        plugins: [pluginHotRestart("restart")],
        define,
        resolve: {
            // Load the Node.js entry.
            mainFields: ["module", "jsnext:main", "jsnext"],
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };

    return mergeConfig(getBuildConfig(forgeEnv), config);
});
