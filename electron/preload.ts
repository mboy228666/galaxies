import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  readVault: () => ipcRenderer.invoke('read-vault'),
  writeVault: (data: any) => ipcRenderer.invoke('write-vault', data),
  onVaultChange: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('vault-changed', subscription);
    return () => {
      ipcRenderer.removeListener('vault-changed', subscription);
    };
  }
});
