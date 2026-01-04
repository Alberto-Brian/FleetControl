import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import fs from 'fs';
import { dbManager } from './lib/db/db_client';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { runMigrations } from './lib/db/migrate';

const inDevelopment = process.env.NODE_ENV === "development";

if (require("electron-squirrel-startup")) {
    app.quit();
}

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

// Criar janela de splash
async function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true, 
    resizable: false, 
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await splashWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/splash.html`);
    //  const splashPath = path.join(__dirname, '../../src/renderer/public/splash.html');
    // splashWindow.loadFile(splashPath);
  } else {
    const splashPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/splash.html`);
    await splashWindow.loadFile(splashPath);
  }
}

async function createWindow() {
    const preload = path.join(__dirname, "preload.js");
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600, 
        show: false, // NÃO mostrar até estar pronta
        webPreferences: {
            devTools: false, //inDevelopment,
            contextIsolation: true,
            nodeIntegration: true, 
            nodeIntegrationInSubFrames: false,
            preload: preload,
        },
        titleBarStyle: "hidden",
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
        }, 1500); // Delay de 1.5 segundos 
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Inicializar app
app.whenReady().then(async () => {
    // 1. Mostrar splash imediatamente
    await createSplashWindow();

    //2. Inicializar banco
  const db = dbManager.initialize();
  
  try {
        const isDev = process.env.NODE_ENV === 'development';
        const migrationsFolder = isDev
            ? './drizzle'
            : path.join(process.resourcesPath, 'drizzle');
        
        console.log('📂 Migrations folder:', migrationsFolder);
        migrate(db, { migrationsFolder });
        console.log('✅ Migrations completed!');
    } catch (error) {
        console.error('⚠️ Erro nas migrations:', error);
        // Continuar mesmo com erro
    }
  
  //3. Verificar se precisa rotacionar
  if (dbManager.shouldRotate()) {
    dbManager.rotate();
  }


    // 4. Criar janela principal (ela só vai aparecer quando estiver pronta)
    await createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});