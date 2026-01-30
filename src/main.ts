// src/main.ts
import { app, dialog, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import { initializeDatabase, getDbManager } from './lib/db/db_client';
import { VersionManager } from '@/system/version_manager';
import { APP_NAME } from "@/system/system.config";

const inDevelopment = process.env.NODE_ENV === "development";

if (require("electron-squirrel-startup")) {
    app.quit();
}

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

/**
 * Criar janela de splash
 */
async function createSplashWindow() {
  const preload = path.join(__dirname, "preload.js");
  splashWindow = new BrowserWindow({
    width: 500,
    height: 370,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    show: true,
    icon: path.join(app.getAppPath(), 'build', 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preload,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await splashWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/splash.html`);
  } else {
    const splashPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/splash.html`);
    await splashWindow.loadFile(splashPath);
  }
}

/**
 * Criar janela principal
 */
async function createWindow() {
    const SPLASH_DELAY = 1500;
    const preload = path.join(__dirname, "preload.js");
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(app.getAppPath(), 'build', 'icons', 'icon.png'),
        show: false,
        webPreferences: {
            devTools: true,
            contextIsolation: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: false,
            preload: preload,
        },
        frame: false,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 12, y: 12 },
    });
    
    registerListeners(mainWindow);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        await mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
        );
    }

    let shown = false;
    mainWindow.once('ready-to-show', () => {
      console.log("📺 Evento ready-to-show disparado");
        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
                splashWindow = null;
            }
            mainWindow?.show();
            if (inDevelopment) {
                mainWindow?.webContents.openDevTools();
            }
            shown = true;
        }, SPLASH_DELAY);
    });

    mainWindow.webContents.once('did-finish-load', () => {
      if (!shown) {
        console.log("📺 Evento did-finish-load disparado (fallback)");
        if (splashWindow && !splashWindow.isDestroyed()) {
          splashWindow.close();
          splashWindow = null;
        }
        mainWindow?.show();
        if (inDevelopment) {
          mainWindow?.webContents.openDevTools();
        }
        shown = true;
      }
    });

    setTimeout(() => {
      if (!shown) {
        console.log("📺 Timeout final disparado (fallback)");
        if (splashWindow && !splashWindow.isDestroyed()) {
          splashWindow.close();
          splashWindow = null;
        }
        mainWindow?.show();
        if (inDevelopment) {
          mainWindow?.webContents.openDevTools();
        }
        shown = true;
      }
    }, SPLASH_DELAY + 6000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Inicializar aplicação - ORDEM GARANTIDA DE EXECUÇÃO
 */
app.whenReady().then(async () => {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          🚀 INICIALIZANDO APLICAÇÃO                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 1: Mostrar splash imediatamente
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 1: Interface ─────────────────────────────────────┐');
    console.log('│ 🎨 Criando janela de splash...');
    await createSplashWindow();
    console.log('│ ✅ Splash criada');
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 2: Inicializar DatabaseManager (SEM executar backups)
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 2: Database ──────────────────────────────────────┐');
    console.log('│ 📊 Inicializando DatabaseManager...');
    const db = initializeDatabase(100, 5); // maxSize=100MB, maxRecords=5
    console.log('│ ✅ DatabaseManager inicializado');
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 3: Gerenciar versão da aplicação
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 3: Versão ────────────────────────────────────────┐');
    console.log('│ 🔢 Verificando versão...');
    const versionManager = new VersionManager(db);
    const versionInfo = await versionManager.getVersionInfo();

    console.log('│ 📋 Informações:', {
      instalada: versionInfo.installed,
      atual: versionInfo.current,
      primeiraInstalacao: versionInfo.isFirstInstall,
      precisaAtualizar: versionInfo.needsUpgrade
    });

    if (versionInfo.isFirstInstall) {
      console.log('│ 🆕 Primeira instalação detectada');
      await versionManager.registerInstallation(APP_NAME);
      console.log('│ ✅ Instalação registrada');
    } else if (versionInfo.needsUpgrade) {
      console.log(`│ 🔄 Atualização detectada: ${versionInfo.installed} → ${versionInfo.current}`);
      await versionManager.updateVersion();
      console.log('│ ✅ Versão atualizada');
    } else {
      console.log(`│ ✅ Sistema atualizado: v${versionInfo.current}`);
    }
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 4: Verificar necessidade de rotação (SEM executar ainda)
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 4: Rotação de Database ───────────────────────────┐');
    const dbManager = getDbManager();
    const needsRotation = dbManager.shouldRotate();
    
    if (needsRotation) {
      console.log('│ 🔄 Rotação necessária - executando...');
      await dbManager.rotate(true); // Aplicar master tables
      console.log('│ ✅ Rotação concluída');
    } else {
      console.log('│ ℹ️  Rotação não necessária');
    }
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 5: Verificar e executar backup automático (ÚLTIMA ETAPA)
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 5: Backup Automático ─────────────────────────────┐');
    console.log('│ 🔄 Verificando necessidade de backup automático...');
    await dbManager.checkAndRunAutoBackup();
    console.log('│ ✅ Verificação de backup concluída');
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // ETAPA 6: Criar janela principal
    // ═══════════════════════════════════════════════════════════════════
    console.log('┌─ ETAPA 6: Janela Principal ──────────────────────────────┐');
    console.log('│ 🪟 Criando janela principal...');
    await createWindow();
    console.log('│ ✅ Janela principal criada');
    console.log('└──────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ APLICAÇÃO INICIALIZADA COM SUCESSO            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          ❌ ERRO FATAL NA INICIALIZAÇÃO                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.error(error);
    
    dialog.showErrorBox(
      'Erro de Inicialização',
      'Ocorreu um erro ao inicializar a aplicação. Por favor, entre em contacto com o suporte.\n\n' +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}`
    );
    
    app.quit();
  }
});

app.on("window-all-closed", () => {
  console.log('🔒 Fechando aplicação...');
  
  try {
    const dbManager = getDbManager();
    dbManager.close();
    console.log('✅ Database fechado corretamente');
  } catch (error) {
    console.error('⚠️ Erro ao fechar database:', error);
  }
  
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});