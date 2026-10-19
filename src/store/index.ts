import { create } from 'zustand';

export type NodeType = 'folder' | 'video' | 'image' | 'script' | 'task' | 'note';

export interface NodeData {
  id: string;
  type: NodeType;
  parentId: string | null;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  metadata?: any;
}

interface VaultState {
  nodes: NodeData[];
  setNodes: (nodes: NodeData[]) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  addNode: (node: NodeData) => void;
  deleteNode: (id: string) => void;
  clearAll: () => void;
}

// Debounce logic for file saving to prevent rapid overwrites
let saveTimeout: any = null;
const debouncedSave = (nodes: NodeData[]) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if ((window as any).electron) {
      (window as any).electron.writeVault({ nodes });
    }
  }, 300);
};

export const useVaultStore = create<VaultState>((set) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  updateNode: (id, data) => set(state => {
    const newNodes = state.nodes.map(n => n.id === id ? { ...n, ...data } : n);
    debouncedSave(newNodes);
    return { nodes: newNodes };
  }),
  addNode: (node) => set(state => {
    const newNodes = [...state.nodes, node];
    debouncedSave(newNodes);
    return { nodes: newNodes };
  }),
  deleteNode: (id) => set(state => {
    // recursively delete children if it's a folder
    const toDelete = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      state.nodes.forEach(n => {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          added = true;
        }
      });
    }
    const newNodes = state.nodes.filter(n => !toDelete.has(n.id));
    debouncedSave(newNodes);
    return { nodes: newNodes };
  }),
  clearAll: () => {
    set({ nodes: [] });
    debouncedSave([]);
  }
}));

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
  setViewport: (x: number, y: number, zoom: number) => void;
}

export const useViewportStore = create<ViewportState>((set) => ({
  x: 0,
  y: 0,
  zoom: 1,
  setViewport: (x, y, zoom) => set({ x, y, zoom }),
}));
