import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import * as r from "path";
import * as i from "fs";
import * as a from "chokidar";
//#region electron/main.ts
var o = process.env.NODE_ENV === "development" || !t.isPackaged, s = null, c = null, l = r.join(t.getPath("userData"), "vault_data.json"), u = r.join(t.getPath("userData"), "assets"), d = r.join(t.getPath("userData"), "inbox");
i.existsSync(u) || i.mkdirSync(u, { recursive: !0 }), i.existsSync(d) || i.mkdirSync(d, { recursive: !0 });
function f() {
	s = new e({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: r.join(__dirname, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), o ? (s.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173"), s.webContents.openDevTools()) : s.loadFile(r.join(__dirname, "../dist/index.html")), p();
}
function p() {
	c && c.close(), i.existsSync(l) || i.writeFileSync(l, JSON.stringify({ nodes: [] }, null, 2)), c = a.watch(l, {
		persistent: !0,
		awaitWriteFinish: !0
	}), c.on("change", () => {
		if (s) try {
			let e = i.readFileSync(l, "utf8"), t = JSON.parse(e);
			s.webContents.send("vault-changed", t);
		} catch (e) {
			console.error("Error reading vault_data.json on change:", e);
		}
	});
}
t.whenReady().then(() => {
	n.handle("read-vault", async () => {
		try {
			i.existsSync(l) || i.writeFileSync(l, JSON.stringify({ nodes: [] }, null, 2));
			let e = i.readFileSync(l, "utf8");
			return JSON.parse(e);
		} catch (e) {
			return console.error("Failed to read vault", e), { nodes: [] };
		}
	}), n.handle("write-vault", async (e, t) => {
		try {
			return i.writeFileSync(l, JSON.stringify(t, null, 2)), !0;
		} catch (e) {
			return console.error("Failed to write vault", e), !1;
		}
	}), f(), t.on("activate", () => {
		e.getAllWindows().length === 0 && f();
	});
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
export {};
