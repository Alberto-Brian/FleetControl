import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import { runMigrations } from './lib/db/migrate';

const inDevelopment = process.env.NODE_ENV === "development";

if (require("electron-squirrel-startup")) {
    app.quit();
}

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

// Criar janela de splash
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true, 
    resizable: false, 
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Carregar o arquivo HTML do splash diretamente
  const splashPath = inDevelopment 
    ? path.join(__dirname, '../../src/renderer/public/splash.html')
    : path.join(__dirname, '../renderer/public/splash.html');
  
  splashWindow.loadFile(splashPath);
  
  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });
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
    createSplashWindow();

    // 2. Executar tarefas pesadas (migrations)
    try {
        await runMigrations();
    } catch (error) {
        console.error('Error running migrations:', error);
    }

    // 3. Criar janela principal (ela só vai aparecer quando estiver pronta)
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