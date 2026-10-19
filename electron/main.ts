import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let watcher: chokidar.FSWatcher | null = null;

const vaultPath = path.join(app.getPath('userData'), 'vault_data.json');
const assetsPath = path.join(app.getPath('userData'), 'assets');
const inboxPath = path.join(app.getPath('userData'), 'inbox');

// Ensure directories exist
if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath, { recursive: true });
if (!fs.existsSync(inboxPath)) fs.mkdirSync(inboxPath, { recursive: true });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  setupWatcher();
}

function setupWatcher() {
  if (watcher) watcher.close();

  if (!fs.existsSync(vaultPath)) {
    fs.writeFileSync(vaultPath, JSON.stringify({ nodes: [] }, null, 2));
  }

  watcher = chokidar.watch(vaultPath, {
    persistent: true,
    awaitWriteFinish: true,
  });

  watcher.on('change', () => {
    if (mainWindow) {
      try {
        const data = fs.readFileSync(vaultPath, 'utf8');
        const parsed = JSON.parse(data);
        mainWindow.webContents.send('vault-changed', parsed);
      } catch (err) {
        console.error('Error reading vault_data.json on change:', err);
      }
    }
  });
}

app.whenReady().then(() => {
  ipcMain.handle('read-vault', async () => {
    try {
      if (!fs.existsSync(vaultPath)) {
        fs.writeFileSync(vaultPath, JSON.stringify({ nodes: [] }, null, 2));
      }
      const data = fs.readFileSync(vaultPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to read vault', err);
      return { nodes: [] };
    }
  });

  ipcMain.handle('write-vault', async (_, data) => {
    try {
      fs.writeFileSync(vaultPath, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('Failed to write vault', err);
      return false;
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
