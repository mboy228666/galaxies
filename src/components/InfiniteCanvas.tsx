import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useViewportStore } from '../store';
import { motion } from 'framer-motion';

interface InfiniteCanvasProps {
  children: React.ReactNode;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { x, y, zoom, setViewport } = useViewportStore();
  const [isPanning, setIsPanning] = useState(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    let newZoom = zoom * Math.exp(delta);

    // Clamp zoom
    newZoom = Math.max(0.01, Math.min(newZoom, 10));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new X and Y to zoom strictly towards the mouse cursor
    const zoomFactor = newZoom / zoom;
    const newX = mouseX - (mouseX - x) * zoomFactor;
    const newY = mouseY - (mouseY - y) * zoomFactor;

    setViewport(newX, newY, newZoom);
  }, [x, y, zoom, setViewport]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 || e.button === 1) { // Left or middle click
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setViewport(x + e.movementX, y + e.movementY, zoom);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-gray-900 cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        className="absolute origin-top-left"
        style={{ x, y, scale: zoom }}
        transition={{ type: 'tween', duration: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
