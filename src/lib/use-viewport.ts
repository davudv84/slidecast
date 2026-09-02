"use client";

import { useEffect, useState } from "react";

/**
 * Viewport width, measured after mount. `ready` stays false during SSR and the
 * first paint so width-dependent layout (the editor canvas) never renders at a
 * guessed size.
 */
export function useViewport() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    ready: width > 0,
    narrow: width > 0 && width < 768,
    mid: width > 0 && width < 1100,
  };
}
