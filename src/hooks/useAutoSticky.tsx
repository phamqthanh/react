import React, { useEffect, useRef, useState } from "react";
import autoSticky, { Options } from "../core/autoSticky";

export interface UseAutoStickyProps extends Options {
  minWidth?: number;
}
function getSizeWindow() {
  if (typeof window !== "undefined") {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}
export function useAutoSticky<T extends Element>(
  options?: UseAutoStickyProps
): [React.RefObject<T>] {
  const element = useRef<T>(null);
  const [size, setSize] = useState<{ width: number; height: number }>(getSizeWindow());

  useEffect(() => {
    let interval: number | undefined;
    let isPending: boolean;

    const handleResize = () => {
      isPending = true;

      if (!interval) {
        isPending = false;
        setSize(getSizeWindow());

        interval = self.setInterval(() => {
          if (!isPending) {
            self.clearInterval(interval!);
            interval = undefined;
            return;
          }

          isPending = false;
          setSize(getSizeWindow());
        }, 300);
      }
    };

    options?.minWidth && window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (!options?.minWidth || size.width > options.minWidth)
      if (element.current instanceof HTMLElement) return autoSticky(element.current, options);
  }, [options, size.width]);

  return [element];
}

export default useAutoSticky;
