import { app, BrowserWindow, ipcMain, dialog } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import { dbManager } from './lib/db/db_client';
import { VersionManager } from './system/version_manager';
import { LicenseManager } from './system/license_manager';
import { APP_NAME } from "@/system/system.config";

const inDevelopment = process.env.NODE_ENV === "development";

if (require("electron-squirrel-startup")) {
    app.quit();
}

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let licenseWindow: BrowserWindow | null = null;

const licenseManager = new LicenseManager();

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
 * Fechar splash com segurança
 */
function closeSplash() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    splashWindow = null;
  }
}

/**
 * Criar janela de ativação de licença (como modal)
 */
async function createLicenseWindow() {
  const preload = path.join(__dirname, "preload.js");

  licenseWindow = new BrowserWindow({
    width: 600,
    height: 550,
    resizable: false,
    frame: false,
    center: true,
    show: true,  // ⭐ Mostrar imediatamente
    modal: true,  // ⭐ Modal sobre a janela principal
    parent: mainWindow || undefined,  // ⭐ Filho da janela principal
    alwaysOnTop: true,  // ⭐ Sempre no topo
    icon: path.join(app.getAppPath(), 'build', 'icons', 'icon.png'),
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
  });

  // Listeners de licença já são registados no arranque da main window

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await licenseWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/license.html`);
  } else {
    const licensePath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/license.html`);
    await licenseWindow.loadFile(licensePath);
  }

  if (inDevelopment) {
    licenseWindow.webContents.openDevTools();
  }

  licenseWindow.on('closed', () => {
    licenseWindow = null;
    // Se fechar sem ativar, sair do app
    app.quit();
  });
}

/**
 * Criar janela principal
 */
async function createMainWindow() {
    const preload = path.join(__dirname, "preload.js");
    
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(app.getAppPath(), 'build', 'icons', 'icon.png'),
        show: false,
        webPreferences: {
            devTools: false,
            contextIsolation: true,
            nodeIntegration: false,
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
            checkLicenseAfterLoad();
        }, 1500);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        // Se fechar janela principal, fechar tudo
        if (licenseWindow && !licenseWindow.isDestroyed()) {
            licenseWindow.close();
        }
        app.quit();
    });
}

/**
 * Verificar licença após a janela principal estar aberta
 */
async function checkLicenseAfterLoad() {
  console.log('🔍 Verificando licença...');

  try {
    const licenseResult = await licenseManager.checkExistingLicense();

    if (licenseResult.isValid) {
      console.log('✅ Licença válida!');
      console.log(`   Cliente: ${licenseResult.clientName}`);
      console.log(`   Tipo: ${licenseResult.licenseType}`);
      console.log(`   Expira em: ${licenseResult.daysRemaining} dias`);

      // Aviso se licença está perto de expirar
      if (licenseResult.daysRemaining && licenseResult.daysRemaining <= 7) {
        console.warn(`⚠️  ATENÇÃO: Licença expira em ${licenseResult.daysRemaining} dias!`);
        
        // Pode mostrar um dialog ou notificação
        setTimeout(() => {
          dialog.showMessageBox(mainWindow!, {
            type: 'warning',
            title: 'Licença Expirando',
            message: `Sua licença expira em ${licenseResult.daysRemaining} dias!`,
            detail: 'Entre em contacto para renovar sua licença.',
            buttons: ['OK']
          });
        }, 2000);
      }

      // ✅ Tudo OK - continua normalmente
    } else {
      console.log('❌ Licença inválida:', licenseResult.error);
      
      // ⭐ Aguardar 1.5s e mostrar modal de ativação
      setTimeout(() => {
        createLicenseWindow();
      }, 7000);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar licença:', error);
    
    // Em caso de erro, mostrar modal de ativação
    setTimeout(() => {
      createLicenseWindow();
    }, 1500);
  }
}

/**
 * Listener para quando licença for ativada
 */
ipcMain.on('license:activated', async () => {
  console.log('🎉 Licença ativada com sucesso!');
  
  // Fechar janela de ativação
  if (licenseWindow && !licenseWindow.isDestroyed()) {
    licenseWindow.close();
    licenseWindow = null;
  }

  // Verificar licença novamente para exibir info
  const licenseResult = await licenseManager.checkExistingLicense();
  if (licenseResult.isValid) {
    console.log('✅ Licença confirmada:');
    console.log(`   Cliente: ${licenseResult.clientName}`);
    console.log(`   Tipo: ${licenseResult.licenseType}`);
    
    // Mostrar mensagem de sucesso
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Licença Ativada',
      message: 'Licença ativada com sucesso!',
      detail: `Cliente: ${licenseResult.clientName}\nTipo: ${licenseResult.licenseType}`,
      buttons: ['OK']
    });
  }
});

/**
 * Inicializar aplicação
 */
app.whenReady().then(async () => {
  try {
    console.log('🚀 Inicializando aplicação...');

    // 1. Mostrar splash imediatamente
    await createSplashWindow();

    // 2. Inicializar banco de dados
    console.log('📊 Inicializando banco de dados...');
    const db = dbManager.initialize();
    console.log('✅ Banco de dados inicializado');

    // 3. Gerenciar versão da aplicação
    console.log('🔢 Verificando versão...');
    const versionManager = new VersionManager(db);
    const versionInfo = await versionManager.getVersionInfo();

    console.log('📋 Informações de versão:', versionInfo);

    if (versionInfo.isFirstInstall) {
      console.log('🆕 Primeira instalação detectada');
      await versionManager.registerInstallation(APP_NAME);
    } else if (versionInfo.needsUpgrade) {
      console.log(`🔄 Atualização detectada: ${versionInfo.installed} → ${versionInfo.current}`);
      await versionManager.updateVersion();
      console.log('✅ Versão atualizada no banco');
    } else {
      console.log(`✅ Sistema atualizado: v${versionInfo.current}`);
    }

    // 4. Verificar se precisa rotacionar banco
    if (dbManager.shouldRotate()) {
      console.log('🔄 Rotacionando banco de dados...');
      dbManager.rotate();
    }

    // 5. ⭐ Criar janela principal (licença será verificada depois)
    await createMainWindow();

    console.log('✅ Aplicação inicializada com sucesso!');

  } catch (error) {
    console.error('❌ Erro fatal ao inicializar aplicação:', error);
    
    closeSplash();
    
    dialog.showErrorBox(
      'Erro de Inicialização',
      'Ocorreu um erro ao inicializar a aplicação. Por favor, entre em contacto com o suporte.\n\n' +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}`
    );
    
    app.quit();
  }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
