import { useEffect, useState } from 'react';

export default function useResizeObserver(ref) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setDimensions(prev =>
            prev.width === width && prev.height === height ? prev : { width, height }
          );
        }
      });
    });

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, [ref]);

  return dimensions;
}