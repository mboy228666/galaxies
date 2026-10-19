import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electron", {
	readVault: () => t.invoke("read-vault"),
	writeVault: (e) => t.invoke("write-vault", e),
	onVaultChange: (e) => {
		let n = (t, n) => e(n);
		return t.on("vault-changed", n), () => {
			t.removeListener("vault-changed", n);
		};
	}
});
//#endregion
export {};
