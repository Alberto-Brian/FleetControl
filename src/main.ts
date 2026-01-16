import { app, dialog, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import { dbManager } from './lib/db/db_client';
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
    const preload = path.join(__dirname, "preload.js");
    
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(app.getAppPath(), 'build', 'icons', 'icon.png'),
        show: false, // Não mostrar até estar pronta
        webPreferences: {
            devTools: true, // inDevelopment, 
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

    // Quando estiver pronta, fechar splash e mostrar janela principal
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
                splashWindow = null;
            }
            mainWindow?.show();
            if (inDevelopment) {
                mainWindow?.webContents.openDevTools();
            }
        }, 1500);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Inicializar aplicação
 */
app.whenReady().then(async () => {
  try {
    console.log('🚀 Inicializando aplicação...');
    // 1. Mostrar splash imediatamente
    await createSplashWindow();

    // 2. Inicializar banco de dados
    // O DatabaseManager automaticamente aplica migrations
    console.log('📊 Inicializando banco de dados...');
    const db = dbManager.initialize();
    console.log('✅ Banco de dados inicializado');

    // 3. Gerenciar versão da aplicação
    console.log('🔢 Verificando versão...');
    const versionManager = new VersionManager(db);
    const versionInfo = await versionManager.getVersionInfo();

    console.log('📋 Informações de versão:', versionInfo);

    if (versionInfo.isFirstInstall) {
      // Primeira instalação
      console.log('🆕 Primeira instalação detectada');
      await versionManager.registerInstallation(APP_NAME);
    } else if (versionInfo.needsUpgrade) {
      // Atualização detectada
      console.log(`🔄 Atualização detectada: ${versionInfo.installed} → ${versionInfo.current}`);
      await versionManager.updateVersion();
      console.log('✅ Versão atualizada no banco');
    } else {
      console.log(`✅ Sistema atualizado: v${versionInfo.current}`);
    }

    // 4. Verificar se precisa rotacionar banco
    if (dbManager.shouldRotate()) {
      console.log('🔄 Rotacionando banco de dados...');
      // dbManager.rotate();
      await dbManager.rotateWithMasters([
       { 
        tableName: 'users', 
        customQuery: 'SELECT * FROM users WHERE status = 1',
        excludeColumns: ['created_at', 'updated_at']
      },
      { tableName: 'clients', copyAll: true }
    ]);
    }

    // 5. Criar janela principal
    await createWindow();

    console.log('✅ Aplicação inicializada com sucesso!');

  } catch (error) {
    console.error('❌ Erro fatal ao inicializar aplicação:', error);
    
    // Mostrar mensagem de erro ao usuário
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Erro de Inicialização',
      'Ocorreu um erro ao inicializar a aplicação. Por favor, entre em contacto com o suporte.\n\n' +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}`
    );
    
    app.quit();
  }
});

app.on("window-all-closed", () => {
  dbManager.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});