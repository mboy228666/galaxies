import { type NodeData } from '../store';

// Basic Zero Collision Layout
// We calculate positions of nodes dynamically or apply repulsion
export function applyZeroCollisionLayout(nodes: NodeData[], expandedFolderId: string | null): NodeData[] {
  // If no dynamic calculation is strictly needed right away, we just return the nodes.
  // The concept is: when a folder expands, siblings push outwards.

  if (!expandedFolderId) return nodes;

  const PUSH_DISTANCE = 500;

  const expandedNode = nodes.find(n => n.id === expandedFolderId);
  if (!expandedNode) return nodes;

  return nodes.map(node => {
    if (node.id === expandedFolderId || node.parentId === expandedFolderId) {
      return node;
    }

    // Simple logic: push siblings outwards away from the expanded node
    if (node.parentId === expandedNode.parentId) {
      const dx = node.x - expandedNode.x;
      const dy = node.y - expandedNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PUSH_DISTANCE && dist > 0) {
        const factor = (PUSH_DISTANCE - dist) / dist;
        return {
          ...node,
          x: node.x + dx * factor,
          y: node.y + dy * factor,
        };
      }
    }
    return node;
  });
}
