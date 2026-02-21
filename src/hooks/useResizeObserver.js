import React, { useEffect, useState } from 'react';

export default function useResizeObserver(ref) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
      if (!Array.isArray(entries) || !entries.length) return;
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          if (width !== dimensions.width || height !== dimensions.height) {
              setDimensions({ width, height });
          }
        }
      });
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      // Pulisci l'observer quando il componente si smonta
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return dimensions;
}