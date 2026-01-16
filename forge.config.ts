import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { APP_NAME } from "./src/system/system.config";

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        // Ícone principal do aplicativo (sem extensão)
        // Windows: procura .ico
        // macOS: procura .icns
        // Linux: procura .png
        icon: './build/icons/icon',
        
        // Nome do aplicativo
        name: APP_NAME,
        
        // Configurações adicionais do macOS
        appBundleId: 'com.fleetcontrol.id',
        appCategoryType: 'public.app-category.productivity',
        extraResource: [
            'drizzle',
        ],

        // Configurações específicas do macOS
        osxSign: {}, // Se for assinar o app
        
        // Informações do executável Windows
        executableName: APP_NAME,
        
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            setupIcon: './build/icons/icon.ico',
            //iconUrl: './build/icons/icon.ico', // URL pública do ícone
            // Nome do executável
            name: APP_NAME,
            authors: 'Alberto Kiowa Massanza',
            description: 'Sistema de Gestão de Frotas',
        }),
        new MakerZIP({}, ["darwin"]),
        new MakerRpm({
            options: {
                icon: './build/icons/icon.png',
                // Informações do pacote
                name: APP_NAME,
                productName: APP_NAME,
                genericName: 'Aplicativo',
                description: 'Sistema de Gestão de Frotas',
                categories: ['Utility'],
                
                // Dependências
                bin: APP_NAME,
            }
        }),
        new MakerDeb({
            options: {
                icon: './build/icons/icon.png',

                 // Informações do pacote
                name: APP_NAME,
                productName: APP_NAME,
                genericName: 'Aplicativo',
                description: 'Sistema de Gestão de Frotas',
                categories: ['Utility'],
                
                // Informações de manutenção
                maintainer: 'Alberto Kiowa Massanza <albertokiowa10@gmail.com>',
                homepage: 'https://github.com/alberto-kiowa/electric-drizzle',
                
                // Dependências do sistema
                section: 'utils',
            }
        }),
    ],
    plugins: [
        new VitePlugin({
            // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
            // If you are familiar with Vite configuration, it will look really familiar.
            build: [
                {
                    // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                    entry: "src/main.ts",
                    config: "vite.main.config.ts",
                },
                {
                    entry: "src/preload.ts",
                    config: "vite.preload.config.ts",
                },
            ],
            renderer: [
                {
                    name: "main_window",
                    config: "vite.renderer.config.ts",
                },
            ],
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;